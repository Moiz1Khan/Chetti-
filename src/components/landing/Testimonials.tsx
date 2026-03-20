import { Star } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    name: "Sarah Chen",
    company: "TechFlow Inc.",
    role: "Head of Support",
    feedback: "We reduced our support tickets by 60% within the first month. The chatbot handles common questions perfectly.",
  },
  {
    name: "Marcus Johnson",
    company: "DataSync",
    role: "CTO",
    feedback: "The API integration was seamless. We embedded the chatbot into our app in under an hour. Game changer.",
  },
  {
    name: "Elena Rodriguez",
    company: "NovaSoft",
    role: "Product Manager",
    feedback: "Our customers love the instant responses. The analytics dashboard helps us continuously improve the experience.",
  },
  {
    name: "David Kim",
    company: "CloudBase",
    role: "Founder",
    feedback: "Best chatbot platform we've tried. The training on our own docs means it actually gives accurate answers.",
  },
];

const Testimonials = () => (
  <section id="testimonials" className="py-28 section-alt relative">
    <div className="container relative">
      <AnimatedSection className="text-center max-w-2xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
          Testimonials
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
          Loved by teams <span className="gradient-text">everywhere</span>
        </h2>
      </AnimatedSection>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t, i) => (
          <AnimatedSection key={t.name} delay={i * 0.08}>
            <div className="rounded-xl border border-border/60 bg-card/50 p-6 h-full flex flex-col hover:border-primary/20 hover:bg-card/80 transition-all duration-500 backdrop-blur-sm border-glow-hover">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">"{t.feedback}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
