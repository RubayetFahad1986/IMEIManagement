"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
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
  Smartphone,
  Info,
  Calendar,
  Filter,
  ArrowRight,
  Truck,
  History,
  LineChart as LineChartIcon,
  BadgeDollarSign
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
  AreaChart,
  Area
} from "recharts";
import { useRouter } from "next/navigation";
import { format, startOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [stockDetails, setStockDetails] = useState<any[]>([]);
  const [isStockDetailsOpen, setIsStockDetailsOpen] = useState(false);
  const [loadingStockDetails, setLoadingStockDetails] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/dashboard/summary?startDate=${startDate}&endDate=${endDate}`);
      setData(res);
    } catch (e) {
      console.error("Dashboard load failed", e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const fetchStockDetails = async () => {
    setLoadingStockDetails(true);
    setIsStockDetailsOpen(true);
    try {
      const res = await apiFetch("/dashboard/stock-details");
      setStockDetails(res);
    } catch (e) {
      console.error("Failed to fetch stock details", e);
    } finally {
      setLoadingStockDetails(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Computing Business Intelligence...</p>
        </div>
    );
  }

  const metrics = [
    { 
      title: t('todays_sales'), 
      value: `৳${(data?.metrics?.todaySales ?? 0).toLocaleString()}`, 
      icon: ShoppingCart, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      trend: `${data?.metrics?.todaySalesCount ?? 0} Invoices`,
      onClick: () => router.push("/sales")
    },
    { 
      title: t('todays_purchase'), 
      value: `৳${(data?.metrics?.todayPurchase ?? 0).toLocaleString()}`, 
      icon: Truck, 
      color: "text-orange-600", 
      bg: "bg-orange-50", 
      trend: t('inventory_in'),
      onClick: () => router.push("/purchases")
    },
    { 
      title: t('operational_profit'), 
      value: `৳${(data?.metrics?.todayProfit ?? 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      trend: t('net_earnings'),
      onClick: () => router.push("/reports")
    },
    { 
      title: t('todays_expenses'), 
      value: `৳${(data?.metrics?.todayExpenses || 0).toLocaleString()}`, 
      icon: ReceiptText, 
      color: "text-rose-600", 
      bg: "bg-rose-50", 
      trend: `${data?.metrics?.todayExpensesCount || 0} Vouchers`,
      onClick: () => router.push("/accounting/expenses")
    },
    { 
        title: t('cash_received'), 
        value: `৳${(data?.metrics?.todayReceive ?? 0).toLocaleString()}`, 
        icon: Wallet, 
        color: "text-indigo-600", 
        bg: "bg-indigo-50", 
        trend: t('total_inflow'),
        onClick: () => router.push("/accounting/ledgers")
      },
      { 
        title: t('total_payments'), 
        value: `৳${(data?.metrics?.todayPayment ?? 0).toLocaleString()}`, 
        icon: BadgeDollarSign, 
        color: "text-amber-600", 
        bg: "bg-amber-50", 
        trend: t('total_outflow'),
        onClick: () => router.push("/accounting/ledgers")
      },
    { 
      title: t('stock_value'), 
      value: `৳${(data?.metrics?.stockValue ?? 0).toLocaleString()}`, 
      icon: Package, 
      color: "text-slate-600", 
      bg: "bg-slate-50", 
      trend: t('live_inventory'), 
      onClick: fetchStockDetails 
    },
    { 
      title: t('active_customers'), 
      value: data?.metrics?.customerCount ?? 0, 
      icon: Users, 
      color: "text-violet-600", 
      bg: "bg-violet-50", 
      trend: t('total_database'),
      onClick: () => router.push("/contacts")
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{t('intelligence_console').split(' ')[0]} <span className="text-primary italic">{t('intelligence_console').split(' ')[1]}</span></h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('realtime_metrics_live')}</p>
          </div>
        </div>

        <Card className="p-2 border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-2xl flex flex-wrap items-center gap-2 sm:gap-4 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-200">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-slate-400">{t('date_range')}</span>
            </div>
            <div className="flex items-center gap-2">
                <Input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="h-9 w-32 sm:w-40 border-none bg-transparent font-bold text-xs focus-visible:ring-0"
                />
                <ArrowRight className="h-3 w-3 text-slate-300" />
                <Input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="h-9 w-32 sm:w-40 border-none bg-transparent font-bold text-xs focus-visible:ring-0"
                />
            </div>
            <Button size="sm" onClick={fetchDashboardData} className="h-8 rounded-xl font-black text-[10px] uppercase tracking-widest ml-2 px-4">
                <Filter className="mr-2 h-3 w-3" /> {t('load_data')}
            </Button>
        </Card>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((stat, i) => (
          <Card 
            key={i} 
            className={cn(
                "border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[1.5rem] overflow-hidden group",
                typeof stat.onClick === "function" && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            )}
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
              <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-xl transition-all group-hover:rotate-12", stat.bg, stat.color)}>
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 group-hover:tracking-tighter transition-all">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="text-[8px] sm:text-[10px] font-black px-2 py-0 h-5 rounded-lg bg-slate-100 text-slate-600 border-none">
                    {stat.trend}
                </Badge>
                {typeof stat.onClick === "function" && <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse ml-auto" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
                <div>
                    <CardTitle className="flex items-center gap-2 font-black text-lg">
                        <LineChartIcon className="h-5 w-5 text-primary" /> Sales trend
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1 opacity-60">Revenue mapping for the period</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="h-[350px] p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.charts?.salesTrend || []}>
                        <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 700}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 700}} />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '20px', 
                                border: 'none', 
                                boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                                padding: '15px',
                                backgroundColor: 'var(--card)',
                                color: 'var(--foreground)'
                            }}
                            itemStyle={{ fontWeight: 900, color: 'var(--primary)' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-slate-950 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet className="h-40 w-40" /></div>
            <CardHeader className="border-b border-white/5 px-8 py-6">
                <CardTitle className="flex items-center gap-2 font-black text-lg italic uppercase">
                    <Wallet className="h-5 w-5 text-blue-400" /> Liquid Reserves
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Available cash & bank balances</CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-6 space-y-5">
                {(data?.accountBalances || []).map((acc: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2.5 rounded-xl", acc.accountType === "Cash" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400")}>
                                {acc.accountType === "Cash" ? <Wallet className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{acc.name}</span>
                        </div>
                        <span className="font-mono font-black text-lg">৳{acc.balance.toLocaleString()}</span>
                    </div>
                ))}
                <div className="pt-6 mt-4 border-t border-white/5 flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Net Reserves</span>
                        <p className="text-xs text-blue-400/60 font-bold italic">Safe for new stock purchase</p>
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-blue-400 italic">
                        ৳{(data?.accountBalances || []).reduce((sum: number, a: any) => sum + a.balance, 0).toLocaleString()}
                    </span>
                </div>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="flex items-center gap-2 font-black text-lg">
                <Smartphone className="h-5 w-5 text-orange-500" /> Stock by Brand
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 opacity-60">Value distribution map</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data?.charts?.stockByBrand || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="count"
                            nameKey="brand"
                        >
                            {(data?.charts?.stockByBrand || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
                {(data?.charts?.stockByBrand || []).map((entry: any, index: number) => (
                    <div key={index} className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="font-black text-[10px] uppercase text-slate-500">{entry.brand}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-black text-slate-900">{entry.count} Units</span>
                            <span className="text-[9px] font-bold text-primary italic">৳{entry.value.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between px-8 py-8 border-b border-slate-50">
            <div>
                <CardTitle className="font-black text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-500" /> Recent Activity
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 opacity-60">Latest 5 financial events</CardDescription>
            </div>
            <ArrowUpRight className="h-6 w-6 text-slate-200 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">Transaction</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Partner</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(data?.recent?.sales || []).map((sale: any, i: number) => (
                        <TableRow key={i} className="hover:bg-slate-50/80 h-16 transition-colors group cursor-pointer border-slate-50">
                            <TableCell className="pl-8">
                                <div className="flex flex-col">
                                    <span className="font-black text-xs text-blue-600">#{sale.invoiceNo}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Sales Invoice</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-bold text-xs text-slate-700">{sale.customerName || "Walk-in Guest"}</TableCell>
                            <TableCell className="text-[10px] font-medium text-slate-500">{format(new Date(sale.salesDate), "dd MMM, HH:mm")}</TableCell>
                            <TableCell className="text-right pr-8">
                                <span className="font-black font-mono text-slate-900">৳{sale.netTotal.toLocaleString()}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!data?.recent?.sales?.length) && (
                        <TableRow><TableCell colSpan={4} className="text-center py-20 font-bold text-slate-300 italic uppercase text-xs tracking-widest">No recent transactions found</TableCell></TableRow>
                    )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>

      {/* Stock Breakdown Modal */}
      <Dialog open={isStockDetailsOpen} onOpenChange={setIsStockDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-slate-900 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Package className="h-7 w-7 text-blue-400" /> {t('stock_audit_console')}
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                {t('detailed_item_list')} | {t('stock_value')}: <span className="text-blue-400">৳{data?.metrics?.stockValue?.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden p-8 pt-0 bg-slate-900">
            {loadingStockDetails ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-500">Retrieving secure records...</p>
                </div>
            ) : (
                <ScrollArea className="h-[65vh] rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-slate-800 sticky top-0 z-10">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="w-12 text-center text-[9px] font-black uppercase text-slate-500">#</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-slate-500">Device Identity</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-slate-500">Configuration</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-slate-500">Stock Tag</TableHead>
                                <TableHead className="text-[9px] font-black uppercase text-slate-500">In-Stock Since</TableHead>
                                <TableHead className="text-right pr-8 text-[9px] font-black uppercase text-slate-500">Asset Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-white">
                            {stockDetails.map((item, idx) => (
                                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors h-16">
                                    <TableCell className="text-center text-slate-600 font-mono text-xs">{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-black text-sm">{item.brand}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.modelName}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[11px] font-bold text-slate-300">{item.variant || "—"}</div>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{item.color || "Default"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px] font-bold text-blue-400 border-blue-400/30 bg-blue-400/5 px-2">
                                            {item.imei1 || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-bold text-slate-500 uppercase">
                                        {format(new Date(item.createDate), "dd MMM yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right pr-8 font-black font-mono text-sm">
                                        ৳{item.costPrice.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            )}
          </div>
          <div className="p-8 bg-slate-900 border-t border-white/5 flex justify-between items-center">
             <div className="flex gap-4 items-center">
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('total_units')}</p>
                    <p className="text-xl font-black text-white">{stockDetails.length}</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('net_asset_value')}</p>
                    <p className="text-xl font-black text-emerald-400 italic">৳{stockDetails.reduce((sum, i) => sum + i.costPrice, 0).toLocaleString()}</p>
                </div>
             </div>
             <Button variant="ghost" onClick={() => setIsStockDetailsOpen(false)} className="text-white hover:bg-white/10 rounded-xl font-black uppercase text-xs">{t('close_audit')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
