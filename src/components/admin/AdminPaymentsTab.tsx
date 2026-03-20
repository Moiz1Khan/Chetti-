import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, CreditCard, TrendingUp, Users as UsersIcon, CheckCircle, XCircle,
  AlertTriangle, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";

const CHART_COLORS = [
  "hsl(263, 70%, 58%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(220, 80%, 65%)", "hsl(280, 80%, 50%)",
];

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(240,6%,6%)", border: "1px solid hsl(240,4%,16%)", borderRadius: 8 },
  labelStyle: { color: "hsl(0,0%,95%)" },
};

const PLAN_NAMES: Record<string, string> = {
  prod_UAPii7iQr8WcJO: "Pro",
  prod_UAPiLjclqnq7YK: "Agency",
};

interface PaymentData {
  totalCustomers: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  pastDueSubscriptions: number;
  mrr: number;
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  chargesByStatus: { succeeded: number; failed: number; refunded: number; pending: number };
  subsByPlan: Record<string, number>;
  revenueByMonth: { month: string; amount: number }[];
  recentTransactions: {
    id: string; amount: number; currency: string; status: string;
    customer_email: string; created: number; description: string; refunded: boolean;
  }[];
  currency: string;
}

const AdminPaymentsTab = () => {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("admin-analytics");
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load payment data");
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchPayments}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  const chargeStatusData = [
    { name: "Succeeded", value: data.chargesByStatus.succeeded },
    { name: "Failed", value: data.chargesByStatus.failed },
    { name: "Refunded", value: data.chargesByStatus.refunded },
    { name: "Pending", value: data.chargesByStatus.pending },
  ].filter((d) => d.value > 0);

  const planDistribution = Object.entries(data.subsByPlan).map(([id, count]) => ({
    name: PLAN_NAMES[id] || id.slice(0, 12),
    value: count,
  }));

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency }).format(amount);

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">MRR</CardDescription>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <CardTitle className="text-xl font-bold">{fmt(data.mrr)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Total Revenue</CardDescription>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">{fmt(data.totalRevenue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Available Balance</CardDescription>
              <Wallet className="h-4 w-4 text-success" />
            </div>
            <CardTitle className="text-xl font-bold">{fmt(data.availableBalance)}</CardTitle>
            <p className="text-xs text-muted-foreground">{fmt(data.pendingBalance)} pending</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Customers</CardDescription>
              <UsersIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">{data.totalCustomers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Active Subs</CardDescription>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <CardTitle className="text-xl font-bold">{data.activeSubscriptions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Canceled</CardDescription>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold">{data.canceledSubscriptions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">Past Due</CardDescription>
              <AlertTriangle className="h-4 w-4 text-[hsl(38,92%,50%)]" />
            </div>
            <CardTitle className="text-xl font-bold">{data.pastDueSubscriptions}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Revenue by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.revenueByMonth}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <RechartsTooltip {...TOOLTIP_STYLE} formatter={(value: number) => [fmt(value), "Revenue"]} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(142,71%,45%)" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">No revenue data</p>
            )}
          </CardContent>
        </Card>

        {/* Charge Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {chargeStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chargeStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {chargeStatusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-12">No charge data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      {planDistribution.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={planDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,4%,16%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="hsl(263,70%,58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions</TableCell>
                  </TableRow>
                ) : data.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">{tx.customer_email}</TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: tx.currency }).format(tx.amount / 100)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.status === "succeeded" ? "default" : "secondary"}
                        className={`text-xs ${tx.refunded ? "bg-destructive/20 text-destructive" : tx.status === "succeeded" ? "bg-success/20 text-success" : tx.status === "failed" ? "bg-destructive/20 text-destructive" : ""}`}
                      >
                        {tx.refunded ? "Refunded" : tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(tx.created * 1000), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {tx.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentsTab;
