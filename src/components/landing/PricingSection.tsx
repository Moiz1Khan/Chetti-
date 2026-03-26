import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for trying things out",
    features: ["1 chatbot", "100 messages/mo", "1 data source", "Community support"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For growing businesses",
    features: ["5 chatbots", "10,000 messages/mo", "Unlimited data sources", "Remove branding", "Priority support", "API access"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    desc: "For teams and agencies",
    features: ["Unlimited chatbots", "100,000 messages/mo", "Unlimited data sources", "White-label", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-28 relative overflow-hidden">
    {/* Background glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[150px]" />

    <div className="container relative">
      <AnimatedSection className="text-center max-w-2xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
          Pricing
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
          Simple, <span className="gradient-text">transparent</span> pricing
        </h2>
        <p className="text-muted-foreground text-lg">
          Start free and scale as you grow. No hidden fees.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <AnimatedSection key={plan.name} delay={i * 0.1}>
            <div
              className={`relative rounded-2xl border p-8 h-full flex flex-col transition-all duration-500 ${
                plan.highlighted
                  ? "border-primary/40 bg-card/80 glow-lg scale-[1.02]"
                  : "border-border/60 bg-card/40 hover:border-border hover:bg-card/60 border-glow-hover"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1.5 glow-sm">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-display font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.name === "Agency" ? (
                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <Link to="/contact">{plan.cta}</Link>
                </Button>
              ) : (
                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <Link to="/signup">{plan.cta}</Link>
                </Button>
              )}
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
