import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { chatbot_id, chatbot_name, user_message, session_id } = await req.json();

    if (!chatbot_id || !user_message) {
      return new Response(
        JSON.stringify({ error: "chatbot_id and user_message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get chatbot owner's email
    const { data: chatbot } = await supabase
      .from("chatbots")
      .select("user_id, name")
      .eq("id", chatbot_id)
      .single();

    if (!chatbot) {
      return new Response(
        JSON.stringify({ error: "Chatbot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", chatbot.user_id)
      .single();

    if (!profile?.email) {
      return new Response(
        JSON.stringify({ error: "Owner email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const botName = chatbot_name || chatbot.name || "Your Chatbot";
    const preview = user_message.length > 200 ? user_message.slice(0, 200) + "..." : user_message;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#18181b,#27272a);padding:32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:20px;margin:0;">💬 New Chat on ${botName}</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 16px;">
        A visitor just started chatting with <strong>${botName}</strong>.
      </p>
      <div style="background:#f4f4f5;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <p style="color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Message</p>
        <p style="color:#18181b;font-size:15px;line-height:1.5;margin:0;">${preview}</p>
      </div>
      <div style="text-align:center;">
        <a href="https://chatbot-ai.lovable.app/dashboard/chat/${chatbot_id}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">
          View in Dashboard →
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:12px;text-align:center;margin:20px 0 0;">
        Session: ${session_id ? session_id.slice(0, 8) + "..." : "N/A"}
      </p>
    </div>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chetti <noreply@paisoltechnology.com>",
        to: [profile.email],
        subject: `New chat on ${botName}`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend notification error:", resendRes.status, resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send notification", details: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("notify-chatbot-owner error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
