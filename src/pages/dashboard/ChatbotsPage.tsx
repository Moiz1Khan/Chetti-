import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Plus, MoreVertical, Pencil, Trash2, MessageSquare, Share2, Lock } from "lucide-react";
import ShareChatbotDialog from "@/components/dashboard/ShareChatbotDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatbotsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [shareBot, setShareBot] = useState<{ id: string; name: string } | null>(null);
  const { plan, limits, loading: subLoading } = useSubscription();

  const { data: chatbots, isLoading } = useQuery({
    queryKey: ["chatbots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbots").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase.from("chatbots").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chatbots"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chatbots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      setDeleteId(null);
      toast({ title: "Chatbot Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const chatbotCount = chatbots?.length || 0;
  const canCreate = chatbotCount < limits.chatbots;
  const limitLabel = limits.chatbots === Infinity ? "Unlimited" : `${chatbotCount}/${limits.chatbots}`;

  const handleCreate = () => {
    if (!canCreate) {
      toast({
        title: "Chatbot limit reached",
        description: `Your ${limits.chatbots === 1 ? "Free" : plan.charAt(0).toUpperCase() + plan.slice(1)} plan allows ${limits.chatbots} chatbot${limits.chatbots > 1 ? "s" : ""}. Upgrade to create more.`,
        variant: "destructive",
      });
      navigate("/dashboard/billing");
      return;
    }
    navigate("/dashboard/chatbots/builder/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">My Chatbots</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage your AI chatbots.
            {!subLoading && (
              <span className="ml-2">
                <Badge variant="outline" className="text-xs">{limitLabel} chatbots</Badge>
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleCreate} disabled={!canCreate && !subLoading} className="w-full sm:w-auto">
          {canCreate ? <Plus className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
          {canCreate ? "Create Chatbot" : "Upgrade to Create"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : chatbots && chatbots.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatbots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{bot.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bot.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/chatbots/chat/${bot.id}`)}>
                        <MessageSquare className="h-4 w-4 mr-2" /> Open Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShareBot({ id: bot.id, name: bot.name })}>
                        <Share2 className="h-4 w-4 mr-2" /> Share & Embed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/chatbots/builder/${bot.id}`)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(bot.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {bot.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={bot.status ? "default" : "secondary"}>
                    {bot.status ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={bot.status}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: bot.id, status: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-2">No chatbots yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first AI chatbot to get started.</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" /> Create Chatbot
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chatbot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The chatbot and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {shareBot && (
        <ShareChatbotDialog
          chatbotId={shareBot.id}
          chatbotName={shareBot.name}
          open={!!shareBot}
          onOpenChange={(open) => !open && setShareBot(null)}
        />
      )}
    </div>
  );
};

export default ChatbotsPage;
