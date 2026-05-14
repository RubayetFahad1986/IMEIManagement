"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Package, Users, BadgeDollarSign, UserCircle, TrendingUp, Smartphone, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function ReportsPage() {
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [ledgerBalances, setLedgerBalances] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const [stock, ledgers, comms] = await Promise.all([
          apiFetch("/report/stock/summary"),
          apiFetch("/report/ledger/balances"),
          apiFetch("/report/employee/commissions")
        ]);
        setStockSummary(stock);
        setLedgerBalances(ledgers);
        setCommissions(comms);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4">
        <BarChart3 className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-lg font-medium text-muted-foreground">Generating Intelligence Reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <BarChart3 className="h-8 w-8 text-primary" /> Business Intelligence
        </h1>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Comprehensive overview of stock, finance, and human resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Total Units in Stock</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black tracking-tight">{stockSummary?.totalImeisInStock || 0}</div>
                <p className="text-[10px] text-blue-400 font-bold mt-2 italic opacity-60">Across all branches and categories</p>
            </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Total Receivables</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                    ৳{(ledgerBalances?.customers?.reduce((sum: number, c: any) => sum + (c.currentBalance || 0), 0) || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-emerald-400 font-bold mt-2 italic opacity-60">From {ledgerBalances?.customers?.length || 0} active customers</p>
            </CardContent>
        </Card>
        <Card className="bg-rose-500/10 border-rose-500/20 shadow-lg shadow-rose-500/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Total Payables</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                    ৳{(ledgerBalances?.suppliers?.reduce((sum: number, s: any) => sum + (s.currentBalance || 0), 0) || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-rose-400 font-bold mt-2 italic opacity-60">To {ledgerBalances?.suppliers?.length || 0} active suppliers</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-muted/50 p-1 rounded-2xl">
          <TabsTrigger value="inventory" className="font-black uppercase italic tracking-tighter gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"><Smartphone className="h-4 w-4" /> Stock Audit</TabsTrigger>
          <TabsTrigger value="finance" className="font-black uppercase italic tracking-tighter gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"><BadgeDollarSign className="h-4 w-4" /> Debtors & Creditors</TabsTrigger>
          <TabsTrigger value="staff" className="font-black uppercase italic tracking-tighter gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"><UserCircle className="h-4 w-4" /> HR & Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
                <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
                    <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Item-wise Stock Summary</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Quantities available for each mobile model and general product.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow className="border-none">
                                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest h-12 text-muted-foreground">Item Description</TableHead>
                                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest h-12 text-muted-foreground">Current Stock</TableHead>
                                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest h-12 text-muted-foreground">Management</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockSummary?.itemWiseStock?.map((item: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-muted/5 border-border">
                                    <TableCell className="pl-8 py-4">
                                        <div className="font-black text-sm uppercase tracking-tight">{item.itemName}</div>
                                        <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{item.mobileDeviceId ? "Mobile Device" : "General Product"}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={item.stockCount > 5 ? "secondary" : "destructive"} className="font-mono text-sm px-4 h-8 rounded-lg font-black border-none shadow-sm">
                                            {item.stockCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Link href="/inventory">
                                            <Button variant="ghost" size="sm" className="gap-2 font-black uppercase italic text-[10px] tracking-widest h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">Audit <ArrowRight className="h-3.5 w-3.5" /></Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="finance" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
                <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/10 py-6 px-8">
                    <CardTitle className="text-lg font-black uppercase italic tracking-tighter text-emerald-600 dark:text-emerald-400">Top Receivables</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 opacity-60">Customers with outstanding balances.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {ledgerBalances?.customers?.sort((a: any, b: any) => b.currentBalance - a.currentBalance).slice(0, 10).map((c: any) => (
                                <TableRow key={c.id} className="hover:bg-emerald-500/5 border-emerald-500/5">
                                    <TableCell className="pl-8 py-4 font-black text-sm uppercase tracking-tight">{c.name}</TableCell>
                                    <TableCell className="text-right pr-8 font-black font-mono text-lg text-emerald-600 dark:text-emerald-400">৳{c.currentBalance.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
                <CardHeader className="bg-rose-500/10 border-b border-rose-500/10 py-6 px-8">
                    <CardTitle className="text-lg font-black uppercase italic tracking-tighter text-rose-600 dark:text-rose-400">Top Payables</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-rose-500 opacity-60">Suppliers with pending payments.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {ledgerBalances?.suppliers?.sort((a: any, b: any) => b.currentBalance - a.currentBalance).slice(0, 10).map((s: any) => (
                                <TableRow key={s.id} className="hover:bg-rose-500/5 border-rose-500/5">
                                    <TableCell className="pl-8 py-4 font-black text-sm uppercase tracking-tight">{s.name}</TableCell>
                                    <TableCell className="text-right pr-8 font-black font-mono text-lg text-rose-600 dark:text-rose-400">৳{s.currentBalance.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
                <CardHeader className="bg-violet-500/10 border-b border-violet-500/10 py-6 px-8">
                    <CardTitle className="text-lg font-black uppercase italic tracking-tighter text-violet-600 dark:text-violet-400">Staff Commission Ledger</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-violet-500 opacity-60">Sales incentives and payment status for all employees.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow className="border-none">
                                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest h-12">Employee</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">Designation</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-12">Total Earned</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-12">Total Paid</TableHead>
                                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest h-12">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissions.map((e: any) => (
                                <TableRow key={e.id} className="hover:bg-muted/5 border-border">
                                    <TableCell className="pl-8 py-4 font-black text-sm uppercase tracking-tight">{e.name}</TableCell>
                                    <TableCell className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">{e.designation}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-sm tracking-tighter">৳{e.totalCommissionEarned.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-sm tracking-tighter">৳{e.totalCommissionPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-right pr-8 font-black font-mono text-lg text-primary tracking-tighter">৳{e.commissionBalance.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
