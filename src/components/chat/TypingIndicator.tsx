const TypingIndicator = ({ primaryColor }: { primaryColor?: string }) => (
  <div className="flex gap-3">
    <div
      className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: primaryColor || "hsl(var(--primary))" }}
    >
      <div className="flex gap-0.5">
        <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex items-center gap-1.5">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
      </div>
    </div>
  </div>
);

export default TypingIndicator;
