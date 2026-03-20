import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, CheckCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const AnalyticsPage = () => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usage").select("*").order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: chatbots } = useQuery({
    queryKey: ["chatbots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbots").select("*");
      if (error) throw error;
      return data;
    },
  });

  const totalMessages = usage?.reduce((sum, u) => sum + u.messages_used, 0) || 0;
  const activeBots = chatbots?.filter((b) => b.status).length || 0;

  const chartData = usage?.map((u) => ({
    date: new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    messages: u.messages_used,
  })) || [];

  const stats = [
    { title: "Total Messages", value: totalMessages, icon: MessageSquare, color: "text-blue-500" },
    { title: "Active Users", value: 1, icon: Users, color: "text-green-500" },
    { title: "Success Rate", value: "98%", icon: CheckCircle, color: "text-emerald-500" },
    { title: "Active Bots", value: activeBots, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your chatbot performance and usage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              {isLoading ? <Skeleton className="h-16 w-full" /> : (
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="font-display">Messages Over Time</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">Top Chatbots</CardTitle></CardHeader>
          <CardContent>
            {chatbots && chatbots.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chatbots.slice(0, 5).map((b) => ({ name: b.name, active: b.status ? 1 : 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="active" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No chatbots yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
