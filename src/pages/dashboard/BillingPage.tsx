import { useState, useEffect } from "react";
import { Crown, Check, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { useSubscription, PLAN_LIMITS } from "@/hooks/use-subscription";

const PLANS: Record<string, {
  name: string;
  price: string;
  period: string;
  features: string[];
  price_id: string | null;
  product_id: string | null;
  highlighted?: boolean;
}> = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      `${PLAN_LIMITS.free.chatbots} chatbot`,
      `${PLAN_LIMITS.free.messagesPerMonth.toLocaleString()} messages/mo`,
      "Public embed",
      "Community support",
    ],
    price_id: null,
    product_id: null,
  },
  pro: {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      `${PLAN_LIMITS.pro.chatbots} chatbots`,
      `${PLAN_LIMITS.pro.messagesPerMonth.toLocaleString()} messages/mo`,
      "API access",
      "Remove branding",
      "Priority support",
    ],
    price_id: "price_1TC4sc2x6R10KRrheJDtj0po",
    product_id: "prod_UAPii7iQr8WcJO",
    highlighted: true,
  },
  agency: {
    name: "Agency",
    price: "$99",
    period: "/month",
    features: [
      "Unlimited chatbots",
      "Unlimited messages",
      "White-label",
      "Dedicated support",
      "Custom integrations",
    ],
    price_id: "price_1TC4tE2x6R10KRrhfvhGGA7g",
    product_id: "prod_UAPiLjclqnq7YK",
  },
};

const BillingPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { loading, subscribed, plan: currentPlan, subscriptionEnd, refresh } = useSubscription();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Payment successful!", description: "Your subscription is now active." });
      refresh();
    }
  }, [searchParams, toast, refresh]);

  const handleCheckout = async (planKey: string) => {
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        // Use planKey so the Edge Function can create the correct Stripe subscription
        // using `price_data` (no dependency on stale Stripe price/product IDs).
        body: { planKey },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing.</p>
      </div>

      {/* Current Plan Banner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Checking subscription...</span>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-foreground">
                      Current Plan: {PLANS[currentPlan].name}
                    </p>
                    {subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        Renews {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{subscribed ? "Active" : "Free"}</Badge>
              {subscribed && (
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  <ExternalLink className="h-4 w-4 mr-1" /> Manage
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrent = currentPlan === key;
          return (
            <Card key={key} className={plan.highlighted && !isCurrent ? "border-primary shadow-lg" : isCurrent ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="font-display flex items-center justify-between">
                  {plan.name}
                  {isCurrent && <Badge>Your Plan</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-display font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {plan.price_id ? (
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : plan.highlighted ? "default" : "outline"}
                    disabled={isCurrent || !!checkoutLoading}
                    onClick={() => handleCheckout(key)}
                  >
                    {checkoutLoading === key ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading...</>
                    ) : isCurrent ? "Current Plan" : "Upgrade"}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {isCurrent ? "Current Plan" : "Free"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BillingPage;
