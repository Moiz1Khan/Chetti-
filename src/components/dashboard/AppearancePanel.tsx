import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles, Pencil, X } from "lucide-react";
import AvatarPickerModal, { getIconComponent } from "./AvatarPickerModal";

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Default)" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Outfit", label: "Outfit" },
  { value: "Manrope", label: "Manrope" },
];

const FONT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const BUBBLE_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
  { value: "pill", label: "Pill" },
];

const BACKGROUND_THEMES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "custom", label: "Custom Image" },
];

const COLOR_PRESETS = [
  "#7c3aed", "#6366f1", "#3b82f6", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444", "#ec4899",
  "#000000", "#404040",
];

interface AppearancePanelProps {
  welcomeMessage: string;
  setWelcomeMessage: (v: string) => void;
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  bubbleStyle: string;
  setBubbleStyle: (v: string) => void;
  leadCaptureEnabled: boolean;
  setLeadCaptureEnabled: (v: boolean) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  fontSize: string;
  setFontSize: (v: string) => void;
  backgroundTheme: string;
  setBackgroundTheme: (v: string) => void;
  showBotName: boolean;
  setShowBotName: (v: boolean) => void;
  avatarType: string;
  avatarIcon: string;
  avatarEmoji: string;
  avatarUrl: string | null;
  onAvatarSelect: (type: string, value: string) => void;
  onAvatarUpload: (file: File) => void;
  botName: string;
  quickReplies: string[];
  setQuickReplies: (v: string[]) => void;
  idleMessage: string;
  setIdleMessage: (v: string) => void;
  idleTimeout: number;
  setIdleTimeout: (v: number) => void;
}

const AppearancePanel = ({
  welcomeMessage, setWelcomeMessage,
  primaryColor, setPrimaryColor,
  bubbleStyle, setBubbleStyle,
  leadCaptureEnabled, setLeadCaptureEnabled,
  fontFamily, setFontFamily,
  fontSize, setFontSize,
  backgroundTheme, setBackgroundTheme,
  showBotName, setShowBotName,
  avatarType, avatarIcon, avatarEmoji, avatarUrl,
  onAvatarSelect, onAvatarUpload,
  botName,
  quickReplies, setQuickReplies,
  idleMessage, setIdleMessage,
  idleTimeout, setIdleTimeout,
}: AppearancePanelProps) => {
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [newQuickReply, setNewQuickReply] = useState("");
  const IconComp = getIconComponent(avatarIcon);

  const renderAvatar = () => {
    if (avatarType === "emoji") {
      return <span className="text-xl">{avatarEmoji}</span>;
    }
    if (avatarType === "upload" && avatarUrl) {
      return <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />;
    }
    return <IconComp className="h-5 w-5 text-white" />;
  };

  return (
    <div className="space-y-5">
      {/* Avatar Section */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avatar</Label>
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center shrink-0 border-2 border-border relative group cursor-pointer"
            style={{ backgroundColor: avatarType !== "emoji" ? primaryColor : "hsl(var(--secondary))" }}
            onClick={() => setAvatarPickerOpen(true)}
          >
            {renderAvatar()}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <Button variant="outline" size="sm" onClick={() => setAvatarPickerOpen(true)}>
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              {avatarType === "icon" ? "Icon" : avatarType === "emoji" ? "Emoji" : "Custom image"}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Welcome Message */}
      <div className="space-y-2">
        <Label>Welcome Message</Label>
        <Textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          rows={2}
          placeholder="Hello! How can I help you today?"
        />
      </div>

      <Separator />

      {/* Color */}
      <div className="space-y-3">
        <Label>Primary Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setPrimaryColor(color)}
              className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                primaryColor === color ? "border-foreground scale-110 glow-sm" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-9 w-12 rounded border border-input cursor-pointer bg-transparent"
          />
          <Input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="font-mono w-28"
            maxLength={7}
          />
        </div>
      </div>

      <Separator />

      {/* Bubble Style */}
      <div className="space-y-2">
        <Label>Bubble Shape</Label>
        <div className="flex gap-2">
          {BUBBLE_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => setBubbleStyle(style.value)}
              className={`flex-1 py-2 px-3 text-xs font-medium border rounded-lg transition-all ${
                bubbleStyle === style.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Font Family</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Font Size</Label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Background Theme */}
      <div className="space-y-2">
        <Label>Background Theme</Label>
        <Select value={backgroundTheme} onValueChange={setBackgroundTheme}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BACKGROUND_THEMES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Quick Replies */}
      <div className="space-y-3">
        <Label>Quick Reply Buttons</Label>
        <p className="text-xs text-muted-foreground">Pre-defined options shown before first message</p>
        <div className="flex flex-wrap gap-1.5">
          {quickReplies.map((reply, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-secondary border border-border">
              {reply}
              <button onClick={() => setQuickReplies(quickReplies.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newQuickReply}
            onChange={(e) => setNewQuickReply(e.target.value)}
            placeholder="e.g. What are your pricing plans?"
            className="text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newQuickReply.trim()) {
                e.preventDefault();
                setQuickReplies([...quickReplies, newQuickReply.trim()]);
                setNewQuickReply("");
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (newQuickReply.trim()) {
                setQuickReplies([...quickReplies, newQuickReply.trim()]);
                setNewQuickReply("");
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Idle Message */}
      <div className="space-y-3">
        <Label>Idle Message</Label>
        <p className="text-xs text-muted-foreground">Shown after user inactivity</p>
        <Textarea
          value={idleMessage}
          onChange={(e) => setIdleMessage(e.target.value)}
          placeholder="e.g. Still there? Feel free to ask me anything!"
          rows={2}
        />
        <div className="space-y-2">
          <Label className="text-xs">Timeout (seconds)</Label>
          <Input
            type="number"
            value={idleTimeout}
            onChange={(e) => setIdleTimeout(Number(e.target.value))}
            min={5}
            max={300}
            className="w-24"
          />
        </div>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Bot Name</Label>
            <p className="text-xs text-muted-foreground">Display name above messages</p>
          </div>
          <Switch checked={showBotName} onCheckedChange={setShowBotName} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Lead Capture</Label>
            <p className="text-xs text-muted-foreground">Collect name & email before chat</p>
          </div>
          <Switch checked={leadCaptureEnabled} onCheckedChange={setLeadCaptureEnabled} />
        </div>
      </div>

      <AvatarPickerModal
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        avatarType={avatarType}
        avatarIcon={avatarIcon}
        avatarEmoji={avatarEmoji}
        avatarUrl={avatarUrl}
        primaryColor={primaryColor}
        onSelect={(type, value) => {
          onAvatarSelect(type, value);
          setAvatarPickerOpen(false);
        }}
        onUpload={(file) => {
          onAvatarUpload(file);
          setAvatarPickerOpen(false);
        }}
      />
    </div>
  );
};

export default AppearancePanel;
