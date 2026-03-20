import { FileText, Globe, Sparkles, Code2, BarChart3, Layout } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const features = [
  { icon: FileText, title: "Upload Documents", desc: "Upload PDF, DOCX, TXT files to build your chatbot's knowledge base instantly." },
  { icon: Globe, title: "Website Scraping", desc: "Automatically scrape your website content and train your chatbot on it." },
  { icon: Sparkles, title: "GPT-Powered Answers", desc: "Leverage the latest GPT models for accurate, context-aware responses." },
  { icon: Layout, title: "Embed Anywhere", desc: "Drop a single code snippet to embed your chatbot on any website." },
  { icon: Code2, title: "API Access", desc: "Full REST API access for developers to integrate chatbot into any workflow." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track conversations, user satisfaction, and chatbot performance in real time." },
];

const FeaturesSection = () => (
  <section id="features" className="py-28 section-alt relative">
    <div className="container relative">
      <AnimatedSection className="text-center max-w-2xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
          Features
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
          Everything you need to build{" "}
          <span className="gradient-text">intelligent chatbots</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Powerful tools to create, train, and deploy AI chatbots — all in one platform.
        </p>
      </AnimatedSection>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <AnimatedSection key={f.title} delay={i * 0.08}>
            <div className="group relative rounded-xl border border-border/60 bg-card/50 p-7 hover:border-primary/30 hover:bg-card/80 transition-all duration-500 h-full backdrop-blur-sm border-glow-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary/20 group-hover:glow-sm transition-all duration-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2.5 text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
