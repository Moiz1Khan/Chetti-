import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: serviceRoleKey },
    });
    if (!userRes.ok) throw new Error("Authentication error");
    const callerUser = await userRes.json();

    // Verify admin role
    const roleRes = await fetch(`${supabaseUrl}/rest/v1/rpc/has_role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ _user_id: callerUser.id, _role: "admin" }),
    });
    const isAdmin = await roleRes.json();
    if (!isAdmin) throw new Error("Unauthorized: admin role required");

    const { action, user_id } = await req.json();
    if (!user_id) throw new Error("user_id is required");
    if (user_id === callerUser.id) throw new Error("Cannot modify your own account");

    const adminHeaders = {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };

    if (action === "disable") {
      // Ban user by setting banned_until far in the future
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ ban_duration: "876000h" }), // ~100 years
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to disable user");
      }
      return new Response(JSON.stringify({ success: true, message: "User disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "enable") {
      // Unban user
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ ban_duration: "none" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to enable user");
      }
      return new Response(JSON.stringify({ success: true, message: "User enabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete user");
      }
      return new Response(JSON.stringify({ success: true, message: "User deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action. Use: disable, enable, or delete");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("admin-manage-user error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: msg.includes("Unauthorized") ? 403 : 400,
    });
  }
});
