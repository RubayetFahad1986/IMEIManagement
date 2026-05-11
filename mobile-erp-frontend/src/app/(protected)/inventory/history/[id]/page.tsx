"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Package, ArrowRight, ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HistoryEvent {
  id: number;
  eventDate: string;
  eventType: string;
  referenceNo: string;
  description: string;
}

export default function ProductHistoryPage({ params }: { params: { id: string } }) {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiFetch(`/erp/product-history/${params.id}`);
      setHistory(data);
    } catch (error: any) {
      toast.error("Failed to fetch history: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "purchase": return <Package className="h-4 w-4 text-blue-600" />;
      case "sale": return <ArrowRight className="h-4 w-4 text-green-600" />;
      case "exchangereturn": return <ArrowLeft className="h-4 w-4 text-orange-600" />;
      default: return <History className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <History className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">IMEI Journey</h1>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {loading ? (
          <p className="text-center py-10">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">No history found for this item.</p>
        ) : (
          history.map((event, index) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {getEventIcon(event.eventType)}
              </div>
              {/* Card */}
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-md">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <Badge variant="outline" className="capitalize">{event.eventType}</Badge>
                  <time className="text-xs font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-1 h-3 w-3" /> {format(new Date(event.eventDate), "dd MMM yyyy HH:mm")}
                  </time>
                </div>
                <div className="text-slate-500 text-sm font-bold mb-1">Ref: {event.referenceNo}</div>
                <div className="text-slate-600 text-sm">{event.description}</div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
