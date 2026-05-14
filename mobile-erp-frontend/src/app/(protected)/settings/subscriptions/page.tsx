"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  ShieldCheck, 
  Zap, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCcw, 
  Building2, 
  Mail, 
  CalendarDays, 
  AlertTriangle,
  PlusCircle,
  MoreVertical,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  History
} from "lucide-react";

export default function SubscriptionsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/companies");
      setCompanies(data || []);
    } catch (e) {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleExtend = async (companyId: number, days: number) => {
    try {
        await apiFetch("/admin/extend-subscription", {
            method: "POST",
            body: JSON.stringify({ companyId, days })
        });
        toast.success(`Subscription extended by ${days} days`);
        fetchCompanies();
    } catch (e: any) {
        toast.error(e.message || "Extension failed");
    }
  };

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(c => {
        const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
        return expiry && differenceInDays(expiry, new Date()) > 0;
    }).length;
    const expired = companies.filter(c => {
        const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
        return !expiry || differenceInDays(expiry, new Date()) <= 0;
    }).length;
    const expiringSoon = companies.filter(c => {
        const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
        const days = expiry ? differenceInDays(expiry, new Date()) : 0;
        return days > 0 && days <= 7;
    }).length;

    return { total, active, expired, expiringSoon };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let result = companies.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter === "Active") {
        result = result.filter(c => {
            const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
            return expiry && differenceInDays(expiry, new Date()) > 0;
        });
    } else if (statusFilter === "Expired") {
        result = result.filter(c => {
            const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
            return !expiry || differenceInDays(expiry, new Date()) <= 0;
        });
    } else if (statusFilter === "ExpiringSoon") {
        result = result.filter(c => {
            const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
            const days = expiry ? differenceInDays(expiry, new Date()) : 0;
            return days > 0 && days <= 7;
        });
    }

    return result;
  }, [companies, searchTerm, statusFilter]);

  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, page, pageSize]);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase">
            <ShieldCheck className="h-4 w-4" />
            Enterprise Control
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Subscription Management</h1>
          <p className="text-slate-500 font-medium">Monitor and manage ERP entity licenses and system access.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Company or Email..." 
              className="pl-10 h-11 bg-white border-slate-200 shadow-sm focus:ring-primary/20"
              value={searchTerm} 
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }} 
            />
          </div>
          <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Entities", value: stats.total, icon: Building2, color: "blue", status: null },
          { label: "Active Licenses", value: stats.active, icon: Zap, color: "emerald", status: "Active" },
          { label: "Expiring Soon", value: stats.expiringSoon, icon: Clock, color: "amber", status: "ExpiringSoon" },
          { label: "Expired", value: stats.expired, icon: XCircle, color: "rose", status: "Expired" },
        ].map((stat, i) => (
          <Card 
            key={i} 
            className={cn(
                "border-none shadow-sm ring-1 overflow-hidden group hover:ring-primary/50 transition-all cursor-pointer",
                statusFilter === stat.status ? "ring-2 ring-primary bg-primary/5" : "ring-slate-200"
            )}
            onClick={() => setStatusFilter(stat.status)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-3xl font-bold mt-1 text-slate-900">{loading ? "..." : stat.value.toLocaleString()}</h3>
                </div>
                <div className={cn(
                    "p-3 rounded-xl transition-transform group-hover:scale-110",
                    `bg-${stat.color}-50 text-${stat.color}-600`
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
                    <CardTitle className="text-xl font-bold">Enterprise Entities</CardTitle>
                    <CardDescription>Comprehensive list of all registered companies and their subscription status.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchCompanies} className="text-slate-400 hover:text-primary">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="pl-8 py-4 font-bold text-slate-600">Company Identity</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Status</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Expiry Schedule</TableHead>
                    <TableHead className="py-4 font-bold text-slate-600">Time Remaining</TableHead>
                    <TableHead className="text-right pr-8 py-4 font-bold text-slate-600">License Management</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCcw className="h-10 w-10 text-primary/40 animate-spin" />
                                <p className="font-medium text-slate-400">Syncing subscription data...</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : paginatedCompanies.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-slate-50 rounded-full">
                                    <Building2 className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-600">No entities found</p>
                                    <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                                </div>
                                {(searchTerm || statusFilter) && (
                                    <Button variant="link" onClick={() => { setSearchTerm(""); setStatusFilter(null); }} className="text-primary mt-2">
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ) : paginatedCompanies.map(c => {
                    const expiry = c.subscriptionExpiryDate ? new Date(c.subscriptionExpiryDate) : null;
                    const daysLeft = expiry ? differenceInDays(expiry, new Date()) : 0;
                    const isExpired = daysLeft < 0;
                    const isWarning = daysLeft >= 0 && daysLeft <= 7;

                    return (
                        <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                        <TableCell className="pl-8 py-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm transition-transform group-hover:scale-105",
                                    isExpired ? 'bg-rose-500 shadow-rose-200' : 'bg-slate-900 shadow-slate-200'
                                )}>
                                    {c.name.substring(0,1)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{c.name}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Mail className="h-3 w-3 text-slate-400" />
                                        <span className="text-[11px] font-medium text-slate-400">{c.email}</span>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            <div className="flex flex-col gap-1.5">
                                <Badge variant="secondary" className={cn(
                                    "w-fit px-2.5 py-1 text-[10px] font-bold rounded-full",
                                    c.isVerified ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", c.isVerified ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                                    {c.isVerified ? "VERIFIED" : "PENDING"}
                                </Badge>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">{c.planType || 'Standard Plan'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">
                                    {expiry ? format(expiry, "MMM dd, yyyy") : "N/A"}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            {isExpired ? (
                                <Badge className="bg-rose-100 text-rose-700 font-bold text-[10px] uppercase ring-1 ring-rose-200">Expired</Badge>
                            ) : isWarning ? (
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-amber-600">
                                        <AlertTriangle className="h-4 w-4 animate-pulse" />
                                        <span className="text-sm font-bold">{daysLeft} Days</span>
                                    </div>
                                    <span className="text-[10px] text-amber-500/70 font-bold uppercase tracking-tighter">Critical Window</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-emerald-600">{daysLeft} Days</span>
                                    <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-tighter">Healthy</span>
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="text-right pr-8 py-4">
                            <div className="flex justify-end gap-2 group-hover:translate-x-0 translate-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary font-bold text-[11px] gap-1.5 px-3"
                                    onClick={() => handleExtend(c.id, 30)}
                                >
                                    <PlusCircle className="h-3.5 w-3.5" /> 
                                    +30 Days
                                </Button>
                                <Button 
                                    size="sm" 
                                    className="h-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] gap-1.5 px-3 shadow-sm"
                                    onClick={() => handleExtend(c.id, 365)}
                                >
                                    <Zap className="h-3.5 w-3.5" /> 
                                    +1 Year
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    );
                })}
                </TableBody>
            </Table>
          </div>
          
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
            <ServerPagination 
                pageNumber={page} 
                totalPages={Math.ceil(filteredCompanies.length / pageSize) || 1} 
                totalCount={filteredCompanies.length} 
                pageSize={pageSize}
                onPageChange={setPage} 
                onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
