"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, UserPlus, CreditCard, ShieldCheck, Loader2, Globe, Building2, Wallet } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function ResellerManagement() {
  const [resellers, setResellers] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddCopiesOpen, setIsAddCopiesOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  
  const [quantity, setQuantity] = useState(10);
  const [remarks, setRemarks] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadResellers = async () => {
    try {
      const [res, stats] = await Promise.all([
        apiFetch("/reseller/all"),
        apiFetch("/reseller/stats/summary")
      ]);
      setResellers(res);
      setGlobalStats(stats);
    } catch (error) {
      toast.error("Failed to load resellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResellers();
  }, []);

  const handleAddCopies = async () => {
    setIsSaving(true);
    try {
      await apiFetch("/reseller/add-copies", {
        method: "POST",
        body: JSON.stringify({ resellerId: selectedReseller.id, quantity, remarks })
      });
      toast.success("Copies added successfully!");
      setIsAddCopiesOpen(false);
      loadResellers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPromo = async () => {
    setIsSaving(true);
    try {
      await apiFetch("/reseller/set-promo-code", {
        method: "POST",
        body: JSON.stringify({ resellerId: selectedReseller.id, code: promoCode })
      });
      toast.success("Promo code updated!");
      setIsPromoOpen(false);
      loadResellers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Tiered pricing calculation for UI preview
  const getRate = (q: number) => {
    if (q >= 50) return 800;
    if (q >= 20) return 900;
    if (q >= 10) return 1000;
    if (q >= 5) return 1200;
    return 1500;
  };

  if (loading) return <div className="p-10 text-center font-bold">Initializing Reseller Command Center...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-foreground">
        <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3 text-foreground">
            <ShieldCheck className="h-10 w-10 text-primary" />
            Reseller <span className="text-primary">Admin</span>
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-2">Global distribution & license management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: "Global Reach", value: globalStats?.resellerCount, icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Active Partners" },
            { label: "Total Deployments", value: globalStats?.activeDeployments, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Activated Cos" },
            { label: "Total Allocated", value: globalStats?.allocatedPermissions, icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "License Flow" },
            { label: "Available Stock", value: globalStats?.availablePermissions, icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Partner Reserve" }
        ].map((stat, i) => (
            <Card key={i} className="border-none shadow-xl bg-card overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl", stat.bg)}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter">Merged View</Badge>
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</h3>
                    <p className="text-3xl font-black tracking-tighter text-foreground">{stat.value?.toLocaleString() || 0}</p>
                    <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase opacity-60">{stat.desc}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card">
        <CardHeader className="bg-slate-950 text-white p-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><UserPlus className="h-6 w-6 text-primary" /> Registered Resellers</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Manage bulk license inventory per partner</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">Reseller Name</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Promo Code</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Permissions</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Activated</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-primary">Total Users</TableHead>
                        <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">Administrative Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resellers.map(reseller => (
                        <TableRow key={reseller.id} className="hover:bg-muted/5 transition-colors border-border">
                            <TableCell className="pl-8 py-6">
                                <div className="flex flex-col">
                                    <span className="font-black text-foreground uppercase italic">{reseller.fullName}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground">{reseller.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={reseller.promoCode ? "default" : "outline"} className="font-black uppercase text-[10px] rounded-lg">
                                    {reseller.promoCode || "NO CODE"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                    <span className="font-black text-lg text-foreground">{reseller.availableCopies}</span>
                                    <span className="text-[8px] uppercase font-bold text-muted-foreground opacity-60">Permissions</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                    <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">{reseller.activatedCount}</span>
                                    <span className="text-[8px] uppercase font-bold text-muted-foreground opacity-60">Active Cos</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="font-black px-3 rounded-full text-primary border-none">{reseller.totalUsers}</Badge>
                            </TableCell>
                            <TableCell className="pr-8 text-right space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl font-black uppercase text-[10px] italic border-2"
                                    onClick={() => { setSelectedReseller(reseller); setPromoCode(reseller.promoCode || ""); setIsPromoOpen(true); }}
                                >
                                    <Ticket className="h-3 w-3 mr-1" /> Promo Code
                                </Button>
                                <Button 
                                    size="sm" 
                                    className="bg-primary hover:bg-primary/90 rounded-xl font-black uppercase text-[10px] italic shadow-lg shadow-primary/20"
                                    onClick={() => { setSelectedReseller(reseller); setQuantity(10); setRemarks(""); setIsAddCopiesOpen(true); }}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Copies
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Add Copies Dialog */}
      <Dialog open={isAddCopiesOpen} onOpenChange={setIsAddCopiesOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
            <div className="p-4">
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Add License Inventory</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Partner: {selectedReseller?.fullName}</DialogDescription>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quantity of Copies</Label>
                        <Input type="number" className="h-14 text-2xl font-black rounded-2xl bg-slate-50 border-none" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 0)} />
                    </div>

                    <div className="p-6 bg-slate-900 rounded-2xl text-white">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Current Tier Rate</span>
                            <span className="text-xl font-black text-primary">৳{getRate(quantity)} / unit</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Total Payable</span>
                            <span className="text-3xl font-black text-white italic">৳{(quantity * getRate(quantity)).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Internal Remarks</Label>
                        <Input placeholder="e.g. Paid via Bank Transfer" className="h-12 rounded-xl bg-slate-50 border-none font-bold" value={remarks} onChange={e => setRemarks(e.target.value)} />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase text-xs" onClick={() => setIsAddCopiesOpen(false)}>Cancel</Button>
                    <Button className="flex-1 h-12 rounded-xl font-black uppercase text-xs italic bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" onClick={handleAddCopies} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : "Confirm & Deposit"}
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Promo Code Dialog */}
      <Dialog open={isPromoOpen} onOpenChange={setIsPromoOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-none shadow-2xl">
            <div className="p-4">
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Assign Promo Code</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Reseller Identity Mapping</DialogDescription>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Unique Promo Code</Label>
                        <Input placeholder="e.g. DHAKA2026" className="h-14 text-xl font-black rounded-2xl bg-slate-50 border-none text-center uppercase tracking-widest" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase text-xs" onClick={() => setIsPromoOpen(false)}>Cancel</Button>
                    <Button className="flex-1 h-12 rounded-xl font-black uppercase text-xs italic bg-primary hover:bg-primary/90" onClick={handleSetPromo} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : "Update Code"}
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
