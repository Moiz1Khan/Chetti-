import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Github, Twitter, Users } from "lucide-react";

const channels = [
  { name: "Discord", desc: "Join our Discord server for real-time help, discussions, and feature requests.", icon: MessageSquare, link: "#", cta: "Join Discord" },
  { name: "GitHub", desc: "Report bugs, request features, and contribute to the Chetti ecosystem.", icon: Github, link: "#", cta: "View GitHub" },
  { name: "Twitter / X", desc: "Follow us for product updates, tips, and AI chatbot insights.", icon: Twitter, link: "#", cta: "Follow Us" },
  { name: "Forum", desc: "Browse community discussions, share templates, and learn from other users.", icon: Users, link: "#", cta: "Visit Forum" },
];

const CommunityPage = () => (
  <PublicPageLayout>
    <div className="container space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Community</h1>
        <p className="text-lg text-muted-foreground">
          Connect with builders, get help, and help shape the future of Chetti.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {channels.map((c) => (
          <Card key={c.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display">{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <Button variant="outline" size="sm">{c.cta}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </PublicPageLayout>
);

export default CommunityPage;
