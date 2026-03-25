import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useIdleMessage } from "@/hooks/use-idle-message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft, Copy, Check, ThumbsUp, ThumbsDown,
  User, Sparkles, FileText, RefreshCw, Download, Loader2,
  MessageSquare, RotateCcw,
} from "lucide-react";
import QuickReplies from "@/components/chat/QuickReplies";
import TypingIndicator from "@/components/chat/TypingIndicator";
import MessageReactions from "@/components/chat/MessageReactions";
import ChatInputBar, { type ChatAttachment } from "@/components/chat/ChatInputBar";
import { getIconComponent } from "@/components/dashboard/AvatarPickerModal";
import { uuid } from "@/lib/uuid";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ file_name: string; content_preview: string }>;
  feedback?: "up" | "down" | null;
  reactions?: string[];
  created_at?: string;
  attachments?: Array<{ name: string; type: string; url?: string }>;
};

const ChatPage = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(() => uuid());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const { data: chatbot, isLoading: loadingBot } = useQuery({
    queryKey: ["chatbot", chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbots").select("*").eq("id", chatbotId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!chatbotId,
  });

  const { data: settings } = useQuery({
    queryKey: ["chatbot-settings", chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbot_settings").select("*").eq("chatbot_id", chatbotId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!chatbotId,
  });

  const { data: history } = useQuery({
    queryKey: ["messages", chatbotId, sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*")
        .eq("chatbot_id", chatbotId!).eq("session_id", sessionId)
        .order("created_at", { ascending: true }).limit(100);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!chatbotId,
  });

  useEffect(() => {
    if (history && history.length > 0 && messages.length === 0) {
      setMessages(history.map((m) => ({
        id: m.id, role: m.role, content: m.content,
        sources: m.sources || [], feedback: m.feedback,
        reactions: m.reactions || [], created_at: m.created_at,
      })));
      setShowQuickReplies(false);
    }
  }, [history]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const primaryColor = settings?.primary_color || "#7c3aed";
  const welcomeMessage = settings?.welcome_message || "Hello! How can I help you today?";
  const quickReplies = (settings as any)?.quick_replies || [];
  const idleMessage = (settings as any)?.idle_message;
  const idleTimeout = (settings as any)?.idle_timeout_seconds || 30;
  const avatarType = (settings as any)?.avatar_type || "icon";
  const avatarIcon = (settings as any)?.avatar_icon || "sparkles";
  const avatarEmoji = (settings as any)?.avatar_emoji || "🤖";
  const avatarUrl = settings?.avatar_url;
  const showBotName = (settings as any)?.show_bot_name ?? true;

  // Idle message handler
  const { resetIdleTimer } = useIdleMessage({
    enabled: messages.length === 0 && !isStreaming,
    timeoutSeconds: idleTimeout,
    idleMessage,
    onIdle: (msg) => {
      // Show idle message as a system-like assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    },
  });

  const IconComp = getIconComponent(avatarIcon);

  const renderBotAvatar = (size = 8) => {
    const sizeClass = `h-${size} w-${size}`;
    if (avatarType === "emoji") {
      return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 bg-secondary border border-border`}>
          <span className={size > 7 ? "text-base" : "text-sm"}>{avatarEmoji}</span>
        </div>
      );
    }
    if (avatarType === "upload" && avatarUrl) {
      return <img src={avatarUrl} alt="Bot" className={`${sizeClass} rounded-full object-cover shrink-0`} />;
    }
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center shrink-0`} style={{ backgroundColor: primaryColor }}>
        <IconComp className={`h-${size > 7 ? 4 : 3.5} w-${size > 7 ? 4 : 3.5} text-white`} />
      </div>
    );
  };

  const saveMessage = async (msg: ChatMessage) => {
    if (!user || !chatbotId) return;
    try {
      const { data, error } = await supabase.from("messages").insert({
        chatbot_id: chatbotId, user_id: user.id, session_id: sessionId,
        role: msg.role, content: msg.content, sources: msg.sources || [],
      }).select().single();
      if (error) throw error;
      return data;
    } catch (e) { console.error("Failed to save message:", e); }
  };

  const updateFeedback = async (messageId: string, feedback: "up" | "down") => {
    try {
      await supabase.from("messages").update({ feedback }).eq("id", messageId);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback } : m)));
      toast({ title: "Feedback saved", description: "Thank you for your feedback!" });
    } catch (e) { console.error("Feedback error:", e); }
  };

  const handleReaction = async (msgIndex: number, emoji: string) => {
    setMessages((prev) => prev.map((m, i) => {
      if (i !== msgIndex) return m;
      const current = m.reactions || [];
      const hasReaction = current.includes(emoji);
      return { ...m, reactions: hasReaction ? current.filter((r) => r !== emoji) : [...current, emoji] };
    }));

    // Persist if message has an ID
    const msg = messages[msgIndex];
    if (msg?.id) {
      const current = msg.reactions || [];
      const hasReaction = current.includes(emoji);
      const newReactions = hasReaction ? current.filter((r) => r !== emoji) : [...current, emoji];
      await supabase.from("messages").update({ reactions: newReactions } as any).eq("id", msg.id);
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const uploadAttachmentToStorage = async (att: ChatAttachment): Promise<string | null> => {
    if (!user) return null;
    const path = `chat-attachments/${user.id}/${Date.now()}-${att.file.name}`;
    const { error } = await supabase.storage.from("knowledge-files").upload(path, att.file);
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("knowledge-files").getPublicUrl(path);
    return data.publicUrl;
  };

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming || !chatbot) return;

    resetIdleTimer();
    setShowQuickReplies(false);

    // Upload attachments
    const uploadedAttachments: Array<{ name: string; type: string; url?: string }> = [];
    for (const att of attachments) {
      const url = await uploadAttachmentToStorage(att);
      uploadedAttachments.push({ name: att.file.name, type: att.type, url: url || undefined });
    }

    let messageContent = input.trim();
    if (uploadedAttachments.length > 0) {
      const fileList = uploadedAttachments.map((a) => `[Attached: ${a.name}]`).join(" ");
      messageContent = messageContent ? `${messageContent}\n\n${fileList}` : fileList;
    }

    const userMsg: ChatMessage = {
      role: "user", content: messageContent,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setIsStreaming(true);

    const savedUser = await saveMessage(userMsg);
    if (savedUser) userMsg.id = savedUser.id;

    await streamResponse(newMessages);
  }, [input, attachments, messages, isStreaming, chatbot, chatbotId, sessionId, user]);

  const streamResponse = async (prevMessages: ChatMessage[]) => {
    let assistantContent = "";
    let sources: Array<{ file_name: string; content_preview: string }> = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: prevMessages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
            system_prompt: chatbot?.system_prompt || undefined,
            model: chatbot?.model || undefined,
            temperature: chatbot?.temperature ?? undefined,
            max_tokens: chatbot?.max_tokens ?? undefined,
            chatbot_id: chatbotId,
            include_sources: true,
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
                if (last?.role === "assistant" && !last.id) {
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

      if (assistantContent) {
        const saved = await saveMessage({ role: "assistant", content: assistantContent, sources });
        if (saved) {
          setMessages((prev) =>
            prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, id: saved.id } : m)
          );
        }
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setSessionId(uuid());
    setShowQuickReplies(true);
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  };

  const exportChat = () => {
    const text = messages.map((m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${chatbot?.name || "export"}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regenerateLastResponse = async () => {
    if (isStreaming) return;
    const lastUserIdx = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserIdx === -1) return;
    const truncated = messages.slice(0, lastUserIdx + 1);
    setMessages(truncated);
    setIsStreaming(true);
    await streamResponse(truncated);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setShowQuickReplies(false);
    // Auto-send
    setTimeout(() => {
      const submitEvent = new Event("submit", { bubbles: true });
      document.querySelector("form")?.dispatchEvent(submitEvent);
    }, 50);
  };

  if (loadingBot) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Chatbot not found</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/chatbots")}>Back to Chatbots</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/chatbots")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {renderBotAvatar(8)}
          <div>
            <h1 className="text-sm font-display font-bold text-foreground">{chatbot.name}</h1>
            <p className="text-xs text-muted-foreground">
              {chatbot.model || "AI Assistant"}
              {isStreaming && " · Typing..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={exportChat} disabled={messages.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={resetConversation} disabled={messages.length === 0 || isStreaming}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Conversation</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              {renderBotAvatar(8)}
              <div className="flex-1">
                {showBotName && <p className="text-sm font-medium text-foreground mb-1">{chatbot.name}</p>}
                <div className="text-sm text-foreground/80">{welcomeMessage}</div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const msgId = msg.id || `temp-${i}`;
            const isUser = msg.role === "user";
            const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;

            return (
              <div key={msgId} className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {isUser ? (
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="mt-1">{renderBotAvatar(8)}</div>
                )}

                {/* Content */}
                <div className={`flex-1 min-w-0 ${isUser ? "text-right" : ""}`}>
                  {showBotName && (
                    <p className="text-sm font-medium text-foreground mb-1">
                      {isUser ? "You" : chatbot.name}
                    </p>
                  )}

                  {/* Attachment previews */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`flex gap-2 mb-2 ${isUser ? "justify-end" : ""}`}>
                      {msg.attachments.map((att, ai) => (
                        att.type === "image" && att.url ? (
                          <img key={ai} src={att.url} alt={att.name} className="h-32 w-auto rounded-lg border border-border" />
                        ) : (
                          <Badge key={ai} variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" /> {att.name}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}

                  <div
                    className={`inline-block text-left max-w-full rounded-2xl px-4 py-3 text-sm ${
                      isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        {isLastAssistant && isStreaming && (
                          <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/50 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Intentionally hide knowledge-base sources in the UI.
                      Sources are still stored/returned from the backend. */}

                  {/* Reactions */}
                  <MessageReactions
                    reactions={msg.reactions || []}
                    onReact={(emoji) => handleReaction(i, emoji)}
                    align={isUser ? "end" : "start"}
                  />

                  {/* Actions */}
                  {!isUser && !isStreaming && msg.content && (
                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyMessage(msg.content, msgId)}>
                            {copiedId === msgId ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy</TooltipContent>
                      </Tooltip>

                      {isLastAssistant && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={regenerateLastResponse}>
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Regenerate</TooltipContent>
                        </Tooltip>
                      )}

                      {msg.id && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon"
                                className={`h-7 w-7 ${msg.feedback === "up" ? "text-green-500" : ""}`}
                                onClick={() => msg.id && updateFeedback(msg.id, "up")}>
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Good response</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon"
                                className={`h-7 w-7 ${msg.feedback === "down" ? "text-red-500" : ""}`}
                                onClick={() => msg.id && updateFeedback(msg.id, "down")}>
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Poor response</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator primaryColor={primaryColor} />
          )}

          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      {showQuickReplies && messages.length === 0 && quickReplies.length > 0 && (
        <QuickReplies replies={quickReplies} onSelect={handleQuickReply} disabled={isStreaming} />
      )}

      {/* Input */}
      <div className="border-t border-border bg-background p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <ChatInputBar
            value={input}
            onChange={setInput}
            onSubmit={sendMessage}
            disabled={isStreaming}
            attachments={attachments}
            onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
            onRemoveAttachment={(idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
            primaryColor={primaryColor}
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI responses may not always be accurate. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
