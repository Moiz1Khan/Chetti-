import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "npm:jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function chunkText(text: string, maxChunkSize = 800, overlap = 100): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).trim().length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.ceil(overlap / 5));
      currentChunk = overlapWords.join(" ") + " " + sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length === 0 && text.trim().length > 0) {
    for (let i = 0; i < text.length; i += maxChunkSize - overlap) {
      chunks.push(text.slice(i, i + maxChunkSize).trim());
    }
  }

  return chunks.filter((c) => c.length > 10);
}

function formatUrl(url: string): string {
  let formatted = url.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = `https://${formatted}`;
  }
  return formatted;
}

async function extractTextFromUrl(rawUrl: string): Promise<string> {
  const url = formatUrl(rawUrl);
  console.log(`[process-knowledge] Fetching URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL (${response.status}): ${url}`);
  }

  const html = await response.text();
  console.log(`[process-knowledge] Fetched ${html.length} bytes of HTML`);

  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");

  text = text
    .replace(/<\/?(h[1-6]|p|div|section|article|li|br|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#?\w+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  const lines = text.split("\n").filter((line) => line.trim().length > 20);
  text = lines.join("\n").trim();

  console.log(`[process-knowledge] Extracted ${text.length} chars of text`);
  return text;
}

async function extractTextFromDocx(data: ArrayBuffer): Promise<string> {
  console.log(`[process-knowledge] Extracting text from DOCX (${data.byteLength} bytes)`);
  const zip = await JSZip.loadAsync(data);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  
  if (!documentXml) {
    throw new Error("Invalid DOCX file: no word/document.xml found");
  }

  // Extract text from XML, converting paragraph and break elements to newlines
  let text = documentXml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<w:tab[^>]*\/>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  console.log(`[process-knowledge] Extracted ${text.length} chars from DOCX`);
  return text;
}

async function extractTextFromPdf(data: ArrayBuffer): Promise<string> {
  console.log(`[process-knowledge] Extracting text from PDF (${data.byteLength} bytes)`);
  
  // Simple PDF text extraction - parse text objects from the PDF stream
  const bytes = new Uint8Array(data);
  const content = new TextDecoder("latin1").decode(bytes);
  
  const textParts: string[] = [];
  
  // Extract text between BT (begin text) and ET (end text) operators
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  
  while ((match = btEtRegex.exec(content)) !== null) {
    const textBlock = match[1];
    
    // Extract text from Tj, TJ, ' and " operators
    // Tj: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
      textParts.push(decodePdfString(tjMatch[1]));
    }
    
    // TJ: [(text) num (text) ...] TJ
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(textBlock)) !== null) {
      const arrContent = tjArrMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(arrContent)) !== null) {
        textParts.push(decodePdfString(strMatch[1]));
      }
    }
  }
  
  // Also try to find text in streams (for compressed PDFs)
  // Look for readable text patterns
  if (textParts.length === 0) {
    // Fallback: extract any readable text sequences
    const readableRegex = /[\x20-\x7E]{20,}/g;
    let readableMatch;
    while ((readableMatch = readableRegex.exec(content)) !== null) {
      const text = readableMatch[0].trim();
      if (text.length > 20 && !text.includes(">>") && !text.includes("<<") && !text.includes("/Type")) {
        textParts.push(text);
      }
    }
  }
  
  let text = textParts.join(" ")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  console.log(`[process-knowledge] Extracted ${text.length} chars from PDF`);
  
  if (text.length < 50) {
    throw new Error("Could not extract sufficient text from this PDF. The PDF may be scanned/image-based. Please copy the text manually and use the Text tab instead.");
  }
  
  return text;
}

function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!anonKey) throw new Error("No anon key configured");
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { knowledge_id, type, content, url } = await req.json();
    console.log(`[process-knowledge] Processing ${type} for knowledge ${knowledge_id}`);

    if (!knowledge_id) {
      return new Response(JSON.stringify({ error: "knowledge_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to processing
    await supabase
      .from("knowledge_base")
      .update({ status: "processing" })
      .eq("id", knowledge_id);

    let textContent = "";

    try {
      if (type === "text") {
        textContent = content || "";
      } else if (type === "url") {
        textContent = await extractTextFromUrl(url);
      } else if (type === "file") {
        textContent = content || "";
      } else if (type === "document") {
        // PDF/DOCX: download from storage and extract text
        const { data: knowledgeEntry } = await supabase
          .from("knowledge_base")
          .select("file_url, file_type")
          .eq("id", knowledge_id)
          .single();

        if (!knowledgeEntry?.file_url) {
          throw new Error("No file URL found for this knowledge entry");
        }

        console.log(`[process-knowledge] Downloading file: ${knowledgeEntry.file_url}`);
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("knowledge-files")
          .download(knowledgeEntry.file_url);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download file: ${downloadError?.message || "Unknown error"}`);
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const fileType = knowledgeEntry.file_type?.toUpperCase() || "";

        if (fileType === "PDF") {
          textContent = await extractTextFromPdf(arrayBuffer);
        } else if (fileType === "DOCX" || fileType === "DOC") {
          textContent = await extractTextFromDocx(arrayBuffer);
        } else {
          // Try as text
          textContent = new TextDecoder().decode(arrayBuffer);
        }
      }

      if (!textContent.trim()) {
        throw new Error("No content could be extracted from the source");
      }

      console.log(`[process-knowledge] Got ${textContent.length} chars of content`);

      // Store source content
      await supabase
        .from("knowledge_base")
        .update({ source_content: textContent.slice(0, 50000) })
        .eq("id", knowledge_id);

      // Chunk the text
      const chunks = chunkText(textContent);
      console.log(`[process-knowledge] Created ${chunks.length} chunks`);

      // Delete existing chunks
      await supabase
        .from("knowledge_chunks")
        .delete()
        .eq("knowledge_id", knowledge_id);

      // Insert chunks in batches
      const batchSize = 50;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize).map((chunk, idx) => ({
          knowledge_id,
          user_id: user.id,
          content: chunk,
          chunk_index: i + idx,
          token_count: Math.ceil(chunk.split(/\s+/).length * 1.3),
        }));

        const { error: insertError } = await supabase
          .from("knowledge_chunks")
          .insert(batch);

        if (insertError) {
          console.error("[process-knowledge] Chunk insert error:", insertError);
          throw new Error(`Failed to insert chunks: ${insertError.message}`);
        }
      }

      // Update status to ready
      await supabase
        .from("knowledge_base")
        .update({ status: "ready" })
        .eq("id", knowledge_id);

      console.log(`[process-knowledge] Success: ${chunks.length} chunks created`);

      return new Response(
        JSON.stringify({
          success: true,
          chunks_created: chunks.length,
          total_characters: textContent.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processError) {
      console.error("[process-knowledge] Processing error:", processError);
      await supabase
        .from("knowledge_base")
        .update({ status: "failed" })
        .eq("id", knowledge_id);

      throw processError;
    }
  } catch (e) {
    console.error("[process-knowledge] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
