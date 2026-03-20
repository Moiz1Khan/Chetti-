import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Badge } from "@/components/ui/badge";

const entries = [
  { date: "Mar 2026", title: "Billing & Subscription Plans", desc: "Introduced Free, Pro, and Agency plans with Stripe integration for seamless upgrades.", tag: "New" },
  { date: "Mar 2026", title: "Email Notifications", desc: "Automated welcome emails, chatbot activity alerts, and OTP verification powered by Resend.", tag: "New" },
  { date: "Mar 2026", title: "Knowledge Base & RAG", desc: "Upload PDFs, text files, and URLs to train chatbots on your own data with retrieval-augmented generation.", tag: "Feature" },
  { date: "Feb 2026", title: "Chatbot Builder v2", desc: "Redesigned chatbot builder with live preview, appearance customization, and quick reply templates.", tag: "Improvement" },
  { date: "Feb 2026", title: "Public Chat Embed", desc: "Embeddable chat widget with script tag for any website. Includes lead capture and idle messages.", tag: "Feature" },
  { date: "Jan 2026", title: "API Keys & Developer Access", desc: "Generate and manage API keys for programmatic chatbot access.", tag: "Feature" },
];

const ChangelogPage = () => (
  <PublicPageLayout>
    <div className="container max-w-3xl space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Changelog</h1>
        <p className="text-lg text-muted-foreground">What's new and improved in Chetti.</p>
      </div>
      <div className="space-y-8">
        {entries.map((e, i) => (
          <div key={i} className="flex gap-6 border-l-2 border-primary/30 pl-6 relative">
            <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">{e.date}</span>
                <Badge variant={e.tag === "New" ? "default" : "secondary"}>{e.tag}</Badge>
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </PublicPageLayout>
);

export default ChangelogPage;
