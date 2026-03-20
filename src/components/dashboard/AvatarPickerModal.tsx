import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sparkles, Bot, MessageCircle, Headphones, Zap, Heart, Star,
  Shield, Globe, Lightbulb, Rocket, Coffee, Smile, Cpu, BrainCircuit,
  Upload, Image as ImageIcon,
} from "lucide-react";

const ICON_OPTIONS = [
  { value: "sparkles", icon: Sparkles, label: "Sparkles" },
  { value: "bot", icon: Bot, label: "Bot" },
  { value: "message-circle", icon: MessageCircle, label: "Chat" },
  { value: "headphones", icon: Headphones, label: "Support" },
  { value: "zap", icon: Zap, label: "Zap" },
  { value: "heart", icon: Heart, label: "Heart" },
  { value: "star", icon: Star, label: "Star" },
  { value: "shield", icon: Shield, label: "Shield" },
  { value: "globe", icon: Globe, label: "Globe" },
  { value: "lightbulb", icon: Lightbulb, label: "Idea" },
  { value: "rocket", icon: Rocket, label: "Rocket" },
  { value: "coffee", icon: Coffee, label: "Coffee" },
  { value: "smile", icon: Smile, label: "Smile" },
  { value: "cpu", icon: Cpu, label: "CPU" },
  { value: "brain-circuit", icon: BrainCircuit, label: "Brain" },
];

const EMOJI_OPTIONS = [
  "🤖", "💬", "🧠", "⚡", "🎯", "🔮", "🌟", "💡",
  "🎨", "🚀", "🛡️", "☕", "😊", "🤝", "💎", "🌈",
  "🎭", "📚", "🔧", "🏆", "🌍", "💼", "🎵", "🦾",
];

interface AvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarType: string;
  avatarIcon: string;
  avatarEmoji: string;
  avatarUrl: string | null;
  primaryColor: string;
  onSelect: (type: string, value: string) => void;
  onUpload: (file: File) => void;
}

export const getIconComponent = (iconName: string) => {
  const found = ICON_OPTIONS.find((i) => i.value === iconName);
  return found ? found.icon : Sparkles;
};

const AvatarPickerModal = ({
  open, onOpenChange, avatarType, avatarIcon, avatarEmoji, avatarUrl, primaryColor, onSelect, onUpload,
}: AvatarPickerModalProps) => {
  const [tab, setTab] = useState(avatarType === "emoji" ? "emoji" : avatarType === "upload" ? "upload" : "icon");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Choose Chatbot Avatar</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="icon" className="text-xs">Icons</TabsTrigger>
            <TabsTrigger value="emoji" className="text-xs">Emoji</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="icon" className="mt-4">
            <ScrollArea className="h-56">
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = avatarType === "icon" && avatarIcon === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onSelect("icon", opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/10 glow-sm"
                          : "border-border hover:border-primary/40 hover:bg-secondary"
                      )}
                    >
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Icon className="h-4.5 w-4.5 text-white" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="emoji" className="mt-4">
            <ScrollArea className="h-56">
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((emoji) => {
                  const isSelected = avatarType === "emoji" && avatarEmoji === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => onSelect("emoji", emoji)}
                      className={cn(
                        "flex items-center justify-center h-14 w-full rounded-xl border text-2xl transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/10 glow-sm scale-110"
                          : "border-border hover:border-primary/40 hover:bg-secondary hover:scale-105"
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              {avatarType === "upload" && avatarUrl && (
                <div className="flex justify-center">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary glow-sm"
                  />
                </div>
              )}
              <Label
                htmlFor="avatar-upload"
                className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WebP up to 2MB</p>
                </div>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPickerModal;
