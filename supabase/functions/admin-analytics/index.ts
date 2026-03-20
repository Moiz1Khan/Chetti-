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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: serviceRoleKey },
    });
    if (!userRes.ok) throw new Error("Authentication error");
    const userData = await userRes.json();

    // Check admin role via DB
    const roleRes = await fetch(
      `${supabaseUrl}/rest/v1/rpc/has_role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ _user_id: userData.id, _role: "admin" }),
      }
    );
    const isAdmin = await roleRes.json();
    if (!isAdmin) throw new Error("Unauthorized: admin role required");

    const stripeHeaders = {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Fetch all customers
    const customersRes = await fetch(
      `https://api.stripe.com/v1/customers?limit=100`,
      { headers: stripeHeaders }
    );
    const customers = await customersRes.json();

    // Fetch all subscriptions (active + canceled + past_due)
    const [activeSubs, canceledSubs, pastDueSubs] = await Promise.all([
      fetch(`https://api.stripe.com/v1/subscriptions?limit=100&status=active`, { headers: stripeHeaders }).then(r => r.json()),
      fetch(`https://api.stripe.com/v1/subscriptions?limit=100&status=canceled`, { headers: stripeHeaders }).then(r => r.json()),
      fetch(`https://api.stripe.com/v1/subscriptions?limit=100&status=past_due`, { headers: stripeHeaders }).then(r => r.json()),
    ]);

    // Fetch recent charges (last 100)
    const chargesRes = await fetch(
      `https://api.stripe.com/v1/charges?limit=100`,
      { headers: stripeHeaders }
    );
    const charges = await chargesRes.json();

    // Fetch balance
    const balanceRes = await fetch(
      `https://api.stripe.com/v1/balance`,
      { headers: stripeHeaders }
    );
    const balance = await balanceRes.json();

    // Fetch recent invoices
    const invoicesRes = await fetch(
      `https://api.stripe.com/v1/invoices?limit=100&status=paid`,
      { headers: stripeHeaders }
    );
    const invoices = await invoicesRes.json();

    // Process data
    const allSubs = [
      ...(activeSubs.data || []),
      ...(canceledSubs.data || []),
      ...(pastDueSubs.data || []),
    ];

    // MRR calculation from active subscriptions
    let mrr = 0;
    (activeSubs.data || []).forEach((sub: any) => {
      const item = sub.items?.data?.[0];
      if (item?.price?.recurring) {
        let amount = (item.price.unit_amount || 0) * (item.quantity || 1);
        if (item.price.recurring.interval === "year") amount = amount / 12;
        mrr += amount;
      }
    });

    // Revenue by month from paid invoices
    const revenueByMonth: Record<string, number> = {};
    (invoices.data || []).forEach((inv: any) => {
      const date = new Date((inv.status_transitions?.paid_at || inv.created) * 1000);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + (inv.amount_paid || 0);
    });

    // Charges by status
    const chargesByStatus = { succeeded: 0, failed: 0, refunded: 0, pending: 0 };
    let totalRevenue = 0;
    (charges.data || []).forEach((ch: any) => {
      if (ch.status === "succeeded") {
        chargesByStatus.succeeded++;
        totalRevenue += ch.amount || 0;
      } else if (ch.status === "failed") chargesByStatus.failed++;
      else if (ch.refunded) chargesByStatus.refunded++;
      else chargesByStatus.pending++;
    });

    // Subscriptions by plan
    const subsByPlan: Record<string, number> = {};
    (activeSubs.data || []).forEach((sub: any) => {
      const productId = sub.items?.data?.[0]?.price?.product || "unknown";
      subsByPlan[productId] = (subsByPlan[productId] || 0) + 1;
    });

    // Recent transactions
    const recentTransactions = (charges.data || []).slice(0, 20).map((ch: any) => ({
      id: ch.id,
      amount: ch.amount,
      currency: ch.currency,
      status: ch.status,
      customer_email: ch.billing_details?.email || ch.receipt_email || "Unknown",
      created: ch.created,
      description: ch.description || "Payment",
      refunded: ch.refunded,
    }));

    // Available balance
    const availableBalance = (balance.available || []).reduce(
      (sum: number, b: any) => sum + (b.amount || 0), 0
    );
    const pendingBalance = (balance.pending || []).reduce(
      (sum: number, b: any) => sum + (b.amount || 0), 0
    );

    return new Response(JSON.stringify({
      totalCustomers: customers.data?.length || 0,
      activeSubscriptions: activeSubs.data?.length || 0,
      canceledSubscriptions: canceledSubs.data?.length || 0,
      pastDueSubscriptions: pastDueSubs.data?.length || 0,
      mrr: mrr / 100,
      totalRevenue: totalRevenue / 100,
      availableBalance: availableBalance / 100,
      pendingBalance: pendingBalance / 100,
      chargesByStatus,
      subsByPlan,
      revenueByMonth: Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount: (amount as number) / 100 })),
      recentTransactions,
      currency: balance.available?.[0]?.currency || "usd",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("admin-analytics error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message.includes("Unauthorized") ? 403 : 500,
    });
  }
});
