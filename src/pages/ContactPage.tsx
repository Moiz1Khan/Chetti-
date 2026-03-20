import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    }, 1000);
  };

  return (
    <PublicPageLayout>
      <div className="container max-w-5xl space-y-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Have a question or need help? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "support@paisoltechnology.com" },
              { icon: MapPin, label: "Location", value: "Remote-first, Worldwide" },
              { icon: Clock, label: "Response Time", value: "Within 24 hours" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Tell us more..." rows={5} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default ContactPage;
