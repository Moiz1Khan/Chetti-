import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const { messages, model, temperature, max_tokens, system_prompt, chatbot_id, include_sources, public_access, session_id } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let effectiveSystemPrompt = system_prompt;
    let effectiveModel = model;
    let effectiveTemp = temperature;
    let effectiveMaxTokens = max_tokens;
    let chatbotOwnerId: string | null = null;

    // For public access, load chatbot config server-side
    if (public_access && chatbot_id) {
      const { data: chatbot, error: botError } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", chatbot_id)
        .eq("status", true)
        .single();

      if (botError || !chatbot) {
        return new Response(
          JSON.stringify({ error: "Chatbot not found or inactive" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      chatbotOwnerId = chatbot.user_id;

      // Check if public
      const { data: settings } = await supabase
        .from("chatbot_settings")
        .select("is_public")
        .eq("chatbot_id", chatbot_id)
        .maybeSingle();

      if (settings && !settings.is_public) {
        return new Response(
          JSON.stringify({ error: "This chatbot is not publicly accessible" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      effectiveSystemPrompt = effectiveSystemPrompt || chatbot.system_prompt;
      effectiveModel = effectiveModel || chatbot.model;
      effectiveTemp = effectiveTemp ?? chatbot.temperature;
      effectiveMaxTokens = effectiveMaxTokens ?? chatbot.max_tokens;
    } else if (chatbot_id) {
      // Authenticated user - get owner ID
      const { data: chatbot } = await supabase
        .from("chatbots")
        .select("user_id")
        .eq("id", chatbot_id)
        .single();
      if (chatbot) chatbotOwnerId = chatbot.user_id;
    }

    let ragContext = "";
    let sources: Array<{ file_name: string; content_preview: string }> = [];

    // If chatbot_id provided, try to retrieve relevant knowledge
    if (chatbot_id) {
      try {
        // Get linked knowledge IDs for this chatbot
        const { data: links } = await supabase
          .from("chatbot_knowledge")
          .select("knowledge_id")
          .eq("chatbot_id", chatbot_id);

        if (links && links.length > 0) {
          const knowledgeIds = links.map((l: any) => l.knowledge_id);

          // Get the latest user message for search
          const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
          if (lastUserMsg && chatbotOwnerId) {
            const { data: chunks } = await supabase.rpc("search_knowledge_chunks", {
              p_user_id: chatbotOwnerId,
              p_query: lastUserMsg.content,
              p_knowledge_ids: knowledgeIds,
              p_limit: 5,
            });

            if (chunks && chunks.length > 0) {
              ragContext = "\n\nUse the following context to answer the user's question. If the context doesn't contain relevant information, use your general knowledge but mention that.\n\n---CONTEXT---\n" +
                chunks.map((c: any) => c.content).join("\n\n") +
                "\n---END CONTEXT---\n";

              // Get source file names
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
      } catch (ragError) {
        console.error("RAG retrieval error (non-fatal):", ragError);
      }
    }

    const systemMessage = (effectiveSystemPrompt || "You are a helpful AI assistant.") + ragContext;
    const aiModel = normalizeOpenAIModel(effectiveModel);
    const temp = typeof effectiveTemp === "number" ? effectiveTemp : 0.7;
    const maxTok = typeof effectiveMaxTokens === "number" ? effectiveMaxTokens : 1024;

    // Save the user message for public access (dashboard chat saves its own)
    if (public_access && chatbot_id && chatbotOwnerId && session_id) {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
      if (lastUserMsg) {
        await supabase.from("messages").insert({
          chatbot_id,
          user_id: chatbotOwnerId,
          session_id,
          role: "user",
          content: lastUserMsg.content,
        }).then(({ error }) => {
          if (error) console.error("Failed to save user message:", error);
        });

        // Send notification email to chatbot owner (fire & forget, only for first message in session)
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("chatbot_id", chatbot_id)
          .eq("session_id", session_id)
          .eq("role", "user");

        if (count !== null && count <= 1) {
          const notifyUrl = `${supabaseUrl}/functions/v1/notify-chatbot-owner`;
          fetch(notifyUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatbot_id,
              user_message: lastUserMsg.content,
              session_id,
            }),
          }).catch((e) => console.error("Notification email failed:", e));
        }
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
        temperature: temp,
        max_tokens: maxTok,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform stream to collect full response for saving
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAssistantContent = "";

    const transformStream = new TransformStream({
      start(controller) {
        // Prepend sources event if available
        if (sources.length > 0) {
          const sourcesEvent = `data: ${JSON.stringify({ sources })}\n\n`;
          controller.enqueue(encoder.encode(sourcesEvent));
        }
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);

        // Parse chunk to collect full response
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullAssistantContent += content;
          } catch {}
        }
      },
      async flush() {
        // Save assistant message and track usage after stream completes
        if (chatbot_id && chatbotOwnerId && fullAssistantContent) {
          try {
            // Save assistant message
            if (public_access && session_id) {
              await supabase.from("messages").insert({
                chatbot_id,
                user_id: chatbotOwnerId,
                session_id,
                role: "assistant",
                content: fullAssistantContent,
                sources: sources.length > 0 ? sources : [],
              });
            }

            // Track usage (both public and authenticated)
            const today = new Date().toISOString().slice(0, 10);
            const { data: existing } = await supabase
              .from("usage")
              .select("id, messages_used")
              .eq("user_id", chatbotOwnerId)
              .eq("chatbot_id", chatbot_id)
              .eq("date", today)
              .maybeSingle();

            if (existing) {
              await supabase
                .from("usage")
                .update({ messages_used: existing.messages_used + 1 })
                .eq("id", existing.id);
            } else {
              await supabase.from("usage").insert({
                user_id: chatbotOwnerId,
                chatbot_id,
                date: today,
                messages_used: 1,
              });
            }
          } catch (e) {
            console.error("Failed to save message/usage:", e);
          }
        }
      },
    });

    response.body!.pipeTo(transformStream.writable);

    return new Response(transformStream.readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-preview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
