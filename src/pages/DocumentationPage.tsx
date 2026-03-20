import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Code2, Rocket, Settings2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  { title: "Getting Started", desc: "Create your account, build your first chatbot, and go live in under 5 minutes.", icon: Rocket },
  { title: "Chatbot Builder", desc: "Configure system prompts, models, temperature, and appearance settings.", icon: Settings2 },
  { title: "Knowledge Base", desc: "Upload documents and train your chatbot on your own data using RAG.", icon: Book },
  { title: "API Reference", desc: "Integrate Chetti into your applications with our REST API.", icon: Code2 },
];

const DocumentationPage = () => (
  <PublicPageLayout>
    <div className="container space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to build, train, and deploy AI chatbots with Chetti.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {sections.map((s) => (
          <Card key={s.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-display">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <Button asChild>
          <Link to="/signup" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> Get Started
          </Link>
        </Button>
      </div>
    </div>
  </PublicPageLayout>
);

export default DocumentationPage;
