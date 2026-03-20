import AnimatedSection from "./AnimatedSection";

const logos = ["Acme Corp", "TechFlow", "NovaSoft", "DataSync", "CloudBase", "AppWorks"];

const SocialProof = () => (
  <section className="py-16 border-y border-border/30 relative">
    <div className="container">
      <AnimatedSection className="text-center mb-10">
        <p className="text-sm font-medium text-muted-foreground">
          Trusted by <span className="text-primary font-semibold">1,000+</span> businesses worldwide
        </p>
      </AnimatedSection>
      <AnimatedSection delay={0.1} className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
        {logos.map((name) => (
          <div
            key={name}
            className="text-lg font-display font-bold text-muted-foreground/30 tracking-wide select-none hover:text-primary/40 transition-colors duration-300"
          >
            {name}
          </div>
        ))}
      </AnimatedSection>
    </div>
  </section>
);

export default SocialProof;
