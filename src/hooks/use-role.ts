import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id);

      if (!error && data) {
        const roles = (data as any[]).map((r: any) => r.role);
        setIsAdmin(roles.includes("admin"));
        setIsModerator(roles.includes("moderator"));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  return { isAdmin, isModerator, loading };
}
