import { Upload, Cpu, Rocket } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const steps = [
  { icon: Upload, title: "Upload Your Data", desc: "Upload documents, paste URLs, or connect your knowledge base." },
  { icon: Cpu, title: "Train Your Chatbot", desc: "Our AI processes your data and trains a custom chatbot model." },
  { icon: Rocket, title: "Embed & Start Chatting", desc: "Deploy on your website with a single line of code." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-28 relative">
    {/* Background glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[120px]" />

    <div className="container relative">
      <AnimatedSection className="text-center max-w-2xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
          How It Works
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
          Three steps to your{" "}
          <span className="gradient-text">AI chatbot</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Get from zero to a live chatbot in under 5 minutes.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {steps.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.15} className="text-center relative">
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground mb-6 glow-md">
                <s.icon className="h-7 w-7" />
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{s.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
