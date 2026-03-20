import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const endpoints = [
  { method: "POST", path: "/api/chat", desc: "Send a message and receive AI response for a given chatbot.", auth: true },
  { method: "GET", path: "/api/chatbots", desc: "List all chatbots for the authenticated user.", auth: true },
  { method: "POST", path: "/api/chatbots", desc: "Create a new chatbot with configuration.", auth: true },
  { method: "GET", path: "/api/chatbots/:id", desc: "Get chatbot details by ID.", auth: true },
  { method: "DELETE", path: "/api/chatbots/:id", desc: "Delete a chatbot and all associated data.", auth: true },
  { method: "POST", path: "/api/knowledge", desc: "Upload a knowledge document for training.", auth: true },
];

const ApiReferencePage = () => (
  <PublicPageLayout>
    <div className="container max-w-4xl space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">API Reference</h1>
        <p className="text-lg text-muted-foreground">
          Integrate Chetti into your applications with our RESTful API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All API requests require an API key passed in the <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">Authorization</code> header.
          </p>
          <pre className="bg-secondary rounded-lg p-4 text-sm text-foreground overflow-x-auto">
{`curl -X POST https://api.chetti.app/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"chatbot_id": "...", "message": "Hello"}'`}
          </pre>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold text-foreground">Endpoints</h2>
        {endpoints.map((ep, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={ep.method === "GET" ? "secondary" : ep.method === "DELETE" ? "destructive" : "default"}>
                  {ep.method}
                </Badge>
                <code className="text-sm font-mono text-foreground">{ep.path}</code>
                {ep.auth && <Badge variant="outline" className="text-xs">Auth Required</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{ep.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </PublicPageLayout>
);

export default ApiReferencePage;
