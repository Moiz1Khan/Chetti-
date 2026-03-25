import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, Plus, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { uuid } from "@/lib/uuid";

const ApiKeysPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("Default");
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api_keys"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const rawKey = `cbai_${uuid().replace(/-/g, "")}`;
      const prefix = rawKey.slice(0, 12) + "...";
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawKey));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      const { error } = await supabase.from("api_keys").insert({
        user_id: user!.id, name: keyName, key_prefix: prefix, key_hash: keyHash,
      });
      if (error) throw error;
      return rawKey;
    },
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: ["api_keys"] });
      setNewKey(key);
      setKeyName("Default");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_keys").update({ revoked: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api_keys"] });
      toast({ title: "API Key Revoked" });
    },
  });

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage your API keys for integration.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setNewKey(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Generate New Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKey ? "API Key Created" : "Generate API Key"}</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">Copy this key now. You won't be able to see it again.</p>
                <div className="flex gap-2">
                  <Input value={newKey} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copyKey(newKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Key Name</Label>
                  <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Production" />
                </div>
              </div>
            )}
            <DialogFooter>
              {newKey ? (
                <Button onClick={() => { setCreateOpen(false); setNewKey(null); }}>Done</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Generating..." : "Generate"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : keys && keys.length > 0 ? (
        <Card>
          <CardContent className="pt-6 space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{k.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{k.key_prefix}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={k.revoked ? "destructive" : "default"}>
                    {k.revoked ? "Revoked" : "Active"}
                  </Badge>
                  {!k.revoked && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revokeMutation.mutate(k.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-2">No API keys yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Generate an API key to integrate with your applications.</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Generate Key
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiKeysPage;
