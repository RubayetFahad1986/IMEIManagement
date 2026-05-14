"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { format, differenceInDays } from "date-fns";
import { ServerPagination } from "@/components/ui/server-pagination";
import { 
  History, 
  Search, 
  AlertCircle, 
  ShieldAlert, 
  ScanLine, 
  MapPin, 
  PackageSearch, 
  SearchCode, 
  RefreshCcw,
  CheckCircle2,
  Package,
  ArrowUpRight,
  Filter,
  XCircle,
  Clock,
  Info,
  Smartphone,
  ClipboardCheck
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";

export default function InventoryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageData, setPageData] = useState({ pageNumber: 1, totalPages: 1, totalCount: 0 });
  const [stockStatus, setStockStatus] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, inStock: 0, sold: 0, compromised: 0 });

  // Damage Reporting
  const [reportingItem, setReportingItem] = useState<any>(null);
  const [damageStatus, setDamageStatus] = useState("Damaged");
  const [damageReason, setDamageReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Item Details
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = useCallback(async (page: number, search: string, currentSize: number, status: string | null) => {
    setLoading(true);
    try {
      let url = `/erp/inventory?page=${page}&pageSize=${currentSize}&search=${search}`;
      if (status) {
        url += `&stockStatus=${status}`;
        if (status === "Sold") url += `&includeSold=true`;
      }
      const res = await apiFetch(url);
      setItems(res.items || []);
      setPageData({
        pageNumber: res.pageNumber,
        totalPages: res.totalPages,
        totalCount: res.totalCount
      });
      
      if (res.stats) {
          setStats({
              total: res.stats.total,
              inStock: res.stats.inStock,
              sold: res.stats.sold,
              compromised: res.stats.compromised
          });
      }
    } catch (error: any) {
      toast.error("Failed to load inventory: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, searchTerm, pageSize, stockStatus);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageSize, stockStatus, fetchData]);

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
        const id = reportingItem.id;
        setReportingItem(null);
        setDamageReason("");
        setItems(prev => prev.filter(item => item.id !== id));
        setPageData(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase">
            <Package className="h-4 w-4" />
            {t('asset_management')}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{t('inventory')}</h1>
          <p className="text-slate-500 font-medium">{t('monitor_assets_help')}</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <Link href="/inventory/audit">
            <Button className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 rounded-xl">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {t('physical_audit')}
            </Button>
          </Link>
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={`${t('search')} IMEI, Brand, or Model...`} 
              className="pl-10 h-11 bg-white border-slate-200 shadow-sm focus:ring-primary/20"
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white" onClick={() => setStockStatus(null)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {t('clear')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('total_assets'), value: stats.total, icon: Package, color: "blue", status: null },
          { label: t('in_stock'), value: stats.inStock, icon: CheckCircle2, color: "emerald", status: "InStock" },
          { label: t('sold_items'), value: stats.sold, icon: ArrowUpRight, color: "amber", status: "Sold" },
          { label: t('compromised'), value: stats.compromised, icon: AlertCircle, color: "rose", status: "Compromised" },
        ].map((stat, i) => (

          <Card 
            key={i} 
            className={cn(
                "border-none shadow-sm ring-1 overflow-hidden group hover:ring-primary/50 transition-all cursor-pointer bg-white",
                stockStatus === stat.status ? "ring-2 ring-primary bg-primary/5 shadow-md shadow-primary/5" : "ring-slate-200"
            )}
            onClick={() => setStockStatus(stat.status)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-3xl font-bold mt-1 text-slate-900">{loading ? "..." : stat.value.toLocaleString()}</h3>
                </div>
                <div className={cn(
                    "p-3 rounded-xl transition-transform group-hover:scale-110",
                    stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                    stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                    stat.color === "amber" ? "bg-amber-50 text-amber-600" :
                    "bg-rose-50 text-rose-600"
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white rounded-2xl">
        <CardHeader className="border-b border-slate-100 px-8 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Asset Records</CardTitle>
                    <CardDescription>Live view of all registered devices in your system.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="h-8 px-3 text-[11px] font-bold text-slate-500 bg-slate-50 uppercase tracking-tighter">
                        Showing {items.length} of {pageData.totalCount} assets
                    </Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="pl-8 py-4 font-bold text-slate-600">Device Identity</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Status</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600 text-right">Cost Value</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600 text-right">Sale Price</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Warranty</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Recent Activity</TableHead>
                    <TableHead className="text-right pr-8 py-4 font-bold text-slate-600">Audit</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCcw className="h-10 w-10 text-primary/40 animate-spin" />
                                <p className="font-medium text-slate-400">Fetching inventory data...</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-slate-50 rounded-full">
                                    <PackageSearch className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-600">No assets found</p>
                                    <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                                </div>
                                {searchTerm && (
                                    <Button variant="link" onClick={() => setSearchTerm("")} className="text-primary mt-2">
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ) : items.map(item => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="pl-8 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.deviceName}</span>
                                <Badge variant="outline" className="text-[9px] h-4 font-black uppercase bg-slate-50 text-slate-400 px-1">
                                    {item.condition || "NEW"}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-medium">{item.ram || "0"}/{item.storage || "0"}GB</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{item.color || "No Color"}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                <code className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold ring-1 ring-slate-200/50">
                                    {item.imei1 || "NO IMEI"}
                                </code>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="py-4">
                        <Badge variant="secondary" className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${item.isSold ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.isSold ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`} />
                            {item.isSold ? "OUT OF STOCK" : "READY"}
                        </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                        <div className="text-sm font-black text-slate-900 font-mono italic opacity-40 group-hover:opacity-100 transition-opacity">
                            ৳{item.costPrice.toLocaleString()}
                        </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                        <div className="text-sm font-black text-slate-900 font-mono">
                            ৳{item.currentSalePrice.toLocaleString()}
                        </div>
                    </TableCell>
                    <TableCell className="py-4">
                        {item.warrantyEndDate ? (
                            <div className="flex items-center gap-2">
                                <Clock className={`h-4 w-4 ${differenceInDays(new Date(item.warrantyEndDate), new Date()) < 30 ? "text-rose-500" : "text-slate-400"}`} />
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${differenceInDays(new Date(item.warrantyEndDate), new Date()) < 30 ? "text-rose-600" : "text-slate-700"}`}>
                                        {differenceInDays(new Date(item.warrantyEndDate), new Date()) > 0 
                                            ? `${differenceInDays(new Date(item.warrantyEndDate), new Date())} days left`
                                            : "Expired"
                                        }
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">Until {format(new Date(item.warrantyEndDate), "MMM dd, yyyy")}</span>
                                </div>
                            </div>
                        ) : <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">No Warranty</span>}
                    </TableCell>
                    <TableCell className="py-4">
                        {item.lastActivity ? (
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-50 rounded text-primary ring-1 ring-blue-100">
                                    <SearchCode className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-slate-800">{item.lastActivity.eventType}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">{format(new Date(item.lastActivity.eventDate), "MMM dd • HH:mm")}</span>
                                </div>
                            </div>
                        ) : <span className="text-xs text-slate-300">No activity logged</span>}
                    </TableCell>
                    <TableCell className="text-right pr-8 py-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => setSelectedItem(item)}>
                                <Info className="h-4 w-4" />
                            </Button>
                            <Link href={`/inventory/history/${item.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                    <History className="h-4 w-4" /> 
                                </Button>
                            </Link>
                            {!item.isSold && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                    onClick={() => setReportingItem(item)}
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
          </div>

          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
            <ServerPagination 
                pageNumber={pageData.pageNumber} 
                totalPages={pageData.totalPages} 
                totalCount={pageData.totalCount} 
                pageSize={pageSize}
                onPageChange={p => fetchData(p, searchTerm, pageSize, stockStatus)} 
                onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* Asset Preview Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
              {selectedItem && (
                  <div className="flex flex-col">
                      <div className="bg-slate-900 p-8 text-white">
                          <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px]">Asset Profile</Badge>
                                  <h2 className="text-3xl font-black tracking-tighter">{selectedItem.deviceName}</h2>
                                  <div className="flex gap-3 text-slate-400 font-mono text-sm mt-2">
                                      <span>ID: #{selectedItem.id}</span>
                                      <span>•</span>
                                      <span className="text-emerald-400 font-bold">৳{selectedItem.currentSalePrice.toLocaleString()}</span>
                                  </div>
                              </div>
                              <div className="h-20 w-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                  <Smartphone className="h-10 w-10 text-slate-500" />
                              </div>
                          </div>
                      </div>

                      <div className="p-8 grid grid-cols-2 gap-8 bg-white">
                          <div className="space-y-6">
                              <div>
                                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hardware Identity</Label>
                                  <div className="mt-2 space-y-2">
                                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <span className="text-xs font-bold text-slate-500">IMEI Primary</span>
                                          <span className="text-xs font-mono font-black text-slate-900">{selectedItem.imei1 || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <span className="text-xs font-bold text-slate-500">Serial Number</span>
                                          <span className="text-xs font-mono font-black text-slate-900">{selectedItem.serialNumber || "N/A"}</span>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Specifications</Label>
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase">Memory</div>
                                          <div className="text-sm font-black text-slate-900">{selectedItem.ram || "0"}GB</div>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase">Storage</div>
                                          <div className="text-sm font-black text-slate-900">{selectedItem.storage || "0"}GB</div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              <div>
                                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protection & Status</Label>
                                  <div className="mt-2 space-y-2">
                                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <span className="text-xs font-bold text-slate-500">Condition</span>
                                          <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px]">{selectedItem.condition || "NEW"}</Badge>
                                      </div>
                                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <span className="text-xs font-bold text-slate-500">Warranty End</span>
                                          <span className="text-xs font-black text-slate-900">
                                              {selectedItem.warrantyEndDate ? format(new Date(selectedItem.warrantyEndDate), "dd MMM yyyy") : "N/A"}
                                          </span>
                                      </div>
                                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <span className="text-xs font-bold text-slate-500">Stock Status</span>
                                          <span className={cn("text-xs font-black", selectedItem.isSold ? "text-rose-500" : "text-emerald-500")}>
                                              {selectedItem.isSold ? "SOLD" : "AVAILABLE"}
                                          </span>
                                      </div>
                                  </div>
                              </div>

                              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                  <div className="flex items-center gap-2 mb-2">
                                      <Info className="h-4 w-4 text-primary" />
                                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Acquisition Detail</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                      Acquired on {selectedItem.purchaseInfo ? format(new Date(selectedItem.purchaseInfo.eventDate), "MMMM dd, yyyy") : "Initial Setup"} 
                                      {selectedItem.purchaseInfo?.referenceNo && ` under invoice ${selectedItem.purchaseInfo.referenceNo}`}.
                                  </p>
                              </div>
                          </div>
                      </div>
                      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                          <Button className="rounded-xl font-bold px-8 shadow-lg shadow-slate-200" onClick={() => setSelectedItem(null)}>Close Profile</Button>
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>

      {/* Incident Reporting Dialog */}
      <Dialog open={!!reportingItem} onOpenChange={() => setReportingItem(null)}>
        <DialogContent className="max-w-md border-none p-0 overflow-hidden rounded-3xl shadow-2xl bg-white ring-1 ring-slate-100">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 p-6 opacity-10 rotate-12 scale-150"><ShieldAlert className="h-24 w-24" /></div>
                <DialogHeader className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20"><AlertCircle className="h-6 w-6 text-white" /></div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">Report Incident</DialogTitle>
                            <DialogDescription className="text-slate-400 text-sm font-medium">Mark this asset as compromised to adjust stock levels.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
            </div>
            
            <div className="p-8 space-y-6">
                {reportingItem && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target Asset</div>
                            <div className="font-bold text-slate-900 leading-none">{reportingItem.deviceName}</div>
                            <div className="text-[11px] font-mono font-bold text-rose-500 mt-1">{reportingItem.imei1}</div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Incident Categorization</Label>
                    <Select value={damageStatus} onValueChange={(v: string | null) => setDamageStatus(v || "Damaged")}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-slate-900 px-4 focus:ring-4 focus:ring-rose-50 transition-all">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="Damaged" className="font-medium h-10">Physical Damage</SelectItem>
                            <SelectItem value="Lost" className="font-medium h-10 text-rose-600">Lost / Missing</SelectItem>
                            <SelectItem value="Stolen" className="font-medium h-10 text-rose-800">Stolen</SelectItem>
                            <SelectItem value="Defective" className="font-medium h-10 text-amber-600">DOA / Defective</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Incident Report Detail</Label>
                    <textarea 
                        className="w-full min-h-[100px] p-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:bg-white transition-all outline-none shadow-sm focus:ring-4 focus:ring-rose-50 placeholder:text-slate-300 resize-none" 
                        placeholder="Provide details about the incident (date, location, cause)..."
                        value={damageReason}
                        onChange={e => setDamageReason(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-500" onClick={() => setReportingItem(null)}>Discard</Button>
                    <Button 
                        className="flex-[1.5] h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-200 transition-all active:scale-95" 
                        onClick={handleReportDamage}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Confirm Loss
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
