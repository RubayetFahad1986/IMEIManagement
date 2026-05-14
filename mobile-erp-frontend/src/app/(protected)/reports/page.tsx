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
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Business Intelligence
        </h1>
        <p className="text-muted-foreground">Comprehensive overview of stock, finance, and human resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Units in Stock</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black">{stockSummary?.totalImeisInStock || 0}</div>
                <p className="text-[10px] text-blue-500 font-medium mt-1 italic">Across all branches and categories</p>
            </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">Total Receivables</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-emerald-700">
                    ৳{(ledgerBalances?.customers?.reduce((sum: number, c: any) => sum + (c.currentBalance || 0), 0) || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-emerald-500 font-medium mt-1 italic">From {ledgerBalances?.customers?.length || 0} active customers</p>
            </CardContent>
        </Card>
        <Card className="bg-rose-50/50 border-rose-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-600">Total Payables</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-rose-700">
                    ৳{(ledgerBalances?.suppliers?.reduce((sum: number, s: any) => sum + (s.currentBalance || 0), 0) || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-rose-500 font-medium mt-1 italic">To {ledgerBalances?.suppliers?.length || 0} active suppliers</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
          <TabsTrigger value="inventory" className="font-bold gap-2"><Smartphone className="h-4 w-4" /> Stock Audit</TabsTrigger>
          <TabsTrigger value="finance" className="font-bold gap-2"><BadgeDollarSign className="h-4 w-4" /> Debtors & Creditors</TabsTrigger>
          <TabsTrigger value="staff" className="font-bold gap-2"><UserCircle className="h-4 w-4" /> HR & Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle>Item-wise Stock Summary</CardTitle>
                    <CardDescription>Quantities available for each mobile model and general product.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow>
                                <TableHead className="pl-6">Item Description</TableHead>
                                <TableHead className="text-center">Current Stock</TableHead>
                                <TableHead className="text-right pr-6">Management</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockSummary?.itemWiseStock?.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell className="pl-6">
                                        <div className="font-bold">{item.itemName}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">{item.mobileDeviceId ? "Mobile Device" : "General Product"}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={item.stockCount > 5 ? "secondary" : "destructive"} className="font-mono text-sm px-3">
                                            {item.stockCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Link href="/inventory">
                                            <Button variant="ghost" size="sm" className="gap-2">Audit <ArrowRight className="h-3 w-3" /></Button>
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
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50/30 border-b">
                    <CardTitle className="text-emerald-900">Top Receivables</CardTitle>
                    <CardDescription>Customers with outstanding balances.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {ledgerBalances?.customers?.sort((a: any, b: any) => b.currentBalance - a.currentBalance).slice(0, 10).map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="pl-6 font-medium">{c.name}</TableCell>
                                    <TableCell className="text-right pr-6 font-black font-mono text-emerald-600">৳{c.currentBalance.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-rose-50/30 border-b">
                    <CardTitle className="text-rose-900">Top Payables</CardTitle>
                    <CardDescription>Suppliers with pending payments.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {ledgerBalances?.suppliers?.sort((a: any, b: any) => b.currentBalance - a.currentBalance).slice(0, 10).map((s: any) => (
                                <TableRow key={s.id}>
                                    <TableCell className="pl-6 font-medium">{s.name}</TableCell>
                                    <TableCell className="text-right pr-6 font-black font-mono text-rose-600">৳{s.currentBalance.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-violet-50/30 border-b">
                    <CardTitle className="text-violet-900">Staff Commission Ledger</CardTitle>
                    <CardDescription>Sales incentives and payment status for all employees.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Employee</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead className="text-right">Total Earned</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                                <TableHead className="text-right pr-6">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissions.map((e: any) => (
                                <TableRow key={e.id}>
                                    <TableCell className="pl-6 font-bold">{e.name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground uppercase">{e.designation}</TableCell>
                                    <TableCell className="text-right font-mono">৳{e.totalCommissionEarned.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">৳{e.totalCommissionPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-right pr-6 font-black font-mono text-primary">৳{e.commissionBalance.toLocaleString()}</TableCell>
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
