import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MessageSquare, Code2, Plug, Webhook, Database } from "lucide-react";

const integrations = [
  { name: "Website Embed", desc: "Drop a single script tag to add Chetti to any website.", icon: Globe, status: "Available" },
  { name: "Slack", desc: "Connect your chatbot directly to Slack channels.", icon: MessageSquare, status: "Coming Soon" },
  { name: "REST API", desc: "Full API access to integrate Chetti into any application.", icon: Code2, status: "Available" },
  { name: "Zapier", desc: "Automate workflows by connecting Chetti to 5,000+ apps.", icon: Plug, status: "Coming Soon" },
  { name: "Webhooks", desc: "Get real-time event notifications for your chatbot activity.", icon: Webhook, status: "Coming Soon" },
  { name: "Custom Data Sources", desc: "Train your bot with PDFs, docs, text, and URLs.", icon: Database, status: "Available" },
];

const IntegrationsPage = () => (
  <PublicPageLayout>
    <div className="container space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          Integrations
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect Chetti to the tools you already use. Embed anywhere, automate everything.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <Card key={item.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={item.status === "Available" ? "default" : "secondary"}>{item.status}</Badge>
              </div>
              <CardTitle className="font-display text-lg mt-3">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </PublicPageLayout>
);

export default IntegrationsPage;
