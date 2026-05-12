"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { ServerPagination } from "@/components/ui/server-pagination";
import { History, Search, AlertCircle, ShieldAlert, ScanLine, ArrowRight, MapPin, PackageSearch, SearchCode, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageData, setPageData] = useState({ pageNumber: 1, totalPages: 1, totalCount: 0 });
  
  // Damage Reporting
  const [reportingItem, setReportingItem] = useState<any>(null);
  const [damageStatus, setDamageStatus] = useState("Damaged");
  const [damageReason, setDamageReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async (page: number, search: string, currentSize: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/erp/inventory?page=${page}&pageSize=${currentSize}&search=${search}`);
      setItems(res.items || []);
      setPageData({
        pageNumber: res.pageNumber,
        totalPages: res.totalPages,
        totalCount: res.totalCount
      });
    } catch (error: any) {
      toast.error("Failed to load inventory: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, searchTerm, pageSize);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageSize, fetchData]);

  const handleReportDamage = async () => {
    if (!damageReason) { toast.error("Please provide a reason."); return; }
    setIsSubmitting(true);
    try {
        await apiFetch("/erp/report-damage", {
            method: "POST",
            body: JSON.stringify({
                inventoryItemId: reportingItem.id,
                status: damageStatus,
                reason: damageReason
            })
        });
        toast.success(`Item marked as ${damageStatus}`);
        setReportingItem(null);
        setDamageReason("");
        fetchData(pageData.pageNumber, searchTerm, pageSize);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 shadow-sm">
                <PackageSearch className="h-8 w-8" />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase italic">Inventory Audit</h1>
                <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Asset Lifecycle Intelligence
                </div>
            </div>
        </div>

        <Card className="w-full md:w-[400px] border-none shadow-xl overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <ScanLine className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <Input 
                    placeholder="Quick Trace IMEI / Serial..." 
                    className="h-12 pl-12 border-none bg-white focus:ring-8 focus:ring-blue-50 text-sm font-bold shadow-inner"
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>
        </Card>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Device Identity</TableHead>
                <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status</TableHead>
                <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Acquisition</TableHead>
                <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Warranty</TableHead>
                <TableHead className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Last Event</TableHead>
                <TableHead className="text-right pr-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-32">
                    <RefreshCcw className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Scanning Inventory Cloud...</p>
                </TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-32 text-slate-300">
                    <PackageSearch className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-sm">No inventory matches found</p>
                </TableCell></TableRow>
              ) : items.map(item => (
                <TableRow key={item.id} className="odd:bg-white even:bg-slate-50/30 hover:bg-blue-50/30 group transition-all border-b border-slate-50">
                  <TableCell className="pl-8 py-2">
                    <div className="font-black text-slate-900 text-sm tracking-tight leading-none italic uppercase">{item.deviceName}</div>
                    <div className="flex gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[9px] h-4 font-mono font-bold tracking-tighter uppercase px-2 rounded-md bg-slate-100 text-slate-600">ID: {item.imei1}</Badge>
                        {item.imei2 && <Badge variant="outline" className="text-[9px] h-4 font-mono font-bold tracking-tighter uppercase px-2 rounded-md border-slate-200 text-slate-400">{item.imei2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase border-none shadow-sm ${item.isSold ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {item.isSold ? "DEPLETED" : "IN STOCK"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-[11px] font-black text-slate-600 italic tracking-tighter">{item.purchaseInfo ? format(new Date(item.purchaseInfo.eventDate), "dd MMM yyyy") : "PRE-SEED"}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.purchaseInfo?.referenceNo || "SYS-GEN"}</div>
                  </TableCell>
                  <TableCell className="py-2">
                     {item.warrantyExpiryDate ? (
                        <div className="flex flex-col">
                            <span className={`text-[11px] font-black tracking-tighter ${differenceInDays(new Date(item.warrantyExpiryDate), new Date()) < 30 ? "text-rose-600 animate-pulse" : "text-slate-700"}`}>
                                {differenceInDays(new Date(item.warrantyExpiryDate), new Date())} DAYS
                            </span>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic">VAL_ACTIVE</span>
                        </div>
                     ) : <span className="text-[9px] text-slate-200 font-black uppercase tracking-widest">PERPETUAL</span>}
                  </TableCell>
                  <TableCell className="py-2">
                    {item.lastActivity ? (
                        <div className="flex items-center gap-3">
                             <div className="p-1.5 bg-blue-50 rounded-lg text-blue-400 border border-blue-100/50">
                                <SearchCode className="h-3 w-3" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-700 uppercase italic tracking-tighter leading-none">{item.lastActivity.eventType}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(item.lastActivity.eventDate), "dd MMM HH:mm")}</span>
                             </div>
                        </div>
                    ) : <span className="text-[9px] text-slate-200 font-black">NO_LOGS</span>}
                  </TableCell>
                  <TableCell className="text-right pr-8 py-2">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Link href={`/inventory/history/${item.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase rounded-xl border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all gap-1.5 px-4 shadow-sm">
                                <History className="h-3.5 w-3.5" /> AUDIT TRAIL
                            </Button>
                        </Link>
                        {!item.isSold && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100"
                                onClick={() => setReportingItem(item)}
                                title="Report Loss/Damage"
                            >
                                <AlertCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-8 bg-slate-50/30 border-t border-slate-100">
            <ServerPagination 
                pageNumber={pageData.pageNumber} 
                totalPages={pageData.totalPages} 
                totalCount={pageData.totalCount} 
                pageSize={pageSize}
                onPageChange={p => fetchData(p, searchTerm, pageSize)} 
                onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* Report Damage Modal */}
      <Dialog open={!!reportingItem} onOpenChange={() => setReportingItem(null)}>
        <DialogContent className="max-w-md border-none p-0 overflow-hidden rounded-[2.5rem] shadow-3xl bg-white ring-1 ring-slate-100">
            <div className="bg-rose-600 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-6 opacity-20"><ShieldAlert className="h-24 w-24" /></div>
                <DialogHeader>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-white/20 rounded-[1.25rem] border border-white/30 shadow-xl backdrop-blur-md"><ShieldAlert className="h-8 w-8" /></div>
                        <div>
                            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Mark Asset Issue</DialogTitle>
                            <DialogDescription className="text-rose-100/70 font-bold text-xs uppercase tracking-widest">Deplete stock due to incident.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
            </div>
            
            <div className="p-10 space-y-6 bg-white">
                {reportingItem && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Asset</div>
                        <div className="font-black text-xl text-slate-900 italic uppercase tracking-tighter leading-none">{reportingItem.deviceName}</div>
                        <div className="text-[11px] font-mono font-black text-rose-500 mt-2">IMEI: {reportingItem.imei1}</div>
                    </div>
                )}

                <div className="space-y-2.5">
                    <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block ml-1">Incident Type</Label>
                    <Select value={damageStatus} onValueChange={setDamageStatus}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-black text-slate-900 text-lg px-6 focus:ring-8 focus:ring-rose-50 transition-all">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            <SelectItem value="Damaged" className="font-black h-12 uppercase italic">Physical Damage</SelectItem>
                            <SelectItem value="Lost" className="font-black h-12 uppercase italic text-rose-600">Lost / Missing</SelectItem>
                            <SelectItem value="Stolen" className="font-black h-12 uppercase italic text-rose-800">Stolen</SelectItem>
                            <SelectItem value="Defective" className="font-black h-12 uppercase italic text-amber-600">DOA / Defective</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2.5">
                    <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block ml-1">Detailed Incident Log</Label>
                    <textarea 
                        className="w-full min-h-[120px] p-5 border-none rounded-2xl text-[15px] font-bold bg-slate-50 focus:bg-white transition-all outline-none shadow-inner ring-0 focus:ring-8 focus:ring-rose-50 placeholder:text-slate-200" 
                        placeholder="State exactly how this unit was compromised..."
                        value={damageReason}
                        onChange={e => setDamageReason(e.target.value)}
                    />
                </div>

                <div className="flex gap-5 pt-4">
                    <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all" onClick={() => setReportingItem(null)}>Cancel</Button>
                    <Button 
                        className="flex-[1.5] h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-2xl shadow-rose-100 uppercase tracking-tighter italic text-lg transition-all active:scale-95" 
                        onClick={handleReportDamage}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "SYNCING..." : `MARK AS ${damageStatus.toUpperCase()}`}
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
