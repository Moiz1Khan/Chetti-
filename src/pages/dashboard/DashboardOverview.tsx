import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bot, MessageSquare, Zap, Crown, Plus, FolderOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSubscription } from "@/hooks/use-subscription";

const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plan, limits, loading: subLoading } = useSubscription();

  const { data: chatbots, isLoading: loadingBots } = useQuery({
    queryKey: ["chatbots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: usage, isLoading: loadingUsage } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usage")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const totalMessages = usage?.reduce((sum, u) => sum + u.messages_used, 0) || 0;
  const activeBots = chatbots?.filter((b) => b.status).length || 0;
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  const chartData = usage?.map((u) => ({
    date: new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    messages: u.messages_used,
  })) || [];

  const stats = [
    { title: "Total Chatbots", value: `${chatbots?.length || 0}/${limits.chatbots === Infinity ? "∞" : limits.chatbots}`, icon: Bot, color: "text-primary" },
    { title: "Messages Used", value: totalMessages, icon: MessageSquare, color: "text-blue-500" },
    { title: "Active Bots", value: activeBots, icon: Zap, color: "text-green-500" },
    { title: "Current Plan", value: subLoading ? "..." : planName, icon: Crown, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Here's an overview of your chatbot platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              {loadingBots || loadingUsage ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Message Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsage ? (
              <Skeleton className="h-[250px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No usage data yet. Start chatting to see trends!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" onClick={() => navigate("/dashboard/chatbots")}>
              <Plus className="h-4 w-4 mr-2" /> Create New Chatbot
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/knowledge")}>
              <FolderOpen className="h-4 w-4 mr-2" /> Upload Knowledge
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/analytics")}>
              <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Chatbots */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Recent Chatbots</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/chatbots")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loadingBots ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : chatbots && chatbots.length > 0 ? (
            <div className="space-y-3">
              {chatbots.slice(0, 5).map((bot) => (
                <div key={bot.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{bot.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(bot.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={bot.status ? "default" : "secondary"}>
                      {bot.status ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/chatbots")}>
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No chatbots yet</p>
              <Button size="sm" onClick={() => navigate("/dashboard/chatbots")}>
                <Plus className="h-4 w-4 mr-1" /> Create Your First Chatbot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
