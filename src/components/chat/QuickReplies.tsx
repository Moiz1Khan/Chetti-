import { cn } from "@/lib/utils";

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
  primaryColor?: string;
}

const QuickReplies = ({ replies, onSelect, disabled, primaryColor }: QuickRepliesProps) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {replies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full border border-border",
            "bg-secondary/50 text-foreground hover:bg-secondary transition-all duration-200",
            "hover:border-primary/40 hover:scale-105 active:scale-95",
            "disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
