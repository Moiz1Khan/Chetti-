import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PLAN_LIMITS = {
  free: { name: "Free", chatbots: 1, messagesPerMonth: 1000 },
  pro: { name: "Pro", chatbots: 5, messagesPerMonth: 50000 },
  agency: { name: "Agency", chatbots: Infinity, messagesPerMonth: Infinity },
} as const;

const PRODUCT_IDS = {
  pro: "prod_UAPii7iQr8WcJO",
  agency: "prod_UAPiLjclqnq7YK",
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

interface SubscriptionState {
  loading: boolean;
  subscribed: boolean;
  plan: PlanKey;
  productId: string | null;
  subscriptionEnd: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    subscribed: false,
    plan: "free",
    productId: null,
    subscriptionEnd: null,
  });

  const getPlanFromProductId = (productId: string | null): PlanKey => {
    if (productId === PRODUCT_IDS.pro) return "pro";
    if (productId === PRODUCT_IDS.agency) return "agency";
    return "free";
  };

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ loading: false, subscribed: false, plan: "free", productId: null, subscriptionEnd: null });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      const plan = getPlanFromProductId(data.product_id);
      setState({
        loading: false,
        subscribed: data.subscribed,
        plan,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const limits = PLAN_LIMITS[state.plan];

  return {
    ...state,
    limits,
    refresh: checkSubscription,
  };
};
