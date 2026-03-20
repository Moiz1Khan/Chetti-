import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const REACTION_EMOJIS = ["👍", "👎", "❤️", "😂", "🤔", "🎉", "😮", "🔥"];

interface MessageReactionsProps {
  reactions: string[];
  onReact: (emoji: string) => void;
  align?: "start" | "end";
}

const MessageReactions = ({ reactions, onReact, align = "start" }: MessageReactionsProps) => {
  const [open, setOpen] = useState(false);

  const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={cn("flex items-center gap-1 mt-1", align === "end" && "justify-end")}>
      {/* Existing reactions */}
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary/60 border border-border text-xs hover:bg-secondary transition-colors"
        >
          <span>{emoji}</span>
          {count > 1 && <span className="text-muted-foreground">{count}</span>}
        </button>
      ))}

      {/* Add reaction button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top" align={align}>
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setOpen(false);
                }}
                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-secondary"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
