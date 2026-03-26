import { Button } from "@/components/ui/button";
import { Send, Bot, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const chatMessages = [
  { role: "user" as const, text: "What's your return policy?" },
  { role: "bot" as const, text: "We offer a 30-day money-back guarantee on all plans. No questions asked! 🎉" },
  { role: "user" as const, text: "Can I upgrade my plan anytime?" },
  { role: "bot" as const, text: "Absolutely! You can upgrade or downgrade at any time from your dashboard." },
];

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
    {/* Animated background orbs */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
    </div>

    {/* Grid pattern overlay */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
    }} />

    <div className="container relative grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 lg:py-0">
      {/* Left */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary glow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Now with GPT-4o support
          <ArrowRight className="h-3 w-3" />
        </motion.div>

        <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
          Build Your Own{" "}
          <span className="gradient-text">AI Chatbot</span>{" "}
          in Minutes
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
          Train chatbots on your data and deploy anywhere — website, WhatsApp, API.
          No coding required.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button variant="hero" size="lg" className="text-base px-8" asChild>
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" className="text-base px-8" asChild>
            <Link to="/features">View Demo</Link>
          </Button>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Free forever plan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            2 min setup
          </span>
        </div>
      </motion.div>

      {/* Right — Chat mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative"
      >
        {/* Glow behind the card */}
        <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl opacity-60" />

        <div className="relative glass rounded-2xl glow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
            <img src="/logo.png" alt="Chetti" className="h-9 w-9 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-foreground">Chetti</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 min-h-[300px]">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.3, duration: 0.4 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md glow-sm"
                      : "bg-secondary text-foreground rounded-bl-md border border-border/50"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border/50 px-5 py-3 flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              readOnly
            />
            <button className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary glow-sm">
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
