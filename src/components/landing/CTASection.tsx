import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-28 overflow-hidden">
    <div className="container">
      <AnimatedSection className="relative rounded-3xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        <div className="relative px-8 py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Get Started Today
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary-foreground leading-tight">
              Start Building Your AI Chatbot Today
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              Join 1,000+ businesses using AI chatbots to automate support and boost conversions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-base px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
                asChild
              >
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="hero-outline"
                size="lg"
                className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                asChild
              >
                <Link to="/features">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default CTASection;
