import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Image as ImageIcon, X, FileText, Loader2, Send } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ChatAttachment = {
  file: File;
  preview?: string;
  type: "image" | "document";
};

interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  attachments: ChatAttachment[];
  onAddAttachment: (attachment: ChatAttachment) => void;
  onRemoveAttachment: (index: number) => void;
  primaryColor?: string;
  placeholder?: string;
}

const ChatInputBar = ({
  value, onChange, onSubmit, disabled,
  attachments, onAddAttachment, onRemoveAttachment,
  primaryColor, placeholder = "Type your message...",
}: ChatInputBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [attachOpen, setAttachOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "document") => {
    const file = e.target.files?.[0];
    if (!file) return;

    let preview: string | undefined;
    if (type === "image" && file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    onAddAttachment({ file, preview, type });
    setAttachOpen(false);
    // Reset input
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-1">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.type === "image" && att.preview ? (
                <img
                  src={att.preview}
                  alt={att.file.name}
                  className="h-16 w-16 object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg border border-border bg-secondary/50 flex flex-col items-center justify-center gap-1 p-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                    {att.file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={() => onRemoveAttachment(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="flex items-center gap-2"
      >
        {/* Attach button */}
        <Popover open={attachOpen} onOpenChange={setAttachOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="shrink-0 h-9 w-9" disabled={disabled}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" side="top" align="start">
            <div className="space-y-1">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              >
                <ImageIcon className="h-4 w-4 text-primary" />
                Upload Image
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              >
                <FileText className="h-4 w-4 text-primary" />
                Upload Document
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          autoFocus
        />

        <Button
          type="submit"
          size="icon"
          disabled={(!value.trim() && attachments.length === 0) || disabled}
          style={primaryColor ? { backgroundColor: primaryColor } : undefined}
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "image")}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.csv,.txt,.md"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "document")}
        />
      </form>
    </div>
  );
};

export default ChatInputBar;
