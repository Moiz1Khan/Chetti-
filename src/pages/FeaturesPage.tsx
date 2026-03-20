import PublicPageLayout from "@/layouts/PublicPageLayout";
import FeaturesSection from "@/components/landing/FeaturesSection";

const FeaturesPage = () => (
  <PublicPageLayout>
    <div className="container space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          Powerful Features
        </h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to build, train, and deploy intelligent AI chatbots — all in one platform.
        </p>
      </div>
      <FeaturesSection />
    </div>
  </PublicPageLayout>
);

export default FeaturesPage;
