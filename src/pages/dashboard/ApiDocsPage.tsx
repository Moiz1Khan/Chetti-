import { useState } from "react";
import { Copy, Check, BookOpen, Key, MessageSquare, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-chat`;

const codeExamples = {
  curl: `curl -X POST "${BASE_URL}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbot_id": "YOUR_CHATBOT_ID",
    "message": "Hello, how does your product work?",
    "include_sources": true
  }'`,
  javascript: `const response = await fetch("${BASE_URL}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    chatbot_id: "YOUR_CHATBOT_ID",
    message: "Hello, how does your product work?",
    include_sources: true,
  }),
});

const data = await response.json();
console.log(data.response);
console.log(data.sources);`,
  python: `import requests

response = requests.post(
    "${BASE_URL}",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "chatbot_id": "YOUR_CHATBOT_ID",
        "message": "Hello, how does your product work?",
        "include_sources": True,
    },
)

data = response.json()
print(data["response"])
print(data.get("sources", []))`,
};

const multiTurnExample = `// Multi-turn conversation
const messages = [
  { role: "user", content: "What is your return policy?" },
  { role: "assistant", content: "Our return policy allows..." },
  { role: "user", content: "How long do I have?" },
];

const response = await fetch("${BASE_URL}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    chatbot_id: "YOUR_CHATBOT_ID",
    messages,
  }),
});`;

const ApiDocsPage = () => {
  const { toast } = useToast();
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono text-foreground">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyCode(code, id)}
      >
        {copiedBlock === id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">API Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Integrate your chatbots into any application using our REST API.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The Chat API lets you send messages to your chatbots programmatically and receive AI-generated responses
            powered by your knowledge base (RAG).
          </p>
          <div className="flex items-center gap-2">
            <Badge>POST</Badge>
            <code className="bg-muted px-2 py-1 rounded text-xs font-mono text-foreground">{BASE_URL}</code>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" /> Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            All API requests require an API key sent via the <code className="bg-muted px-1 rounded text-foreground">Authorization</code> header.
          </p>
          <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} id="auth-header" />
          <p>
            Generate API keys from the{" "}
            <a href="/dashboard/api-keys" className="text-primary underline">
              API Keys
            </a>{" "}
            page. Keys are hashed after creation and cannot be viewed again — copy them immediately.
          </p>
        </CardContent>
      </Card>

      {/* Chat Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Chat Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-foreground">Request Body</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-foreground">Parameter</th>
                    <th className="text-left py-2 pr-4 text-foreground">Type</th>
                    <th className="text-left py-2 pr-4 text-foreground">Required</th>
                    <th className="text-left py-2 text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-mono text-xs">chatbot_id</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2">UUID of the chatbot</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-mono text-xs">message</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Yes*</td>
                    <td className="py-2">Single message (use this or <code className="bg-muted px-1 rounded">messages</code>)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-mono text-xs">messages</td>
                    <td className="py-2 pr-4">array</td>
                    <td className="py-2 pr-4">Yes*</td>
                    <td className="py-2">Array of message objects for multi-turn conversations</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">include_sources</td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Include knowledge base sources in response</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-foreground">Response</h4>
            <CodeBlock
              code={`{
  "response": "AI generated answer based on your knowledge base...",
  "sources": [
    {
      "file_name": "product-guide.pdf",
      "content_preview": "Our product works by..."
    }
  ]
}`}
              id="response-example"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Code Examples</h4>
            <Tabs defaultValue="curl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock code={codeExamples.curl} id="curl" />
              </TabsContent>
              <TabsContent value="javascript">
                <CodeBlock code={codeExamples.javascript} id="js" />
              </TabsContent>
              <TabsContent value="python">
                <CodeBlock code={codeExamples.python} id="python" />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Multi-turn Conversations</h4>
            <p className="text-sm text-muted-foreground">
              Use the <code className="bg-muted px-1 rounded text-foreground">messages</code> parameter to maintain conversation context.
            </p>
            <CodeBlock code={multiTurnExample} id="multi-turn" />
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Error Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground">Status</th>
                  <th className="text-left py-2 text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4"><Badge variant="outline">400</Badge></td>
                  <td className="py-2">Missing required parameters</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4"><Badge variant="destructive">401</Badge></td>
                  <td className="py-2">Invalid or revoked API key</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4"><Badge variant="outline">404</Badge></td>
                  <td className="py-2">Chatbot not found or access denied</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><Badge variant="destructive">502</Badge></td>
                  <td className="py-2">AI gateway error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocsPage;
