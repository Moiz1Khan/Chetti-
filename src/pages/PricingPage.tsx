import PublicPageLayout from "@/layouts/PublicPageLayout";
import PricingSection from "@/components/landing/PricingSection";

const PricingPage = () => (
  <PublicPageLayout>
    <div className="container space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Start free and scale as you grow. No hidden fees.
        </p>
      </div>
      <PricingSection />
    </div>
  </PublicPageLayout>
);

export default PricingPage;
