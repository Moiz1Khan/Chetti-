import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const posts = [
  { title: "How to Build a Custom AI Chatbot in 5 Minutes", date: "Mar 15, 2026", tag: "Tutorial", excerpt: "Learn how to create, train, and deploy a custom AI chatbot using Chetti's no-code builder." },
  { title: "RAG Explained: Teaching AI with Your Own Data", date: "Mar 10, 2026", tag: "AI", excerpt: "Understand how retrieval-augmented generation works and why it makes your chatbot smarter." },
  { title: "Why Every Business Needs an AI Chatbot in 2026", date: "Mar 5, 2026", tag: "Business", excerpt: "AI chatbots are transforming customer support, sales, and engagement — here's why you need one." },
  { title: "Embedding Chetti on Your Website: A Complete Guide", date: "Feb 28, 2026", tag: "Guide", excerpt: "Step-by-step instructions for adding Chetti's chat widget to any website with a single script tag." },
  { title: "Announcing Chetti Pro & Agency Plans", date: "Feb 20, 2026", tag: "Announcement", excerpt: "We're introducing paid plans with advanced features, higher limits, and priority support." },
];

const BlogPage = () => (
  <PublicPageLayout>
    <div className="container max-w-4xl space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Blog</h1>
        <p className="text-lg text-muted-foreground">Insights, tutorials, and updates from the Chetti team.</p>
      </div>
      <div className="space-y-6">
        {posts.map((post, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">{post.tag}</Badge>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </PublicPageLayout>
);

export default BlogPage;
