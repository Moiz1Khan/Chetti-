import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const presetResponses: Record<string, string> = {
  "What can you do?": "I can answer questions about your products, help with support tickets, and guide users through your documentation — all powered by AI! 🤖",
  "How accurate are your answers?": "I'm trained on your specific data, so my answers are highly relevant. I achieve 95%+ accuracy on trained topics!",
  "Can you speak multiple languages?": "Yes! I support 50+ languages and can auto-detect the user's language for seamless conversations. 🌍",
};

const suggestions = Object.keys(presetResponses);

const DemoChat = () => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    { role: "bot", text: "Hi! I'm an AI chatbot demo. Try clicking one of the suggested questions below! 👇" },
  ]);

  const handleSend = (text: string) => {
    const response = presetResponses[text] || "That's a great question! In a real deployment, I'd search through your knowledge base to find the perfect answer.";
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: response },
    ]);
  };

  return (
    <section className="py-28 section-alt relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-primary/8 blur-[120px]" />

      <div className="container relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            Live Demo
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
            Try it <span className="gradient-text">yourself</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Interact with a sample chatbot to see the experience your users will get.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="max-w-2xl mx-auto relative">
          {/* Glow */}
          <div className="absolute -inset-3 rounded-3xl bg-primary/5 blur-2xl" />

          <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden glow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary glow-sm">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Demo Chatbot</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 min-h-[280px] max-h-[400px] overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bot" && (
                    <div className="flex-shrink-0 h-7 w-7 rounded-full gradient-primary flex items-center justify-center mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-br-md glow-sm"
                        : "bg-secondary text-foreground rounded-bl-md border border-border/30"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-secondary flex items-center justify-center mt-0.5 border border-border/50">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/5 hover:bg-primary/15 hover:border-primary/40 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border/50 px-5 py-3 flex items-center gap-3">
              <input
                type="text"
                placeholder="Click a suggestion above..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                readOnly
              />
              <button className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary opacity-50 glow-sm">
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default DemoChat;
