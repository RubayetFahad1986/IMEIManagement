"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Users, Building2, Ticket, CheckCircle2, ShieldCheck, ArrowUpRight, TrendingUp, History, UserPlus, Zap, Loader2, Globe } from "lucide-react";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ResellerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  const fetchPanelData = useCallback(async () => {
    try {
      const res = await apiFetch("/reseller/my-panel");
      setData(res);
    } catch (err) {
      toast.error("Failed to load reseller panel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPanelData();
  }, [fetchPanelData]);

  const handleActivate = async (id: number) => {
    setIsActivating(id);
    try {
      await apiFetch(`/reseller/activate-customer/${id}`, { method: "POST" });
      toast.success("Customer activated successfully!");
      fetchPanelData();
    } catch (err: any) {
      toast.error(err.message || "Activation failed");
    } finally {
      setIsActivating(null);
    }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-primary uppercase italic">Synchronizing Territory Data...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Partner <span className="text-primary">Intelligence</span></h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Territory: {data?.fullName} | Managed Portal</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest opacity-60">Promo Code</p>
                <p className="text-xl font-black tracking-tighter text-foreground uppercase">{data?.promoCode || "NOT SET"}</p>
            </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: "Permissions Allocated", value: data?.stats?.totalAllocated, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Active Deployments", value: data?.stats?.activatedCount, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Remaining Balance", value: data?.stats?.remainingBalance, icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Total End-Users", value: data?.stats?.totalEndUsers, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" }
        ].map((stat, i) => (
            <Card key={i} className="border-none shadow-xl bg-card overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <div className="bg-muted px-2 py-1 rounded-lg text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Live Metric</div>
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</h3>
                    <p className="text-3xl font-black tracking-tighter">{stat.value?.toLocaleString()}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Client List */}
          <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card">
                  <CardHeader className="bg-muted/30 border-b border-border py-6 px-8 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Active Territory Clients</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Manage your connected businesses and activations</CardDescription>
                      </div>
                      <Badge variant="secondary" className="font-black px-4 rounded-full">{data?.customers?.length} Total</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader className="bg-muted/10">
                              <TableRow className="border-none">
                                  <TableHead className="pl-8 text-[10px] font-black uppercase h-12">Business Identity</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase h-12">Status</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase h-12 text-center text-primary">Users</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase h-12 text-right pr-8">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {data?.customers?.map((customer: any) => (
                                  <TableRow key={customer.id} className="hover:bg-muted/5 border-border">
                                      <TableCell className="pl-8 py-4">
                                          <div className="font-black text-sm uppercase tracking-tight">{customer.name}</div>
                                          <div className="text-[9px] text-muted-foreground font-bold">{customer.email}</div>
                                      </TableCell>
                                      <TableCell>
                                          {customer.isActive ? (
                                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/20 font-black uppercase text-[9px] tracking-widest gap-1.5">
                                                  <CheckCircle2 className="h-3 w-3" /> Activated
                                              </Badge>
                                          ) : (
                                              <Badge variant="outline" className="text-orange-500 border-orange-500/20 font-black uppercase text-[9px] tracking-widest">Pending Activation</Badge>
                                          )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                          <span className="font-black text-xs px-2 py-1 bg-muted rounded-lg">{customer.userCount}</span>
                                      </TableCell>
                                      <TableCell className="text-right pr-8">
                                          {!customer.isActive && (
                                              <Button 
                                                size="sm" 
                                                onClick={() => handleActivate(customer.id)}
                                                disabled={isActivating === customer.id || data.stats.remainingBalance <= 0}
                                                className="bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[10px] h-9 rounded-xl shadow-lg shadow-primary/20"
                                              >
                                                {isActivating === customer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Zap className="h-3 w-3 mr-2" /> Activate Now</>}
                                              </Button>
                                          )}
                                          {customer.isActive && (
                                              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Expires: {format(new Date(customer.subscriptionExpiryDate), "dd MMM yyyy")}</span>
                                          )}
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>

          {/* History / Transactions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-10"><History className="h-40 w-40" /></div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter relative z-10">License <span className="text-primary">Ledger</span></h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 relative z-10">Historical Allocation Data</p>
                
                <div className="space-y-4 relative z-10">
                    {data?.transactions?.slice(0, 5).map((tx: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-tight">+{tx.quantity} Licenses</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{format(new Date(tx.createDate), "dd MMM yyyy")}</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-black text-primary italic">৳{tx.totalPrice.toLocaleString()}</span>
                        </div>
                    ))}
                    {data?.transactions?.length === 0 && <p className="text-xs text-slate-500 italic text-center py-8">No transaction history found</p>}
                </div>
            </div>

            <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
                 <div className="absolute inset-0 bg-black/10"></div>
                 <CardContent className="p-8 relative z-10">
                    <div className="bg-white/20 p-3 rounded-2xl w-fit mb-4">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">Territory <br /> Performance</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Conversion Rate: {data?.stats?.totalAllocated > 0 ? Math.round((data?.stats?.activatedCount / data?.stats?.totalAllocated) * 100) : 0}%</p>
                 </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
