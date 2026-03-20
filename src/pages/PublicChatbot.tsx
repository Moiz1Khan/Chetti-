import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, User, Loader2, RotateCcw, Paperclip, Image as ImageIcon, FileText, X } from "lucide-react";
import QuickReplies from "@/components/chat/QuickReplies";
import TypingIndicator from "@/components/chat/TypingIndicator";
import MessageReactions from "@/components/chat/MessageReactions";
import { useIdleMessage } from "@/hooks/use-idle-message";
import { getIconComponent } from "@/components/dashboard/AvatarPickerModal";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ file_name: string; content_preview: string }>;
  reactions?: string[];
};

const PublicChatbot = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem(`chatbot-session-${chatbotId}`);
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(`chatbot-session-${chatbotId}`, id);
    return id;
  });

  const { data: chatbot, isLoading: loadingBot } = useQuery({
    queryKey: ["public-chatbot", chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbots").select("*").eq("id", chatbotId!).eq("status", true).single();
      if (error) throw error;
      return data;
    },
    enabled: !!chatbotId,
  });

  const { data: settings } = useQuery({
    queryKey: ["public-chatbot-settings", chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbot_settings").select("*").eq("chatbot_id", chatbotId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!chatbotId,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const primaryColor = settings?.primary_color || "#7c3aed";
  const welcomeMessage = settings?.welcome_message || "Hello! How can I help you today?";
  const isPublic = settings?.is_public !== false;
  const quickReplies = (settings as any)?.quick_replies || [];
  const idleMessage = (settings as any)?.idle_message;
  const idleTimeout = (settings as any)?.idle_timeout_seconds || 30;
  const avatarType = (settings as any)?.avatar_type || "icon";
  const avatarIcon = (settings as any)?.avatar_icon || "sparkles";
  const avatarEmoji = (settings as any)?.avatar_emoji || "🤖";
  const avatarUrl = settings?.avatar_url;
  const showBotName = (settings as any)?.show_bot_name ?? true;
  const fontFamily = (settings as any)?.font_family || "Inter";
  const backgroundTheme = (settings as any)?.background_theme || "dark";
  const bubbleStyle = (settings as any)?.bubble_style || "rounded";

  const { resetIdleTimer } = useIdleMessage({
    enabled: messages.length === 0 && !isStreaming,
    timeoutSeconds: idleTimeout,
    idleMessage,
    onIdle: (msg) => setMessages((prev) => [...prev, { role: "assistant", content: msg }]),
  });

  const IconComp = getIconComponent(avatarIcon);

  const renderBotAvatar = () => {
    if (avatarType === "emoji") {
      return (
        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-secondary border border-border">
          <span className="text-sm">{avatarEmoji}</span>
        </div>
      );
    }
    if (avatarType === "upload" && avatarUrl) {
      return <img src={avatarUrl} alt="Bot" className="h-8 w-8 rounded-full object-cover shrink-0" />;
    }
    return (
      <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor }}>
        <IconComp className="h-4 w-4 text-white" />
      </div>
    );
  };

  const bubbleClass = bubbleStyle === "pill" ? "rounded-full" : bubbleStyle === "sharp" ? "rounded-sm" : "rounded-2xl";
  const bgThemeClass = backgroundTheme === "light" ? "bg-white text-gray-900" : "bg-background text-foreground";

  const handleReaction = (msgIndex: number, emoji: string) => {
    setMessages((prev) => prev.map((m, i) => {
      if (i !== msgIndex) return m;
      const current = m.reactions || [];
      const hasReaction = current.includes(emoji);
      return { ...m, reactions: hasReaction ? current.filter((r) => r !== emoji) : [...current, emoji] };
    }));
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || !chatbot) return;
    resetIdleTimer();
    setShowQuickReplies(false);

    const userMsg: ChatMessage = { role: "user", content: input.trim(), reactions: [] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";
    let sources: Array<{ file_name: string; content_preview: string }> = [];

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
            chatbot_id: chatbotId,
            include_sources: true,
            public_access: true,
            session_id: sessionId,
          }),
        }
      );

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.sources) { sources = parsed.sources; continue; }
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent, sources } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent, sources, reactions: [] }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}`, reactions: [] }]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [input, messages, isStreaming, chatbot, chatbotId, sessionId]);

  const resetConversation = () => {
    setMessages([]);
    setShowQuickReplies(true);
    const newId = crypto.randomUUID();
    localStorage.setItem(`chatbot-session-${chatbotId}`, newId);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setShowQuickReplies(false);
    setTimeout(() => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true }));
    }, 50);
  };

  if (loadingBot) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chatbot || !isPublic) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">This chatbot is not available.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${bgThemeClass}`} style={{ fontFamily }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
            {avatarType === "emoji" ? (
              <span className="text-lg">{avatarEmoji}</span>
            ) : avatarType === "upload" && avatarUrl ? (
              <img src={avatarUrl} alt="Bot" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <IconComp className="h-5 w-5" />
            )}
          </div>
          <div>
            <h1 className="font-semibold text-sm">{chatbot.name}</h1>
            <p className="text-xs opacity-80">{isStreaming ? "Typing..." : "Online"}</p>
          </div>
        </div>
        <button onClick={resetConversation} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="New conversation">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-3">
            {renderBotAvatar()}
            <div className={`bg-muted ${bubbleClass} rounded-tl-sm px-4 py-3 max-w-[80%]`}>
              <p className="text-sm">{welcomeMessage}</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: isUser ? "hsl(var(--muted))" : undefined }}
              >
                {isUser ? (
                  <User className="h-4 w-4 text-muted-foreground" />
                ) : (
                  renderBotAvatar()
                )}
              </div>
              <div className="max-w-[80%]">
                <div
                  className={`${bubbleClass} px-4 py-3 ${
                    isUser ? "rounded-tr-sm text-white" : "bg-muted rounded-tl-sm"
                  }`}
                  style={isUser ? { backgroundColor: primaryColor } : undefined}
                >
                  {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                      {msg.sources.map((s, j) => (
                        <span key={j} className="text-xs text-muted-foreground/80 block truncate">📄 {s.file_name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <MessageReactions
                  reactions={msg.reactions || []}
                  onReact={(emoji) => handleReaction(i, emoji)}
                  align={isUser ? "end" : "start"}
                />
              </div>
            </div>
          );
        })}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <TypingIndicator primaryColor={primaryColor} />
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length === 0 && quickReplies.length > 0 && (
        <QuickReplies replies={quickReplies} onSelect={handleQuickReply} disabled={isStreaming} />
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-2">Powered by AI Chatbot Builder</p>
      </div>
    </div>
  );
};

export default PublicChatbot;
