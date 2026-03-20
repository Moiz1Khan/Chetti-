import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, Bot, MessageSquare, Activity, Mail, Database, TrendingUp, Search,
  Clock, Zap,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, LineChart, Line,
} from "recharts";

const CHART_COLORS = [
  "hsl(263, 70%, 58%)", "hsl(280, 80%, 50%)", "hsl(220, 80%, 65%)",
  "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)",
];

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(240,6%,6%)", border: "1px solid hsl(240,4%,16%)", borderRadius: 8 },
  labelStyle: { color: "hsl(0,0%,95%)" },
};

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  created_at: string;
  chatbot_count: number;
}

interface ChatbotInfo {
  id: string;
  name: string;
  status: boolean;
  created_at: string;
  user_email: string;
  user_name: string | null;
  message_count: number;
}

interface DailyActivity {
  date: string;
  messages: number;
}

interface PlatformStats {
  totalUsers: number;
  totalChatbots: number;
  totalMessages: number;
  totalLeads: number;
  activeChatbots: number;
  totalKnowledge: number;
}

interface AdminAnalyticsTabProps {
  users: UserWithRoles[];
  chatbots: ChatbotInfo[];
  stats: PlatformStats;
  dailyActivity: DailyActivity[];
  loading: boolean;
}

const StatCard = ({ icon: Icon, label, value, color, subtitle }: { icon: any; label: string; value: number | string; color: string; subtitle?: string }) => (
  <Card>
    <CardHeader className="pb-1 pt-4 px-4">
      <div className="flex items-center justify-between">
        <CardDescription className="text-xs">{label}</CardDescription>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <CardTitle className="text-xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</CardTitle>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </CardHeader>
  </Card>
);

const AdminAnalyticsTab = ({ users, chatbots, stats, dailyActivity, loading }: AdminAnalyticsTabProps) => {
  // User growth over time (by month)
  const userGrowth = useMemo(() => {
    const monthMap: Record<string, number> = {};
    users.forEach((u) => {
      const key = format(new Date(u.created_at), "yyyy-MM");
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    return sorted.map(([month, count]) => {
      cumulative += count;
      return { month: format(new Date(month + "-01"), "MMM yy"), newUsers: count, totalUsers: cumulative };
    });
  }, [users]);

  // Chatbot growth over time
  const chatbotGrowth = useMemo(() => {
    const monthMap: Record<string, number> = {};
    chatbots.forEach((c) => {
      const key = format(new Date(c.created_at), "yyyy-MM");
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    return sorted.map(([month, count]) => {
      cumulative += count;
      return { month: format(new Date(month + "-01"), "MMM yy"), newBots: count, totalBots: cumulative };
    });
  }, [chatbots]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const counts = { Admin: 0, Moderator: 0, User: 0, "No Role": 0 };
    users.forEach((u) => {
      if (u.roles.length === 0) counts["No Role"]++;
      u.roles.forEach((r) => {
        if (r === "admin") counts.Admin++;
        else if (r === "moderator") counts.Moderator++;
        else if (r === "user") counts.User++;
      });
    });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [users]);

  // Top chatbots by messages
  const topChatbots = useMemo(() =>
    [...chatbots].sort((a, b) => b.message_count - a.message_count).slice(0, 10),
    [chatbots]);

  // Chatbot status distribution
  const statusDistribution = useMemo(() => [
    { name: "Active", value: chatbots.filter((c) => c.status).length },
    { name: "Inactive", value: chatbots.filter((c) => !c.status).length },
  ].filter((d) => d.value > 0), [chatbots]);

  // Users by chatbot count
  const usersByBotCount = useMemo(() => {
    const buckets = { "0 bots": 0, "1 bot": 0, "2-3 bots": 0, "4-5 bots": 0, "6+ bots": 0 };
    users.forEach((u) => {
      if (u.chatbot_count === 0) buckets["0 bots"]++;
      else if (u.chatbot_count === 1) buckets["1 bot"]++;
      else if (u.chatbot_count <= 3) buckets["2-3 bots"]++;
      else if (u.chatbot_count <= 5) buckets["4-5 bots"]++;
      else buckets["6+ bots"]++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [users]);

  // Recent stats (7 days / 30 days)
  const recentStats = useMemo(() => {
    const now = new Date();
    const d7 = subDays(now, 7);
    const d30 = subDays(now, 30);
    return {
      newUsers7d: users.filter((u) => isAfter(new Date(u.created_at), d7)).length,
      newUsers30d: users.filter((u) => isAfter(new Date(u.created_at), d30)).length,
      newBots7d: chatbots.filter((c) => isAfter(new Date(c.created_at), d7)).length,
      newBots30d: chatbots.filter((c) => isAfter(new Date(c.created_at), d30)).length,
      avgBotsPerUser: users.length > 0 ? (chatbots.length / users.length).toFixed(1) : "0",
      avgMsgsPerBot: chatbots.length > 0 ? Math.round(stats.totalMessages / chatbots.length) : 0,
    };
  }, [users, chatbots, stats]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-primary" />
        <StatCard icon={Bot} label="Total Chatbots" value={stats.totalChatbots} color="text-primary" />
        <StatCard icon={Activity} label="Active Bots" value={stats.activeChatbots} color="text-success" />
        <StatCard icon={MessageSquare} label="Total Messages" value={stats.totalMessages} color="text-primary" />
        <StatCard icon={Mail} label="Leads Captured" value={stats.totalLeads} color="text-primary" />
        <StatCard icon={Database} label="Knowledge Files" value={stats.totalKnowledge} color="text-primary" />
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="New Users (7d)" value={recentStats.newUsers7d} color="text-success" />
        <StatCard icon={TrendingUp} label="New Users (30d)" value={recentStats.newUsers30d} color="text-success" />
        <StatCard icon={Zap} label="Avg Bots/User" value={recentStats.avgBotsPerUser} color="text-primary" />
        <StatCard icon={MessageSquare} label="Avg Msgs/Bot" value={recentStats.avgMsgsPerBot} color="text-primary" />
      </div>

      {/* Message Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Message Activity (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyActivity}>
                <defs>
                  <linearGradient id="msgGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(263,70%,58%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(263,70%,58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                <RechartsTooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="messages" stroke="hsl(263,70%,58%)" fill="url(#msgGradA)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No activity data</p>
          )}
        </CardContent>
      </Card>

      {/* User & Chatbot Growth Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="userGrowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220,80%,65%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220,80%,65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                  <RechartsTooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="totalUsers" stroke="hsl(220,80%,65%)" fill="url(#userGrowGrad)" strokeWidth={2} name="Total Users" />
                  <Bar dataKey="newUsers" fill="hsl(263,70%,58%)" radius={[2, 2, 0, 0]} name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chatbot Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {chatbotGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chatbotGrowth}>
                  <defs>
                    <linearGradient id="botGrowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                  <RechartsTooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="totalBots" stroke="hsl(142,71%,45%)" fill="url(#botGrowGrad)" strokeWidth={2} name="Total Bots" />
                  <Bar dataKey="newBots" fill="hsl(38,92%,50%)" radius={[2, 2, 0, 0]} name="New Bots" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {roleDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {statusDistribution.map((_, i) => <Cell key={i} fill={[CHART_COLORS[3], CHART_COLORS[0]][i] || CHART_COLORS[i]} />)}
                </Pie>
                <RechartsTooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users by Bot Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usersByBotCount}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,55%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="hsl(280,80%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Chatbots */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" /> Top Chatbots by Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topChatbots.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topChatbots} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                <XAxis type="number" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                <RechartsTooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="message_count" fill="hsl(263,70%,58%)" radius={[0, 4, 4, 0]} name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No chatbot data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsTab;
