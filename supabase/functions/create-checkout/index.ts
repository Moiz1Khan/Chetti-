import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { priceId, productId, planKey } = await req.json();

    const stripeHeaders = {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // If the client sends `planKey`, we avoid hardcoded/stale Stripe price/product IDs
    // by creating the recurring price directly via `price_data`.
    // This is useful when you can't reliably update Stripe IDs in the app.
    const normalizedPlanKey = typeof planKey === "string" ? planKey : null;
    const planPriceMap: Record<string, { unitAmount: number; productName: string }> = {
      pro: { unitAmount: 2900, productName: "Chetti Pro" },
      agency: { unitAmount: 9900, productName: "Chetti Agency" },
    };

    const planPricing = normalizedPlanKey ? planPriceMap[normalizedPlanKey] : undefined;

    const customersRes = await fetch(
      `https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`,
      { headers: stripeHeaders }
    );
    const customersJson = await customersRes.json();
    if (!customersRes.ok) {
      const message = customersJson?.error?.message || "Failed to read Stripe customers";
      throw new Error(message);
    }
    const customerId = customersJson?.data?.[0]?.id as string | undefined;

    const origin = req.headers.get("origin") || Deno.env.get("PUBLIC_APP_URL") || "";
    if (!origin) throw new Error("Missing request origin and PUBLIC_APP_URL");

    const successUrl = `${origin.replace(/\/$/, "")}/dashboard/billing?success=true`;
    const cancelUrl = `${origin.replace(/\/$/, "")}/dashboard/billing?canceled=true`;

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", successUrl);
    params.set("cancel_url", cancelUrl);
    if (customerId) params.set("customer", customerId);
    else params.set("customer_email", user.email);

    if (planPricing) {
      params.set("line_items[0][price_data][currency]", "usd");
      params.set("line_items[0][price_data][unit_amount]", String(planPricing.unitAmount));
      params.set("line_items[0][price_data][recurring][interval]", "month");
      params.set("line_items[0][price_data][product_data][name]", planPricing.productName);
    } else {
      // Legacy path: resolve a recurring price using productId/priceId (depends on IDs existing).
      let resolvedPriceId: string | undefined;
      if (productId) {
        const pricesRes = await fetch(
          `https://api.stripe.com/v1/prices?product=${encodeURIComponent(productId)}&active=true&limit=10`,
          { headers: stripeHeaders },
        );
        const pricesJson = await pricesRes.json();

        if (!pricesRes.ok) {
          const message = pricesJson?.error?.message || "Failed to read Stripe prices";
          throw new Error(message);
        }

        const candidate = (pricesJson?.data as Array<any> | undefined)?.find((p) => p?.recurring);
        resolvedPriceId = candidate?.id;
        if (!resolvedPriceId) throw new Error("No active recurring price found for product");
      } else {
        if (!priceId) throw new Error("priceId is required when planKey is not provided");
        resolvedPriceId = priceId;
      }

      params.set("line_items[0][price]", resolvedPriceId);
    }

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: stripeHeaders,
      body: params.toString(),
    });
    const sessionJson = await sessionRes.json();
    if (!sessionRes.ok) {
      const message = sessionJson?.error?.message || "Failed to create Stripe checkout session";
      throw new Error(message);
    }

    return new Response(JSON.stringify({ url: sessionJson.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("create-checkout error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
