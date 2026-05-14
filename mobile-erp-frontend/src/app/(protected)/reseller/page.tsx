"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Users, CreditCard, Ticket, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

export default function ResellerPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const res = await apiFetch("/reseller/my-panel");
      setData(res);
    } catch (error: any) {
      toast.error("Failed to load reseller data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivate = async (companyId: number) => {
    if (!confirm("Activate this customer? This will deduct 1 copy from your balance.")) return;
    
    setActivatingId(companyId);
    try {
      await apiFetch(`/reseller/activate-customer/${companyId}`, { method: "POST" });
      toast.success("Customer activated successfully!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Activation failed");
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Reseller Portal...</div>;
  if (!data) return <div className="p-10 text-center text-destructive">Unauthorized access or error loading data.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 flex items-center gap-3">
          <Ticket className="h-10 w-10 text-blue-600" />
          Reseller <span className="text-blue-600">Territory</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Manage your license inventory and customer network</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Ticket className="h-24 w-24" /></div>
            <CardHeader className="pb-2">
                <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Promo Code</CardDescription>
                <CardTitle className="text-3xl font-black tracking-tighter text-blue-400">{data.promoCode || "NOT SET"}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-[10px] text-slate-500 font-medium">Share this code with your clients for registration.</p>
            </CardContent>
        </Card>

        <Card className="bg-white border-2 border-slate-100 shadow-xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><CreditCard className="h-24 w-24 text-blue-600" /></div>
            <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Available Copies</CardDescription>
                <CardTitle className="text-4xl font-black tracking-tighter text-slate-900">{data.availableCopies}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-[10px] text-slate-400 font-medium italic">Contact Admin to purchase more in bulk.</p>
            </CardContent>
        </Card>

        <Card className="bg-white border-2 border-slate-100 shadow-xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Users className="h-24 w-24 text-blue-600" /></div>
            <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Total Customers</CardDescription>
                <CardTitle className="text-4xl font-black tracking-tighter text-slate-900">{data.customers.length}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px] font-black uppercase">{data.customers.filter((c: any) => c.isActive).length} Active</Badge>
                    <Badge variant="secondary" className="text-[9px] font-black uppercase text-amber-600">{data.customers.filter((c: any) => !c.isActive).length} Pending</Badge>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-50 border-b p-8">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><Smartphone className="h-6 w-6 text-blue-600" /> Territory Network</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Clients registered with your promo code</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-100/50">
                    <TableRow className="border-none">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">Company / Admin</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Contact Info</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Registration Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                        <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.customers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2 opacity-30">
                                    <Users className="h-12 w-12" />
                                    <p className="font-black uppercase text-xs">No territory data found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.customers.map((customer: any) => (
                            <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                                <TableCell className="pl-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 uppercase italic">{customer.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-600">{customer.phone}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500">{new Date(customer.createDate).toLocaleDateString()}</span>
                                </TableCell>
                                <TableCell>
                                    {customer.isActive ? (
                                        <Badge className="bg-green-500 text-white font-black text-[9px] uppercase px-2 rounded-lg">Active</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 font-black text-[9px] uppercase px-2 rounded-lg italic">Pending Activation</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="pr-8 text-right">
                                    {!customer.isActive && (
                                        <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-700 h-8 rounded-xl font-black uppercase text-[10px] italic shadow-lg shadow-blue-200"
                                            onClick={() => handleActivate(customer.id)}
                                            disabled={activatingId === customer.id || data.availableCopies <= 0}
                                        >
                                            {activatingId === customer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="h-3 w-3 mr-1" /> Activate</>}
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Bulk Transactions */}
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-50 border-b p-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><CreditCard className="h-6 w-6 text-blue-600" /> Bulk Purchase History</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Transaction logs from SuperAdmin</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-100/50">
                    <TableRow className="border-none">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Quantity</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Rate (৳)</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Total (৳)</TableHead>
                        <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest">Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.transactions.map((tx: any) => (
                        <TableRow key={tx.id} className="border-slate-50">
                            <TableCell className="pl-8 py-4 text-xs font-bold text-slate-500">{new Date(tx.createDate).toLocaleDateString()}</TableCell>
                            <TableCell className="font-black text-slate-900">{tx.quantity} Copies</TableCell>
                            <TableCell className="font-bold text-slate-600">{tx.pricePerCopy.toLocaleString()}</TableCell>
                            <TableCell className="font-black text-blue-600">{tx.totalPrice.toLocaleString()}</TableCell>
                            <TableCell className="pr-8 text-xs italic text-slate-400">{tx.remarks}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
