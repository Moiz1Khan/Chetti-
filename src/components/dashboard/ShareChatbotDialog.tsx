import { useState } from "react";
import { Copy, Check, Code, Link2, Globe, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPublicSiteUrl } from "@/lib/site-url";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ShareChatbotDialogProps {
  chatbotId: string;
  chatbotName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareChatbotDialog = ({ chatbotId, chatbotName, open, onOpenChange }: ShareChatbotDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["chatbot-settings-share", chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from("chatbot_settings")
        .upsert({ chatbot_id: chatbotId, ...updates }, { onConflict: "chatbot_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings-share", chatbotId] });
    },
  });

  const baseUrl = getPublicSiteUrl() || window.location.origin;
  const publicUrl = `${baseUrl}/chatbot/${chatbotId}`;
  const primaryColor = settings?.primary_color || "#4F46E5";

  const iframeCode = `<iframe\n  src="${publicUrl}"\n  width="400"\n  height="600"\n  style="border:none;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.15);"\n></iframe>`;

  const widgetCode = `<script>\n(function(){\n  var d=document,s=d.createElement('script');\n  s.src='${baseUrl}/widget.js';\n  s.onload=function(){\n    ChatbotWidget.init({\n      chatbot_id:'${chatbotId}',\n      position:'bottom-right',\n      color:'${primaryColor}'\n    });\n  };\n  d.body.appendChild(s);\n})();\n</script>`;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Share "{chatbotName}"
          </DialogTitle>
          <DialogDescription>
            Deploy your chatbot on any website or share via direct link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Public toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Public Access</p>
              <p className="text-xs text-muted-foreground">Anyone with the link can chat</p>
            </div>
            <Switch
              checked={settings?.is_public !== false}
              onCheckedChange={(checked) => updateMutation.mutate({ is_public: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Allow Embedding</p>
              <p className="text-xs text-muted-foreground">Enable iframe and widget embeds</p>
            </div>
            <Switch
              checked={settings?.embed_enabled !== false}
              onCheckedChange={(checked) => updateMutation.mutate({ embed_enabled: checked })}
            />
          </div>

          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link" className="text-xs">
                <Link2 className="h-3 w-3 mr-1" /> Link
              </TabsTrigger>
              <TabsTrigger value="iframe" className="text-xs">
                <Code className="h-3 w-3 mr-1" /> Iframe
              </TabsTrigger>
              <TabsTrigger value="widget" className="text-xs">
                <QrCode className="h-3 w-3 mr-1" /> Widget
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-3 mt-3">
              <Label>Public URL</Label>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="text-sm font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyText(publicUrl, "URL")}
                >
                  {copied === "URL" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(publicUrl, "_blank")}
              >
                Open in new tab
              </Button>
            </TabsContent>

            <TabsContent value="iframe" className="space-y-3 mt-3">
              <Label>Iframe Embed Code</Label>
              <Textarea
                value={iframeCode}
                readOnly
                rows={6}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyText(iframeCode, "Iframe code")}
              >
                {copied === "Iframe code" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                Copy Iframe Code
              </Button>
            </TabsContent>

            <TabsContent value="widget" className="space-y-3 mt-3">
              <Label>JavaScript Widget</Label>
              <Textarea
                value={widgetCode}
                readOnly
                rows={10}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyText(widgetCode, "Widget code")}
              >
                {copied === "Widget code" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                Copy Widget Code
              </Button>
              <p className="text-xs text-muted-foreground">
                Add this script before the closing &lt;/body&gt; tag. A floating chat button will appear.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareChatbotDialog;
