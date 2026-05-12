"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  ReceiptText,
  Smartphone
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/dashboard/summary");
      setData(res);
    } catch (e) {
      console.error("Dashboard load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="p-10 text-center font-bold animate-pulse">Analyzing Business Data...</div>;
  }

  if (!data) return <div className="p-10 text-center">Failed to load dashboard.</div>;

  const metrics = [
    { title: "Today's Sales", value: `৳${data.metrics.todaySales.toLocaleString()}`, icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%" },
    { title: "Stock Value", value: `৳${data.metrics.stockValue.toLocaleString()}`, icon: Package, color: "text-blue-600", bg: "bg-blue-50", trend: "Live" },
    { title: "Today's Expenses", value: `৳${data.metrics.todayExpenses.toLocaleString()}`, icon: ReceiptText, color: "text-rose-600", bg: "bg-rose-50", trend: "-5%" },
    { title: "Total Customers", value: data.metrics.customerCount, icon: Users, color: "text-violet-600", bg: "bg-violet-50", trend: "Growth" },
  ];

  return (
    <div className="p-6 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Enterprise Dashboard</h1>
          <p className="text-slate-500 font-medium">Real-time business intelligence for {format(new Date(), "MMMM yyyy")}.</p>
        </div>
        <Badge variant="outline" className="bg-white px-4 py-1 shadow-sm border-emerald-200 text-emerald-700 font-bold flex gap-2 items-center">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Live
        </Badge>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.title}</CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${i % 2 === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {stat.trend}
                </span>
                <span className="text-[10px] text-slate-400">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cash & Bank Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border border-blue-100 shadow-xl shadow-blue-50 bg-white text-slate-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet className="h-32 w-32 text-blue-600" /></div>
            <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2 font-black italic uppercase italic">
                    <Wallet className="h-5 w-5" /> Liquid Assets
                </CardTitle>
                <CardDescription className="font-bold text-slate-400">Available cash and bank liquidity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.accountBalances.map((acc: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${acc.accountType === "Cash" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                {acc.accountType === "Cash" ? <Wallet className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                            </div>
                            <span className="font-bold text-sm text-slate-700">{acc.name}</span>
                        </div>
                        <span className="font-mono font-black text-slate-900 text-lg">৳{acc.balance.toLocaleString()}</span>
                    </div>
                ))}
                <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Net Cash Reserve</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tighter italic">
                        ৳{data.accountBalances.reduce((sum: number, a: any) => sum + a.balance, 0).toLocaleString()}
                    </span>
                </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <Card className="md:col-span-2 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Sales Performance
                    </CardTitle>
                    <CardDescription>Daily revenue trends for the last 7 days.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.charts.salesTrend}>
                        <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Breakdown */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-orange-500" /> Stock by Brand
            </CardTitle>
            <CardDescription>Value distribution of top 5 brands.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data.charts.stockByBrand}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="brand"
                    >
                        {data.charts.stockByBrand.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-2">
                {data.charts.stockByBrand.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium text-slate-700">{entry.brand}</span>
                        <span className="text-slate-400">({entry.count})</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Sales History</CardTitle>
                <CardDescription>The latest 5 transactions across all branches.</CardDescription>
            </div>
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader className="bg-slate-50 border-y">
                    <TableRow>
                        <TableHead className="pl-6">Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right pr-6">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.recent.sales.map((sale: any, i: number) => (
                        <TableRow key={i} className="hover:bg-slate-50/50">
                            <TableCell className="pl-6 font-bold text-primary">{sale.invoiceNo}</TableCell>
                            <TableCell>{sale.customerName || "Walking Customer"}</TableCell>
                            <TableCell>{format(new Date(sale.salesDate), "dd MMM HH:mm")}</TableCell>
                            <TableCell className="text-right pr-6 font-black font-mono">৳{sale.netTotal.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                    {data.recent.sales.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">No sales recorded yet.</TableCell></TableRow>
                    )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-rose-50/30 border-b">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-rose-900 flex items-center gap-2">
                        <ArrowDownRight className="h-5 w-5 text-rose-500" /> Operational Expenses
                    </CardTitle>
                    <CardDescription className="text-rose-700/60">Last 5 outgoing payments recorded.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-rose-50/50 border-b">
                    <TableRow>
                        <TableHead className="pl-6">Voucher #</TableHead>
                        <TableHead>Reason / Notes</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right pr-6">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.recent.expenses.map((exp: any, i: number) => (
                        <TableRow key={i} className="hover:bg-rose-50/20">
                            <TableCell className="pl-6 font-bold text-rose-800">{exp.voucherNo}</TableCell>
                            <TableCell className="text-slate-600">{exp.description || "General Expense"}</TableCell>
                            <TableCell>{format(new Date(exp.expenseDate), "dd MMM yyyy")}</TableCell>
                            <TableCell className="text-right pr-6 font-bold text-rose-600">-৳{exp.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                    {data.recent.expenses.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">No expenses found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
