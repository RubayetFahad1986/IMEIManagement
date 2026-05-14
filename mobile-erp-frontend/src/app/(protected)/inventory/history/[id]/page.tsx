"use client";

import { use, useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    History, 
    Package, 
    ArrowRight, 
    ArrowLeft, 
    Calendar, 
    ArrowRightLeft, 
    ShieldAlert, 
    AlertCircle, 
    MapPin, 
    CheckCircle2, 
    Tag, 
    Smartphone,
    User,
    Clock,
    Activity,
    RotateCcw,
    ChevronLeft
} from "lucide-react";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HistoryEvent {
  id: number;
  eventDate: string;
  eventType: string;
  referenceNo: string;
  description: string;
  fromBranchId?: number;
  toBranchId?: number;
}

export default function ProductHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [itemInfo, setItemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [historyData, allInv] = await Promise.all([
        apiFetch(`/erp/product-history/${id}`),
        apiFetch("/erp/inventory") // Use common inventory endpoint
      ]);
      setHistory(historyData);
      const currentItem = allInv.items?.find((i: any) => i.id === parseInt(id));
      setItemInfo(currentItem);
    } catch (error: any) {
      toast.error("Failed to fetch history: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getEventConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case "purchase": return { icon: Package, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
      case "sale": return { icon: ArrowRight, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
      case "salesreturn": return { icon: RotateCcw, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" };
      case "purchasereturn": return { icon: ArrowLeft, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
      case "transfer": return { icon: ArrowRightLeft, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" };
      case "damage": return { icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
      default: return { icon: Activity, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" };
    }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
        <Activity className="h-10 w-10 text-primary animate-pulse" />
        <p className="font-semibold text-slate-400">Reconstructing Audit Trail...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 bg-slate-50/30 min-h-screen">
      {/* Back Button */}
      <div>
          <Link href="/inventory">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Inventory
            </Button>
          </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                <History className="h-4 w-4" /> 
                Asset Audit Trail
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-none">
                {itemInfo?.deviceName || "Asset Timeline"}
            </h1>
            <div className="flex flex-wrap gap-2 items-center">
                <code className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                    {itemInfo?.imei1}
                </code>
                {itemInfo?.isSold ? (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-3 py-1 uppercase text-[10px] rounded-full">
                        Out of Stock
                    </Badge>
                ) : (
                    <Badge className="bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 font-bold px-3 py-1 uppercase text-[10px] rounded-full">
                        Currently In Stock
                    </Badge>
                )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commissioned</p>
                    <p className="text-sm font-bold text-slate-700">
                        {itemInfo?.purchaseInfo ? format(new Date(itemInfo.purchaseInfo.eventDate), "MMM dd, yyyy") : "N/A"}
                    </p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Count</p>
                    <p className="text-sm font-extrabold text-primary">{history.length} Entries</p>
                </div>
          </div>
      </div>

      {/* Timeline Section */}
      <div className="relative">
        {/* Central Path Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200/60 -translate-x-1/2 rounded-full"></div>

        <div className="space-y-16 py-8">
            {history.map((event, idx) => {
                const config = getEventConfig(event.eventType);
                const isLeft = idx % 2 === 0;
                
                return (
                    <div key={event.id} className="relative flex items-center group">
                        {/* Timeline Anchor Icon */}
                        <div className={`absolute left-6 md:left-1/2 w-12 h-12 -translate-x-1/2 rounded-2xl border-4 border-slate-50 bg-white shadow-lg z-20 flex items-center justify-center transition-all group-hover:scale-125 group-hover:rotate-6 ${config.color} ring-1 ring-slate-100`}>
                            <config.icon className="h-5 w-5" />
                        </div>

                        {/* Content Card Wrapper */}
                        <div className={`ml-20 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16 md:ml-auto text-left'}`}>
                            <Card className={`border-none shadow-sm ring-1 ring-slate-200 overflow-hidden hover:shadow-xl hover:ring-primary/20 transition-all duration-300 rounded-2xl`}>
                                <div className={`h-1.5 w-full ${config.color.replace('text-', 'bg-')} opacity-30`}></div>
                                <CardContent className="p-6 space-y-4">
                                    <div className={`flex items-center gap-3 text-xs ${isLeft ? 'md:flex-row-reverse' : 'flex-row'}`}>
                                        <Badge className={`px-2.5 py-1 rounded-full ${config.bg} ${config.color} border-none font-bold text-[10px] uppercase tracking-wider`}>
                                            {event.eventType}
                                        </Badge>
                                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(event.eventDate), "MMM dd, yyyy")}
                                            <span className="mx-1 opacity-30">•</span>
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(new Date(event.eventDate), "HH:mm")}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <h4 className="text-lg font-bold text-slate-900 leading-tight">
                                            Reference {event.referenceNo}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>

                                    <div className={`flex items-center gap-4 pt-2 ${isLeft ? 'md:justify-end' : 'justify-start'}`}>
                                        {event.fromBranchId && (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Origin</span>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                    Warehouse {event.fromBranchId}
                                                </div>
                                            </div>
                                        )}
                                        {event.fromBranchId && event.toBranchId && (
                                            <ArrowRight className="h-4 w-4 text-slate-300" />
                                        )}
                                        {event.toBranchId && (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Destination</span>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                    Warehouse {event.toBranchId}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Audit Trail Termination */}
        <div className="flex flex-col items-center justify-center py-16">
            <div className="p-3 bg-slate-100 rounded-full text-slate-300 border border-slate-200">
                <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">End of Life Cycle</p>
        </div>
      </div>
    </div>
  );
}
