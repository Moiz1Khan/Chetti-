import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getPublicSiteUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getPublicSiteUrl()}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-foreground mb-2">
            <img src="/logo.png" alt="Chetti" className="h-10 w-10 rounded-xl" />
            Chetti
          </Link>
          <p className="text-muted-foreground mt-2">Reset your password</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <img src="/logo.png" alt="Chetti" className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Check your email</h3>
              <p className="text-sm text-muted-foreground">We've sent a password reset link to <strong>{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
