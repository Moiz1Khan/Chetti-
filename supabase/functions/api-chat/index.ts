import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function normalizeOpenAIModel(input?: string | null) {
  const model = (input || "").toLowerCase();
  if (model.includes("gpt-5")) return "gpt-5-mini";
  if (model.includes("gpt-4o")) return "gpt-4o-mini";
  if (model.includes("gemini")) return "gpt-4o-mini";
  return "gpt-4o-mini";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate API key
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawKey = authHeader.replace("Bearer ", "");
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawKey));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data: apiKey, error: keyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .eq("revoked", false)
      .single();

    if (keyError || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Invalid or revoked API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_used_at
    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKey.id);

    // Parse request body
    const { chatbot_id, message, messages: inputMessages, include_sources } = await req.json();

    if (!chatbot_id || (!message && !inputMessages)) {
      return new Response(
        JSON.stringify({ error: "chatbot_id and message (or messages) are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate chatbot ownership
    const { data: chatbot, error: botError } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", chatbot_id)
      .eq("user_id", apiKey.user_id)
      .single();

    if (botError || !chatbot) {
      return new Response(
        JSON.stringify({ error: "Chatbot not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages array
    const chatMessages = inputMessages
      ? inputMessages
      : [{ role: "user", content: message }];

    // RAG: retrieve relevant knowledge
    let ragContext = "";
    let sources: Array<{ file_name: string; content_preview: string }> = [];

    const { data: links } = await supabase
      .from("chatbot_knowledge")
      .select("knowledge_id")
      .eq("chatbot_id", chatbot_id);

    if (links && links.length > 0) {
      const knowledgeIds = links.map((l: any) => l.knowledge_id);
      const lastUserMsg = [...chatMessages].reverse().find((m: any) => m.role === "user");

      if (lastUserMsg) {
        const { data: chunks } = await supabase.rpc("search_knowledge_chunks", {
          p_user_id: chatbot.user_id,
          p_query: lastUserMsg.content,
          p_knowledge_ids: knowledgeIds,
          p_limit: 5,
        });

        if (chunks && chunks.length > 0) {
          ragContext =
            "\n\nUse the following context to answer the user's question. If the context doesn't contain relevant information, use your general knowledge but mention that.\n\n---CONTEXT---\n" +
            chunks.map((c: any) => c.content).join("\n\n") +
            "\n---END CONTEXT---\n";

          if (include_sources) {
            const chunkKnowledgeIds = [...new Set(chunks.map((c: any) => c.knowledge_id))];
            const { data: knowledgeItems } = await supabase
              .from("knowledge_base")
              .select("id, file_name")
              .in("id", chunkKnowledgeIds);

            const nameMap = Object.fromEntries(
              (knowledgeItems || []).map((k: any) => [k.id, k.file_name])
            );

            sources = chunks.map((c: any) => ({
              file_name: nameMap[c.knowledge_id] || "Unknown",
              content_preview: c.content.slice(0, 150) + (c.content.length > 150 ? "..." : ""),
            }));
          }
        }
      }
    }

    const systemPrompt = (chatbot.system_prompt || "You are a helpful AI assistant.") + ragContext;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: normalizeOpenAIModel(chatbot.model),
        messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
        temperature: chatbot.temperature ?? 0.7,
        max_tokens: chatbot.max_tokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const aiMessage = result.choices?.[0]?.message?.content || "";

    const responseBody: any = { response: aiMessage };
    if (include_sources && sources.length > 0) {
      responseBody.sources = sources;
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
