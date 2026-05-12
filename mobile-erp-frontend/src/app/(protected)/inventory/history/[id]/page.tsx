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
    Activity
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

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
        apiFetch("/inventory/all") // Quick way to get device name/IMEI
      ]);
      setHistory(historyData);
      const currentItem = allInv.find((i: any) => i.id === parseInt(id));
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
      case "purchase": return { icon: Package, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
      case "sale": return { icon: ArrowRight, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      case "salesreturn": return { icon: RotateCcwIcon, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
      case "purchasereturn": return { icon: ArrowLeft, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
      case "transfer": return { icon: ArrowRightLeft, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" };
      case "damage": return { icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
      default: return { icon: Activity, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">Reconstructing IMEI Timeline...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header / Identity Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter text-sm">
                <History className="h-4 w-4" /> Device Audit Trail
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{itemInfo?.deviceName || "Device Identity"}</h1>
            <div className="flex gap-3 items-center">
                <Badge variant="outline" className="font-mono text-sm px-3 bg-white shadow-sm font-bold uppercase tracking-wider border-slate-300">
                    IMEI: {itemInfo?.imei1}
                </Badge>
                {itemInfo?.isSold ? (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 px-3 uppercase text-[10px] font-black">Out of Stock</Badge>
                ) : (
                    <Badge className="bg-emerald-500 text-white px-3 uppercase text-[10px] font-black shadow-lg shadow-emerald-500/20">Available in Stock</Badge>
                )}
            </div>
          </div>
          
          <Card className="border-none shadow-md bg-white p-4 flex gap-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Current Age</p>
                    <p className="text-sm font-bold">{itemInfo?.purchaseInfo ? format(new Date(itemInfo.purchaseInfo.eventDate), "dd MMM yy") : "N/A"}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Life Events</p>
                    <p className="text-sm font-bold">{history.length} Checkpoints</p>
                </div>
          </Card>
      </div>

      {/* Timeline Section */}
      <div className="relative pt-4">
        {/* Central Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-px"></div>

        <div className="space-y-12">
            {history.map((event, idx) => {
                const config = getEventConfig(event.eventType);
                const isLeft = idx % 2 === 0;
                
                return (
                    <div key={event.id} className="relative flex items-center group">
                        {/* Timeline Marker (Circle) */}
                        <div className={`absolute left-6 md:left-1/2 w-10 h-10 -translate-x-1/2 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center transition-all group-hover:scale-110 ${config.bg} ${config.color}`}>
                            <config.icon className="h-4 w-4" />
                        </div>

                        {/* Content Card */}
                        <div className={`ml-16 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-16 text-right' : 'md:pl-16 md:ml-auto text-left'}`}>
                            <Card className={`border-none shadow-lg overflow-hidden ${config.border} hover:shadow-xl transition-all duration-300`}>
                                <div className={`h-1.5 w-full ${config.bg.replace('bg-', 'bg-').split(' ')[0]} opacity-50`}></div>
                                <CardContent className="p-5 space-y-3">
                                    <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isLeft ? 'flex-row-reverse' : ''} ${config.color}`}>
                                        <Badge className={`px-2 py-0.5 rounded-md ${config.bg} ${config.color} border-none font-black`}>
                                            {event.eventType}
                                        </Badge>
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(event.eventDate), "dd MMM yyyy • HH:mm")}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-900 leading-tight">
                                            Ref: {event.referenceNo}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-500">
                                            {event.description}
                                        </p>
                                    </div>

                                    <Separator className="bg-slate-100" />

                                    <div className={`flex items-center gap-4 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                                        {event.fromBranchId && (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">From</span>
                                                <span className="text-[11px] font-bold text-slate-700">Warehouse {event.fromBranchId}</span>
                                            </div>
                                        )}
                                        {event.toBranchId && (
                                            <div className="flex flex-col border-l pl-4 border-slate-100">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Action At</span>
                                                <span className="text-[11px] font-bold text-slate-700">Warehouse {event.toBranchId}</span>
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

        {/* Start / Finish Markers */}
        <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <CheckCircle2 className="h-8 w-8 text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">End of Audit Trail</p>
        </div>
      </div>
    </div>
  );
}

function RotateCcwIcon({ className }: { className?: string }) {
    return <RotateCcw className={className} />;
}

import { RotateCcw } from "lucide-react";
