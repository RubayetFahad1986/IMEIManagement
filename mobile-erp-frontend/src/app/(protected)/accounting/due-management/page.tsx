"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Wallet, 
  Building2, 
  CheckCircle2, 
  History, 
  ListChecks,
  Calendar,
  CreditCard,
  Search,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function DueManagementPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [dueInvoices, setDueInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [paymentData, setPaymentData] = useState({
    totalAmount: "",
    paymentAccountId: "",
    transactionDate: format(new Date(), "yyyy-MM-dd"),
    remarks: ""
  });

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchAccounts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await apiFetch("/setup/contacts");
      setContacts(data.items || data.Items || []);
    } catch (e) { toast.error("Failed to load partners"); }
  };

  const fetchAccounts = async () => {
    try {
      const data = await apiFetch("/setup/accounts/all");
      setAccounts(data || []);
    } catch (e) { toast.error("Failed to load accounts"); }
  };

  const fetchDues = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/accounting/due-invoices/${id}`);
      setDueInvoices(data.invoices || []);
      setAllocations({});
    } catch (e: any) { toast.error(e.message || "Failed to load dues"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedContactId) fetchDues(selectedContactId);
  }, [selectedContactId, fetchDues]);

  const handleAutoAllocate = () => {
    const total = parseFloat(paymentData.totalAmount) || 0;
    if (total <= 0) { toast.error("Enter amount first"); return; }

    let remaining = total;
    const newAllocations: Record<string, number> = {};

    dueInvoices.forEach(inv => {
      const key = `${inv.type}-${inv.id}`;
      const canPay = Math.min(remaining, inv.due);
      if (canPay > 0) {
        newAllocations[key] = canPay;
        remaining -= canPay;
      }
    });

    setAllocations(newAllocations);
    if (remaining > 0) {
      toast.info(`৳${remaining.toLocaleString()} will be recorded as Advance Credit.`);
    }
  };

  const handleManualAllocation = (inv: any, val: string) => {
    const amt = parseFloat(val) || 0;
    const key = `${inv.type}-${inv.id}`;
    if (amt > inv.due) {
        toast.error("Exceeds due amount");
        return;
    }
    setAllocations({ ...allocations, [key]: amt });
  };

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const unallocated = (parseFloat(paymentData.totalAmount) || 0) - totalAllocated;

  const handleSubmit = async () => {
    if (!selectedContactId || !paymentData.totalAmount || !paymentData.paymentAccountId) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        contactId: parseInt(selectedContactId),
        totalAmount: parseFloat(paymentData.totalAmount),
        paymentAccountId: parseInt(paymentData.paymentAccountId),
        transactionDate: paymentData.transactionDate,
        remarks: paymentData.remarks,
        allocations: Object.entries(allocations)
            .filter(([_, val]) => val > 0)
            .map(([key, val]) => {
                const [type, id] = key.split("-");
                return { invoiceId: parseInt(id), amount: val, invoiceType: type };
            })
      };

      await apiFetch("/accounting/due-settlement", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      toast.success("Settlement successful!");
      setPaymentData({ ...paymentData, totalAmount: "", remarks: "" });
      setAllocations({});
      fetchDues(selectedContactId);
    } catch (e: any) {
      toast.error(e.message || "Failed to process");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Due Settlement</h1>
          <p className="text-muted-foreground text-sm">Bulk collection and payment allocation gateway.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 font-bold uppercase text-[10px]">
                <History className="mr-2 h-3.5 w-3.5" /> History
            </Button>
            <Button 
                size="sm"
                className="h-9 font-bold uppercase text-[10px] bg-blue-600 hover:bg-blue-700" 
                onClick={handleSubmit} 
                disabled={submitting}
            >
                {submitting ? "Processing..." : "Confirm Settlement"}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" /> Payment Header
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500">Business Partner</Label>
                    <SearchableSelect
                        options={contacts.map(c => ({ label: `${c.name} (${c.phone})`, value: c.id.toString() }))}
                        value={selectedContactId}
                        onChange={(val) => setSelectedContactId(val.toString())}
                        placeholder="Search Customer/Supplier..."
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500">Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="date" value={paymentData.transactionDate} onChange={e => setPaymentData({...paymentData, transactionDate: e.target.value})} className="pl-9 h-10 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500">Total BDT</Label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="number" placeholder="0.00" value={paymentData.totalAmount} onChange={e => setPaymentData({...paymentData, totalAmount: e.target.value})} className="pl-9 h-10 rounded-xl font-bold text-blue-600" />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500">Payment Source</Label>
                    <SearchableSelect 
                        options={accounts.map(acc => ({ label: `${acc.name} (${acc.accountType})`, value: acc.id.toString() }))}
                        value={paymentData.paymentAccountId}
                        onChange={v => setPaymentData({...paymentData, paymentAccountId: v.toString()})}
                        placeholder="Choose Account..."
                    />
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500">Remarks</Label>
                    <Input placeholder="Note for ledger..." value={paymentData.remarks} onChange={e => setPaymentData({...paymentData, remarks: e.target.value})} className="h-10 rounded-xl" />
                 </div>
              </CardContent>
           </Card>

           {parseFloat(paymentData.totalAmount) > 0 && (
             <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                <CardHeader className="pb-2 border-b border-white/10">
                   <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accounting Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Received Amount</span>
                            <span className="text-sm font-black italic">৳{(parseFloat(paymentData.totalAmount) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Allocated to Dues</span>
                            <span className="text-sm font-black text-emerald-400 italic">৳{totalAllocated.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-center py-1">
                           <ArrowRight className="h-3 w-3 text-slate-600 rotate-90" />
                        </div>
                        <div className="flex justify-between items-center bg-blue-600/20 p-3 rounded-lg border border-blue-500/30">
                            <span className="text-[10px] font-bold text-blue-300 uppercase">Advance Credit</span>
                            <span className="text-sm font-black text-blue-300 italic">৳{unallocated.toLocaleString()}</span>
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
                      Advance amounts are preserved in the partner's ledger for future invoice adjustments.
                    </p>
                </CardContent>
             </Card>
           )}
        </div>

        <div className="lg:col-span-2">
           <Card className="shadow-sm border-slate-200 min-h-[500px]">
              <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
                 <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Invoice Distribution
                 </CardTitle>
                 <Button variant="ghost" className="h-8 px-3 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-[10px] uppercase tracking-wider" onClick={handleAutoAllocate}>
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Auto-Fill Dues
                 </Button>
              </CardHeader>
              <CardContent className="p-0">
                 {loading ? (
                    <div className="py-40 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Loading Invoices...</p>
                    </div>
                 ) : !selectedContactId ? (
                    <div className="py-40 flex flex-col items-center text-slate-300">
                        <Search className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Select a partner to continue</p>
                    </div>
                 ) : dueInvoices.length === 0 ? (
                    <div className="py-40 flex flex-col items-center text-emerald-500/40">
                        <CheckCircle2 className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Partner is all clear</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 italic">Any payment will be recorded as 100% Advance.</p>
                    </div>
                 ) : (
                    <Table>
                        <TableHeader className="bg-slate-50/30">
                            <TableRow>
                                <TableHead className="text-[10px] font-bold uppercase pl-6">Invoice</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-right">Total</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-right text-rose-500">Outstanding</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase text-right pr-6">Allocation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dueInvoices.map(inv => {
                                const key = `${inv.type}-${inv.id}`;
                                return (
                                    <TableRow key={key} className="hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn(
                                                    "text-[8px] font-black h-5",
                                                    inv.type === 'Sale' ? "border-blue-200 text-blue-600 bg-blue-50/30" : "border-orange-200 text-orange-600 bg-orange-50/30"
                                                )}>
                                                    {inv.type === 'Sale' ? 'RECEIVABLE' : 'PAYABLE'}
                                                </Badge>
                                                <div>
                                                    <p className="font-bold text-xs">#{inv.invoiceNo}</p>
                                                    <p className="text-[9px] text-muted-foreground">{format(new Date(inv.date), "dd MMM yyyy")}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-medium text-slate-400">৳{inv.total.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-xs font-bold text-rose-600 italic">৳{inv.due.toLocaleString()}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="relative inline-block w-32">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">৳</span>
                                                <Input 
                                                    type="number" 
                                                    className="h-8 pl-5 rounded-lg text-xs font-bold text-right focus-visible:ring-primary/20" 
                                                    value={allocations[key] || ""}
                                                    onChange={e => handleManualAllocation(inv, e.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

