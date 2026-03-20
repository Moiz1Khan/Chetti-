import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export type ChatNotification = {
  id: string;
  chatbot_id: string;
  chatbot_name: string;
  session_id: string;
  content: string;
  created_at: string;
  read: boolean;
};

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<ChatNotification[]>(() => {
    try {
      const stored = localStorage.getItem("chat-notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("chat-notifications", JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("dashboard-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `role=eq.user`,
        },
        async (payload) => {
          const msg = payload.new as any;
          // Only notify for messages belonging to this user's chatbots
          // and from public sessions (not from the dashboard itself)
          if (!msg.chatbot_id) return;

          // Get chatbot info to verify ownership & get name
          const { data: chatbot } = await supabase
            .from("chatbots")
            .select("name, user_id")
            .eq("id", msg.chatbot_id)
            .single();

          if (!chatbot || chatbot.user_id !== user.id) return;

          const notification: ChatNotification = {
            id: msg.id,
            chatbot_id: msg.chatbot_id,
            chatbot_name: chatbot.name,
            session_id: msg.session_id,
            content: msg.content.slice(0, 100) + (msg.content.length > 100 ? "..." : ""),
            created_at: msg.created_at,
            read: false,
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 50));

          // Invalidate usage/messages queries
          queryClient.invalidateQueries({ queryKey: ["usage"] });
          queryClient.invalidateQueries({ queryKey: ["chatbots"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAllRead, markRead, clearAll };
}
