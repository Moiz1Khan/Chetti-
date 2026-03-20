import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const AboutPage = () => (
  <PublicPageLayout>
    <div className="container max-w-3xl space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">About Chetti</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered chatbots, built for everyone.
        </p>
      </div>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Chetti is an AI chatbot platform built by{" "}
          <a href="https://paisoltechnology.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
            Paisol Technology
          </a>
          . Our mission is to make AI accessible to every business — from solo entrepreneurs to growing agencies.
        </p>
        <p>
          With Chetti, you can build custom chatbots trained on your own data, embed them on any website, and scale with plans that grow with you. No coding required.
        </p>
        <p>
          We believe that every business deserves a smart assistant that understands their products, speaks their language, and works 24/7 — and that's exactly what Chetti delivers.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 text-center">
        {[
          { stat: "10K+", label: "Chatbots Created" },
          { stat: "500K+", label: "Messages Processed" },
          { stat: "99.9%", label: "Uptime" },
        ].map((s) => (
          <div key={s.label} className="p-6 rounded-xl border border-border bg-card">
            <p className="text-3xl font-display font-bold text-foreground">{s.stat}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button asChild variant="hero">
          <Link to="/signup" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Get Started Free
          </Link>
        </Button>
      </div>
    </div>
  </PublicPageLayout>
);

export default AboutPage;
