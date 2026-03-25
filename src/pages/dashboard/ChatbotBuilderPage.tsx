import { useState, useEffect, useRef, useCallback } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Save, Bot, Settings2, Brain, Palette, MessageSquare,
  Send, RotateCcw, Sparkles, FileText, Link2, Type, Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import AppearancePanel from "@/components/dashboard/AppearancePanel";
import { getIconComponent } from "@/components/dashboard/AvatarPickerModal";

const MODELS = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Fast)" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano (Fast)" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5", label: "GPT-5" },
];

const TEMPLATES = [
  {
    name: "Customer Support",
    prompt: "You are a friendly and professional customer support assistant. Help users with their questions, troubleshoot issues, and provide clear solutions. Always be empathetic and patient.",
  },
  {
    name: "Sales Assistant",
    prompt: "You are a knowledgeable sales assistant. Help potential customers understand the product, answer questions about features and pricing, and guide them toward making a purchase decision.",
  },
  {
    name: "FAQ Bot",
    prompt: "You are a helpful FAQ bot. Answer common questions concisely and accurately. If you don't know the answer, politely direct the user to contact support.",
  },
  {
    name: "Technical Docs",
    prompt: "You are a technical documentation assistant. Help developers understand APIs, code examples, and integration guides. Provide code snippets when helpful.",
  },
];

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ file_name: string; content_preview: string }>;
};

const ChatbotBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isNew = id === "new";
  const { limits } = useSubscription();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("google/gemini-3-flash-preview");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [bubbleStyle, setBubbleStyle] = useState("rounded");
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState("medium");
  const [backgroundTheme, setBackgroundTheme] = useState("dark");
  const [showBotName, setShowBotName] = useState(true);
  const [avatarType, setAvatarType] = useState("icon");
  const [avatarIcon, setAvatarIcon] = useState("sparkles");
  const [avatarEmoji, setAvatarEmoji] = useState("🤖");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [idleMessage, setIdleMessage] = useState("");
  const [idleTimeout, setIdleTimeout] = useState(30);

  // Chat preview state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePanel, setActivePanel] = useState<"config" | "preview">("config");

  // Fetch existing chatbot
  const { data: chatbot, isLoading } = useQuery({
    queryKey: ["chatbot", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  const { data: settings } = useQuery({
    queryKey: ["chatbot-settings", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("chatbot_id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  const { data: knowledgeItems } = useQuery({
    queryKey: ["knowledge-base"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedKnowledge } = useQuery({
    queryKey: ["chatbot-knowledge", id],
    queryFn: async () => {
      if (isNew) return [];
      const { data, error } = await supabase
        .from("chatbot_knowledge")
        .select("knowledge_id")
        .eq("chatbot_id", id!);
      if (error) throw error;
      return data.map((d) => d.knowledge_id);
    },
    enabled: !isNew,
  });

  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([]);

  useEffect(() => {
    if (chatbot) {
      setName(chatbot.name);
      setDescription(chatbot.description || "");
      setSystemPrompt(chatbot.system_prompt || "");
      setModel(chatbot.model || "google/gemini-3-flash-preview");
      setTemperature(chatbot.temperature ?? 0.7);
      setMaxTokens(chatbot.max_tokens ?? 1024);
    }
  }, [chatbot]);

  useEffect(() => {
    if (settings) {
      setWelcomeMessage(settings.welcome_message || "Hello! How can I help you today?");
      setPrimaryColor(settings.primary_color || "#7c3aed");
      setBubbleStyle(settings.bubble_style || "rounded");
      setLeadCaptureEnabled(settings.lead_capture_enabled || false);
      setFontFamily((settings as any).font_family || "Inter");
      setFontSize((settings as any).font_size || "medium");
      setBackgroundTheme((settings as any).background_theme || "dark");
      setShowBotName((settings as any).show_bot_name ?? true);
      setAvatarType((settings as any).avatar_type || "icon");
      setAvatarEmoji((settings as any).avatar_emoji || "🤖");
      setAvatarIcon((settings as any).avatar_icon || "sparkles");
      setAvatarUrl(settings.avatar_url || null);
      setQuickReplies((settings as any).quick_replies || []);
      setIdleMessage((settings as any).idle_message || "");
      setIdleTimeout((settings as any).idle_timeout_seconds || 30);
    }
  }, [settings]);

  useEffect(() => {
    if (linkedKnowledge) setSelectedKnowledge(linkedKnowledge);
  }, [linkedKnowledge]);

  const handleAvatarSelect = (type: string, value: string) => {
    setAvatarType(type);
    if (type === "icon") setAvatarIcon(value);
    if (type === "emoji") setAvatarEmoji(value);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("knowledge-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("knowledge-files").getPublicUrl(path);
    setAvatarType("upload");
    setAvatarUrl(urlData.publicUrl);
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const settingsPayload = {
        welcome_message: welcomeMessage,
        primary_color: primaryColor,
        bubble_style: bubbleStyle,
        lead_capture_enabled: leadCaptureEnabled,
        avatar_url: avatarUrl,
        font_family: fontFamily,
        font_size: fontSize,
        background_theme: backgroundTheme,
        show_bot_name: showBotName,
        avatar_type: avatarType,
        avatar_emoji: avatarEmoji,
        avatar_icon: avatarIcon,
        quick_replies: quickReplies,
        idle_message: idleMessage || null,
        idle_timeout_seconds: idleTimeout,
      };

      if (isNew) {
        // Check chatbot limit before creating
        const { count, error: countError } = await supabase
          .from("chatbots")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id);
        if (countError) throw countError;
        if ((count || 0) >= limits.chatbots) {
          throw new Error(`You've reached the limit of ${limits.chatbots} chatbot${limits.chatbots > 1 ? "s" : ""} on your plan. Please upgrade to create more.`);
        }

        const { data: newBot, error } = await supabase
          .from("chatbots")
          .insert({
            user_id: user!.id,
            name,
            description: description || null,
            system_prompt: systemPrompt,
            model,
            temperature,
            max_tokens: maxTokens,
          })
          .select()
          .single();
        if (error) throw error;

        const { error: settingsError } = await supabase
          .from("chatbot_settings")
          .insert({ chatbot_id: newBot.id, ...settingsPayload } as any);
        if (settingsError) throw settingsError;

        if (selectedKnowledge.length > 0) {
          const { error: knowledgeError } = await supabase
            .from("chatbot_knowledge")
            .insert(selectedKnowledge.map((kid) => ({ chatbot_id: newBot.id, knowledge_id: kid })));
          if (knowledgeError) throw knowledgeError;
        }

        return newBot.id;
      } else {
        const { error } = await supabase
          .from("chatbots")
          .update({ name, description: description || null, system_prompt: systemPrompt, model, temperature, max_tokens: maxTokens })
          .eq("id", id!);
        if (error) throw error;

        const { error: settingsError } = await supabase
          .from("chatbot_settings")
          .upsert({ chatbot_id: id!, ...settingsPayload } as any, { onConflict: "chatbot_id" });
        if (settingsError) throw settingsError;

        await supabase.from("chatbot_knowledge").delete().eq("chatbot_id", id!);
        if (selectedKnowledge.length > 0) {
          const { error: knowledgeError } = await supabase
            .from("chatbot_knowledge")
            .insert(selectedKnowledge.map((kid) => ({ chatbot_id: id!, knowledge_id: kid })));
          if (knowledgeError) throw knowledgeError;
        }

        return id!;
      }
    },
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      queryClient.invalidateQueries({ queryKey: ["chatbot", newId] });
      toast({ title: "Saved!", description: `Chatbot "${name}" saved successfully.` });
      if (isNew) navigate(`/dashboard/chatbots/builder/${newId}`, { replace: true });
    },
    onError: (e: Error) => toast({ title: "Error saving", description: e.message, variant: "destructive" }),
  });

  // Chat preview streaming
  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setIsStreaming(true);

    let assistantContent = "";
    let streamSources: Array<{ file_name: string; content_preview: string }> = [];

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
            messages: newMessages,
            system_prompt: systemPrompt,
            model,
            temperature,
            max_tokens: maxTokens,
            chatbot_id: isNew ? undefined : id,
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
            if (parsed.sources) {
              streamSources = parsed.sources;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, sources: streamSources } : m
                  );
                }
                return prev;
              });
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent, sources: streamSources } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent, sources: streamSources }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "Preview Error", description: e.message, variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  }, [chatInput, chatMessages, isStreaming, systemPrompt, model, temperature, maxTokens, toast, id, isNew]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleKnowledge = (kid: string) => {
    setSelectedKnowledge((prev) =>
      prev.includes(kid) ? prev.filter((k) => k !== kid) : [...prev, kid]
    );
  };

  if (!isNew && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const fileTypeIcon = (type: string) => {
    const t = type?.toUpperCase();
    if (t === "PDF" || t === "DOCX" || t === "DOC") return <FileText className="h-4 w-4" />;
    if (t === "URL") return <Link2 className="h-4 w-4" />;
    return <Type className="h-4 w-4" />;
  };

  // Preview helpers
  const IconComp = getIconComponent(avatarIcon);
  const fontSizeClass = fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : "text-sm";
  const bubbleClass = bubbleStyle === "pill" ? "rounded-full" : bubbleStyle === "sharp" ? "rounded-sm" : "rounded-xl";
  const bgClass = backgroundTheme === "light" ? "bg-white" : backgroundTheme === "dark" ? "bg-muted/30" : "bg-muted/30";

  const renderBotAvatar = () => {
    if (avatarType === "emoji") {
      return (
        <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-secondary border border-border">
          <span className="text-sm">{avatarEmoji}</span>
        </div>
      );
    }
    if (avatarType === "upload" && avatarUrl) {
      return (
        <img src={avatarUrl} alt="Bot" className="h-7 w-7 rounded-full object-cover shrink-0" />
      );
    }
    return (
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <IconComp className="h-3.5 w-3.5 text-white" />
      </div>
    );
  };


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border bg-background gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/chatbots")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-display font-bold text-foreground truncate">
              {isNew ? "Create Chatbot" : `Edit: ${chatbot?.name || ""}`}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Configure your AI chatbot</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile panel toggle */}
          <div className="flex md:hidden border border-border rounded-lg overflow-hidden">
            <Button
              variant={activePanel === "config" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 text-xs px-3"
              onClick={() => setActivePanel("config")}
            >
              <Settings2 className="h-3 w-3 mr-1" /> Config
            </Button>
            <Button
              variant={activePanel === "preview" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 text-xs px-3"
              onClick={() => setActivePanel("preview")}
            >
              <MessageSquare className="h-3 w-3 mr-1" /> Preview
            </Button>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={!name.trim() || saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Config Panel */}
        <div className={`w-full md:w-1/2 border-r border-border overflow-hidden ${activePanel !== "config" ? "hidden md:block" : ""}`}>
          <ScrollArea className="h-full">
            <div className="p-3 sm:p-6 space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="w-full flex h-auto overflow-x-auto">
                  <TabsTrigger value="basic" className="text-xs px-2 py-1.5 flex-1 min-w-0 gap-1">
                    <Bot className="h-3 w-3 shrink-0" /> Basic
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs px-2 py-1.5 flex-1 min-w-0 gap-1">
                    <Settings2 className="h-3 w-3 shrink-0" /> AI
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="text-xs px-2 py-1.5 flex-1 min-w-0 gap-1">
                    <Brain className="h-3 w-3 shrink-0" /> Know.
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="text-xs px-2 py-1.5 flex-1 min-w-0 gap-1">
                    <Palette className="h-3 w-3 shrink-0" /> Style
                  </TabsTrigger>
                </TabsList>

                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Chatbot Name *</Label>
                    <Input placeholder="My Support Bot" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe what this chatbot does..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Label>System Prompt</Label>
                      <Select onValueChange={(v) => { const t = TEMPLATES.find((t) => t.name === v); if (t) setSystemPrompt(t.prompt); }}>
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue placeholder="Use template" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map((t) => (
                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea placeholder="You are a helpful customer support assistant..." value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={8} className="font-mono text-sm" />
                    <p className="text-xs text-muted-foreground">Define how the AI should behave and respond.</p>
                  </div>
                </TabsContent>

                {/* AI Configuration Tab */}
                <TabsContent value="ai" className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MODELS.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose the AI model for your chatbot responses.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Temperature</Label>
                      <Badge variant="secondary" className="font-mono text-xs">{temperature.toFixed(2)}</Badge>
                    </div>
                    <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={0} max={1} step={0.05} />
                    <p className="text-xs text-muted-foreground">Lower = more focused. Higher = more creative.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} min={64} max={8192} />
                    <p className="text-xs text-muted-foreground">Maximum length of each response (64–8192).</p>
                  </div>
                </TabsContent>

                {/* Knowledge Tab */}
                <TabsContent value="knowledge" className="space-y-4 mt-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Attach documents to this chatbot</AlertTitle>
                    <AlertDescription className="text-xs leading-relaxed">
                      Uploading a file under <strong>Knowledge Base</strong> only indexes it. You must <strong>check the boxes</strong> below
                      and click <strong>Save</strong> so this chatbot can use the PDF in replies. Nothing is linked until you save.
                    </AlertDescription>
                  </Alert>
                  {!isNew &&
                    knowledgeItems &&
                    knowledgeItems.some((i) => (i as { status?: string }).status === "ready") &&
                    selectedKnowledge.length === 0 && (
                      <Alert variant="destructive">
                        <AlertTitle>No sources linked</AlertTitle>
                        <AlertDescription className="text-xs">
                          You have Ready documents, but none are selected for this chatbot. Select at least one PDF and save.
                        </AlertDescription>
                      </Alert>
                    )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Select knowledge sources to train your chatbot. Only "Ready" sources can be linked.</p>
                    {selectedKnowledge.length > 0 && (
                      <p className="text-xs text-primary font-medium">{selectedKnowledge.length} source{selectedKnowledge.length > 1 ? "s" : ""} linked</p>
                    )}
                  </div>
                  {knowledgeItems && knowledgeItems.length > 0 ? (
                    <div className="space-y-2">
                      {knowledgeItems.filter((item) => (item as any).status === "ready").length > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              const readyIds = knowledgeItems.filter((i) => (i as any).status === "ready").map((i) => i.id);
                              const allSelected = readyIds.every((id) => selectedKnowledge.includes(id));
                              setSelectedKnowledge(allSelected ? selectedKnowledge.filter((id) => !readyIds.includes(id)) : [...new Set([...selectedKnowledge, ...readyIds])]);
                            }}
                          >
                            {knowledgeItems.filter((i) => (i as any).status === "ready").every((i) => selectedKnowledge.includes(i.id)) ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                      )}
                      {knowledgeItems.map((item) => {
                        const isReady = (item as any).status === "ready";
                        const isSelected = selectedKnowledge.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              !isReady ? "opacity-50 cursor-not-allowed" :
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                            }`}
                            onClick={(e) => { if (isReady) { e.preventDefault(); toggleKnowledge(item.id); } }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={!isReady}
                              onCheckedChange={() => isReady && toggleKnowledge(item.id)}
                              className="shrink-0"
                            />
                            {fileTypeIcon(item.file_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.file_type.toUpperCase()} · {new Date(item.created_at).toLocaleDateString()}
                                {!isReady && ` · ${(item as any).status || "pending"}`}
                              </p>
                            </div>
                            {isSelected && <Badge variant="default" className="text-xs shrink-0">Linked</Badge>}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Brain className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No knowledge base items yet. Upload data in the Knowledge Base section.</p>
                        <Button variant="outline" className="mt-3" onClick={() => navigate("/dashboard/knowledge")}>
                          Go to Knowledge Base
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="mt-4">
                  <AppearancePanel
                    welcomeMessage={welcomeMessage}
                    setWelcomeMessage={setWelcomeMessage}
                    primaryColor={primaryColor}
                    setPrimaryColor={setPrimaryColor}
                    bubbleStyle={bubbleStyle}
                    setBubbleStyle={setBubbleStyle}
                    leadCaptureEnabled={leadCaptureEnabled}
                    setLeadCaptureEnabled={setLeadCaptureEnabled}
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    backgroundTheme={backgroundTheme}
                    setBackgroundTheme={setBackgroundTheme}
                    showBotName={showBotName}
                    setShowBotName={setShowBotName}
                    avatarType={avatarType}
                    avatarIcon={avatarIcon}
                    avatarEmoji={avatarEmoji}
                    avatarUrl={avatarUrl}
                    onAvatarSelect={handleAvatarSelect}
                    onAvatarUpload={handleAvatarUpload}
                    botName={name}
                    quickReplies={quickReplies}
                    setQuickReplies={setQuickReplies}
                    idleMessage={idleMessage}
                    setIdleMessage={setIdleMessage}
                    idleTimeout={idleTimeout}
                    setIdleTimeout={setIdleTimeout}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>

        {/* Right: Live Chat Preview */}
        <div className={`w-full md:w-1/2 flex flex-col ${bgClass} ${activePanel !== "preview" ? "hidden md:flex" : ""}`} style={{ fontFamily }}>
          <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderBotAvatar()}
              <div>
                <span className="text-sm font-medium text-foreground">Live Preview</span>
                {showBotName && name && (
                  <p className="text-[10px] text-muted-foreground">{name}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setChatMessages([])} disabled={chatMessages.length === 0}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Welcome message */}
                <div className="flex gap-2">
                  {renderBotAvatar()}
                  <div className={`px-3 py-2 bg-card border border-border ${fontSizeClass} text-foreground max-w-[80%] ${bubbleClass}`}>
                    {welcomeMessage}
                  </div>
                </div>

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && renderBotAvatar()}
                    <div
                      className={`px-3 py-2 ${fontSizeClass} max-w-[80%] ${bubbleClass} ${
                        msg.role === "user"
                          ? "text-primary-foreground"
                          : "bg-card border border-border text-foreground"
                      }`}
                      style={msg.role === "user" ? { backgroundColor: primaryColor } : undefined}
                    >
                      {msg.content}
                      {msg.role === "assistant" && isStreaming && i === chatMessages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/50 animate-pulse" />
                      )}
                      {/* Intentionally hide knowledge-base sources in the UI.
                          Sources are still returned from the backend (for debugging/auditing),
                          but we don't show them to users. */}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isStreaming} />
                <Button type="submit" size="icon" disabled={!chatInput.trim() || isStreaming} style={{ backgroundColor: primaryColor }}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotBuilderPage;
