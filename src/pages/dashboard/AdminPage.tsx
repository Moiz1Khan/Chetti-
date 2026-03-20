import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/use-role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield, ShieldCheck, UserCog, Trash2, Plus, Users, Bot,
  BarChart3, Search, DollarSign, RefreshCw, MoreHorizontal, Ban, UserCheck, UserX,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AdminPaymentsTab from "@/components/admin/AdminPaymentsTab";
import AdminAnalyticsTab from "@/components/admin/AdminAnalyticsTab";

// --- Types ---
interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  created_at: string;
  chatbot_count: number;
  is_banned: boolean;
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

interface PlatformStats {
  totalUsers: number;
  totalChatbots: number;
  totalMessages: number;
  totalLeads: number;
  activeChatbots: number;
  totalKnowledge: number;
}

interface DailyActivity {
  date: string;
  messages: number;
}

const AdminPage = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [chatbots, setChatbots] = useState<ChatbotInfo[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, totalChatbots: 0, totalMessages: 0,
    totalLeads: 0, activeChatbots: 0, totalKnowledge: 0,
  });
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");
  const [chatbotSearch, setChatbotSearch] = useState("");

  // --- Data Fetching ---
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchChatbots(), fetchStats(), fetchDailyActivity()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: roles }, { data: allChatbots }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at"),
      supabase.from("user_roles" as any).select("user_id, role"),
      supabase.from("chatbots").select("user_id"),
    ]);

    const rolesMap: Record<string, string[]> = {};
    if (roles) (roles as any[]).forEach((r: any) => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });

    const botCount: Record<string, number> = {};
    if (allChatbots) allChatbots.forEach((c) => { botCount[c.user_id] = (botCount[c.user_id] || 0) + 1; });

    setUsers((profiles || []).map((p) => ({
      id: p.id, email: p.email || "No email", full_name: p.full_name,
      roles: rolesMap[p.id] || [], created_at: p.created_at, chatbot_count: botCount[p.id] || 0,
      is_banned: false,
    })));
  };

  const fetchChatbots = async () => {
    const [{ data: bots }, { data: profiles }, { data: messages }] = await Promise.all([
      supabase.from("chatbots").select("id, name, status, created_at, user_id"),
      supabase.from("profiles").select("id, email, full_name"),
      supabase.from("messages").select("chatbot_id"),
    ]);

    const profileMap: Record<string, { email: string; name: string | null }> = {};
    if (profiles) profiles.forEach((p) => { profileMap[p.id] = { email: p.email || "", name: p.full_name }; });

    const msgCount: Record<string, number> = {};
    if (messages) messages.forEach((m) => { msgCount[m.chatbot_id] = (msgCount[m.chatbot_id] || 0) + 1; });

    setChatbots((bots || []).map((b) => ({
      id: b.id, name: b.name, status: b.status, created_at: b.created_at,
      user_email: profileMap[b.user_id]?.email || "Unknown",
      user_name: profileMap[b.user_id]?.name || null,
      message_count: msgCount[b.id] || 0,
    })));
  };

  const fetchStats = async () => {
    const [
      { count: totalUsers }, { count: totalChatbots }, { count: totalMessages },
      { count: totalLeads }, { count: activeChatbots }, { count: totalKnowledge },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("chatbots").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("chatbots").select("*", { count: "exact", head: true }).eq("status", true),
      supabase.from("knowledge_base").select("*", { count: "exact", head: true }),
    ]);
    setStats({
      totalUsers: totalUsers || 0, totalChatbots: totalChatbots || 0,
      totalMessages: totalMessages || 0, totalLeads: totalLeads || 0,
      activeChatbots: activeChatbots || 0, totalKnowledge: totalKnowledge || 0,
    });
  };

  const fetchDailyActivity = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: messages } = await supabase
      .from("messages").select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const dayMap: Record<string, number> = {};
    if (messages) messages.forEach((m) => {
      const day = format(new Date(m.created_at), "MMM dd");
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    setDailyActivity(Object.entries(dayMap).map(([date, messages]) => ({ date, messages })));
  };

  useEffect(() => { if (isAdmin) fetchAllData(); }, [isAdmin]);

  // --- User Account Management ---
  const manageUser = async (userId: string, action: "disable" | "enable" | "delete") => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { user_id: userId, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.message || `User ${action}d successfully`);
      if (action === "delete") {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: action === "disable" } : u));
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} user`);
    }
  };


  // --- Role Management ---
  const assignRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles" as any).insert({ user_id: userId, role } as any);
    if (error) { toast.error(error.code === "23505" ? "User already has this role" : "Failed to assign role"); return; }
    toast.success("Role assigned"); fetchUsers();
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles" as any).delete().eq("user_id", userId).eq("role", role);
    if (error) { toast.error("Failed to remove role"); return; }
    toast.success("Role removed"); fetchUsers();
  };

  // --- Filtered Data ---
  const filteredUsers = useMemo(() =>
    users.filter((u) => u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase())
    ), [users, userSearch]);

  const filteredChatbots = useMemo(() =>
    chatbots.filter((c) => c.name.toLowerCase().includes(chatbotSearch.toLowerCase()) ||
      c.user_email.toLowerCase().includes(chatbotSearch.toLowerCase())
    ), [chatbots, chatbotSearch]);

  // --- Guards ---
  if (roleLoading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-display font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Complete platform management & analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="flex h-auto overflow-x-auto w-full sm:w-auto">
          <TabsTrigger value="analytics" className="gap-1.5 flex-1 sm:flex-none">
            <BarChart3 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5 flex-1 sm:flex-none">
            <DollarSign className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 flex-1 sm:flex-none">
            <Users className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="chatbots" className="gap-1.5 flex-1 sm:flex-none">
            <Bot className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Chatbots</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5 flex-1 sm:flex-none">
            <ShieldCheck className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
        </TabsList>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics">
          <AdminAnalyticsTab users={users} chatbots={chatbots} stats={stats} dailyActivity={dailyActivity} loading={loading} />
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments">
          <AdminPaymentsTab />
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-display font-semibold">All Users ({users.length})</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Chatbots</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                    ) : filteredUsers.map((u) => (
                      <TableRow key={u.id} className={u.is_banned ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.is_banned ? "destructive" : "default"} className="text-xs">
                            {u.is_banned ? "Disabled" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(u.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{u.chatbot_count}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.roles.length === 0 ? <span className="text-xs text-muted-foreground">No roles</span> : u.roles.map((r) => (
                              <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {u.is_banned ? (
                                <DropdownMenuItem onClick={() => manageUser(u.id, "enable")} className="text-success">
                                  <UserCheck className="h-4 w-4 mr-2" /> Enable Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => manageUser(u.id, "disable")} className="text-destructive">
                                  <Ban className="h-4 w-4 mr-2" /> Disable Account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <UserX className="h-4 w-4 mr-2" /> Delete Account
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete <strong>{u.email}</strong> and all their data (chatbots, messages, knowledge). This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => manageUser(u.id, "delete")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHATBOTS TAB */}
        <TabsContent value="chatbots" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-display font-semibold">All Chatbots ({chatbots.length})</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chatbots..." value={chatbotSearch} onChange={(e) => setChatbotSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : filteredChatbots.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No chatbots found</TableCell></TableRow>
                    ) : filteredChatbots.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{c.user_name || c.user_email}</TableCell>
                        <TableCell>
                          <Badge variant={c.status ? "default" : "secondary"} className="text-xs">{c.status ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell>{c.message_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM dd, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES TAB */}
        <TabsContent value="roles" className="space-y-4">
          <h2 className="text-lg font-display font-semibold">Role Management</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" /> Assign Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => selectedUserId && selectedRole && assignRole(selectedUserId, selectedRole)} disabled={!selectedUserId}>
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><UserCog className="h-4 w-4" /> All User Roles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">No roles</span>
                            ) : user.roles.map((role) => (
                              <Badge key={role} variant={role === "admin" ? "default" : "secondary"} className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 flex-wrap">
                            {user.roles.map((role) => (
                              <Button key={role} variant="ghost" size="sm" onClick={() => removeRole(user.id, role)}
                                className="text-destructive hover:text-destructive h-7 px-2">
                                <Trash2 className="h-3 w-3 mr-1" />{role}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
