"use client";

import React, { useEffect, useState, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Download, 
  Plus, 
  DollarSign, 
  Wallet,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  FileText,
  User,
  History,
  Phone,
  Scale,
  CheckCircle2
} from "lucide-react";
import { toast } from "@/lib/toast";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ContactLedgerPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold animate-pulse text-primary">Loading Ledger...</div>}>
      <ContactLedgerContent />
    </Suspense>
  );
}

function ContactLedgerContent() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentAccountId: "",
    transactionType: "Receipt", // Receipt from customer, Payment to supplier
    transactionDate: format(new Date(), "yyyy-MM-dd"),
    remarks: "",
    referenceNo: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  useEffect(() => {
    if (idParam) {
      setSelectedContactId(idParam);
    }
  }, [idParam]);

  useEffect(() => {
    fetchContacts();
    fetchAccounts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await apiFetch("/setup/contacts");
      setContacts(data.items || data.Items || []);
    } catch (e) {
      toast.error("Failed to load contacts");
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await apiFetch("/setup/accounts/all");
      setPaymentAccounts(data || []);
    } catch (e) {
      toast.error("Failed to load payment accounts");
    }
  };

  const fetchLedger = useCallback(async () => {
    if (!selectedContactId) return;
    setLoading(true);
    try {
      const url = `/accounting/ledger/${selectedContactId}?startDate=${startDate}&endDate=${endDate}`;
      const data = await apiFetch(url);
      setLedgerData(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch ledger");
    } finally {
      setLoading(false);
    }
  }, [selectedContactId, startDate, endDate]);

  useEffect(() => {
    if (selectedContactId) fetchLedger();
  }, [selectedContactId, fetchLedger]);

  const handleRecordPayment = async () => {
    if (!paymentData.amount || !paymentData.paymentAccountId) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/accounting/contact-payment", {
        method: "POST",
        body: JSON.stringify({
          contactId: parseInt(selectedContactId),
          amount: parseFloat(paymentData.amount),
          paymentAccountId: parseInt(paymentData.paymentAccountId),
          transactionType: paymentData.transactionType,
          transactionDate: paymentData.transactionDate,
          remarks: paymentData.remarks,
          referenceNo: paymentData.referenceNo
        })
      });
      toast.success("Payment recorded successfully");
      setIsPaymentOpen(false);
      fetchLedger();
      setPaymentData({
        ...paymentData,
        amount: "",
        remarks: "",
        referenceNo: ""
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const setQuickDate = (type: 'thisMonth' | 'lastMonth' | 'today') => {
    if (type === 'today') {
      setStartDate(format(new Date(), "yyyy-MM-dd"));
      setEndDate(format(new Date(), "yyyy-MM-dd"));
    } else if (type === 'thisMonth') {
      setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
      setEndDate(format(new Date(), "yyyy-MM-dd"));
    } else if (type === 'lastMonth') {
      const prev = subMonths(new Date(), 1);
      setStartDate(format(startOfMonth(prev), "yyyy-MM-dd"));
      setEndDate(format(endOfMonth(prev), "yyyy-MM-dd"));
    }
  };

  const totals = useMemo(() => {
    if (!ledgerData) return { debit: 0, credit: 0 };
    return ledgerData.ledger.reduce((acc: any, curr: any) => ({
      debit: acc.debit + (curr.debit || 0),
      credit: acc.credit + (curr.credit || 0)
    }), { debit: 0, credit: 0 });
  }, [ledgerData]);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase">
            <BookOpen className="h-4 w-4" />
            Financial Records
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Contact Ledger</h1>
          <p className="text-slate-500 font-medium">Detailed transaction history and balance statement for business partners.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
            <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Statement
            </Button>
            <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
            </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
                <div className="flex-1 w-full space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400 ml-1">Account Holder / Contact</Label>
                    <SearchableSelect
                        options={contacts.map(c => ({ label: `${c.name} (${c.phone})`, value: c.id.toString() }))}
                        value={selectedContactId}
                        onChange={(val) => setSelectedContactId(val.toString())}
                        placeholder="Search Customer or Supplier..."
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    />
                </div>
                
                <div className="w-full lg:w-auto flex gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-400 ml-1">Period From</Label>
                        <Input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="h-11 bg-slate-50 border-slate-200 rounded-xl w-40" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-400 ml-1">Period To</Label>
                        <Input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="h-11 bg-slate-50 border-slate-200 rounded-xl w-40" 
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-0.5">
                    <Button variant="ghost" size="sm" onClick={() => setQuickDate('thisMonth')} className="text-[10px] font-bold uppercase tracking-tighter h-8 px-2 hover:bg-primary/5 hover:text-primary">This Month</Button>
                    <Button variant="ghost" size="sm" onClick={() => setQuickDate('lastMonth')} className="text-[10px] font-bold uppercase tracking-tighter h-8 px-2 hover:bg-primary/5 hover:text-primary">Last Month</Button>
                </div>

                <Button onClick={fetchLedger} className="h-11 bg-slate-900 hover:bg-slate-800 rounded-xl px-6 shadow-lg shadow-slate-200">
                    <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} /> 
                    Load Statement
                </Button>
            </div>
        </CardContent>
      </Card>

      {ledgerData ? (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-slate-900 text-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Account Holder</p>
                        <h3 className="text-xl font-bold mt-1 truncate">{ledgerData.contact.name}</h3>
                        <div className="flex items-center gap-2 mt-2 opacity-80">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs font-medium">{ledgerData.contact.phone}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                        <User className="h-6 w-6" />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period Debit</p>
                        <h3 className="text-2xl font-black mt-1 text-rose-600">৳{totals.debit.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <ArrowUpRight className="h-6 w-6" />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period Credit</p>
                        <h3 className="text-2xl font-black mt-1 text-emerald-600">৳{totals.credit.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <ArrowDownLeft className="h-6 w-6" />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closing Balance</p>
                        {(() => {
                            const bal = (ledgerData.contact.customerBalance - ledgerData.contact.supplierBalance);
                            return (
                                <h3 className={cn("text-2xl font-black mt-1", bal >= 0 ? "text-slate-900" : "text-rose-700")}>
                                    ৳{Math.abs(bal).toLocaleString()}
                                    <span className="text-[10px] ml-1.5 opacity-60">{bal >= 0 ? 'DR' : 'CR'}</span>
                                </h3>
                            );
                        })()}
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Scale className="h-6 w-6" />
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table Section */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white rounded-2xl">
            <CardHeader className="border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Transaction Ledger</CardTitle>
                    <CardDescription>Official statement of account for the selected period.</CardDescription>
                </div>
                <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20">
                      <Plus className="mr-2 h-4 w-4" /> Record Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md border-none p-0 overflow-hidden rounded-3xl shadow-2xl bg-white ring-1 ring-slate-100">
                    <div className="bg-slate-900 p-8 text-white">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20"><DollarSign className="h-6 w-6 text-white" /></div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold tracking-tight">Record Entry</DialogTitle>
                                    <DialogDescription className="text-slate-400 text-sm font-medium">Record a manual collection or payment.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 ml-1">Type</Label>
                          <Select 
                            value={paymentData.transactionType} 
                            onValueChange={(v: string | null) => setPaymentData({...paymentData, transactionType: v || "Receipt"})}
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 shadow-sm font-bold text-slate-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                              <SelectItem value="Receipt" className="font-medium">Receipt (Collection)</SelectItem>
                              <SelectItem value="Payment" className="font-medium">Payment (To Partner)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 ml-1">Entry Date</Label>
                          <Input type="date" value={paymentData.transactionDate} onChange={(e) => setPaymentData({...paymentData, transactionDate: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 ml-1">Amount (BDT)</Label>
                        <Input type="number" placeholder="0.00" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-slate-200 text-2xl font-black text-primary" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 ml-1">Offset Account (Cash/Bank)</Label>
                        <Select 
                          value={paymentData.paymentAccountId} 
                          onValueChange={(v: string | null) => setPaymentData({...paymentData, paymentAccountId: v || ""})}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 shadow-sm font-bold text-slate-900">
                            <SelectValue placeholder="Select Source/Dest Account" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200">
                            {paymentAccounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label className="text-xs font-bold text-slate-500 ml-1">Ref #</Label>
                           <Input placeholder="Voucher No" value={paymentData.referenceNo} onChange={(e) => setPaymentData({...paymentData, referenceNo: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium" />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-xs font-bold text-slate-500 ml-1">Narration</Label>
                           <Input placeholder="Note..." value={paymentData.remarks} onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})} className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium" />
                         </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-500" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                        <Button 
                            className="flex-[1.5] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all active:scale-95" 
                            onClick={handleRecordPayment}
                            disabled={submitting}
                        >
                            {submitting ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Record Entry
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto print:overflow-visible">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="py-4 font-bold text-slate-600 whitespace-nowrap pl-2">Date</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600">Particulars / Description</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600">Reference</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600 text-right border-l border-slate-100 bg-rose-50/30">Debit (DR)</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600 text-right border-l border-slate-100 bg-emerald-50/30">Credit (CR)</TableHead>
                        <TableHead className="py-4 font-bold text-slate-600 text-right border-l border-slate-100 bg-slate-50/80 pr-8">Balance</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {ledgerData.openingBalance !== undefined && (
                        <TableRow className="bg-slate-50/50 font-semibold italic border-b border-slate-100">
                        <TableCell></TableCell>
                        <TableCell className="text-[11px] text-slate-400 uppercase tracking-tighter">Brought Forward</TableCell>
                        <TableCell className="uppercase text-[11px] tracking-widest text-slate-500 font-bold">Opening Balance</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right border-l border-slate-100">-</TableCell>
                        <TableCell className="text-right border-l border-slate-100">-</TableCell>
                        <TableCell className="text-right border-l border-slate-100 font-black text-slate-900 pr-8">
                            ৳{ledgerData.openingBalance.toLocaleString()}
                        </TableCell>
                        </TableRow>
                    )}
                    
                    {ledgerData.ledger.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-24">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-slate-50 rounded-full">
                                        <FileText className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-600">Empty period</p>
                                        <p className="text-sm text-slate-400">No transactions recorded for the selected range.</p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        ledgerData.ledger.map((entry: any) => (
                        <React.Fragment key={entry.id}>
                            <TableRow 
                            className={cn(
                                "hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 group",
                                expandedId === entry.id && "bg-slate-50/80"
                            )}
                            onClick={() => toggleExpand(entry.id)}
                            >
                            <TableCell className="py-4 text-center">
                                {entry.details && (
                                    <div className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary transition-colors">
                                        {expandedId === entry.id ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-sm font-bold text-slate-500 whitespace-nowrap pl-2">
                                {format(new Date(entry.transactionDate), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={cn(
                                            "text-[9px] uppercase font-black px-1.5 py-0 rounded-md",
                                            entry.transactionType === 'Sale' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' :
                                            entry.transactionType === 'Purchase' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100' :
                                            entry.transactionType === 'Receipt' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' :
                                            entry.transactionType === 'Payment' ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-100' : 'bg-slate-100 text-slate-600'
                                        )}>
                                            {entry.transactionType}
                                        </Badge>
                                        <span className="font-bold text-slate-900 uppercase text-xs tracking-tight group-hover:text-primary transition-colors">{entry.description}</span>
                                    </div>
                                    {entry.remarks && <span className="text-[10px] text-slate-400 italic ml-1">{entry.remarks}</span>}
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                    <FileText className="h-3 w-3 opacity-50" />
                                    {entry.referenceNo || "N/A"}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-rose-600 text-sm border-l border-slate-50/50 bg-rose-50/5 group-hover:bg-rose-50/10 tabular-nums">
                                {entry.debit > 0 ? `৳${entry.debit.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 text-sm border-l border-slate-50/50 bg-emerald-50/5 group-hover:bg-emerald-50/10 tabular-nums">
                                {entry.credit > 0 ? `৳${entry.credit.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell className="text-right font-black text-slate-900 text-sm border-l border-slate-50/50 bg-slate-50/20 group-hover:bg-slate-50/40 tabular-nums pr-8">
                                ৳{entry.balance.toLocaleString()}
                            </TableCell>
                            </TableRow>
                            
                            {expandedId === entry.id && entry.details && (
                            <TableRow className="bg-slate-50/30 border-none">
                                <TableCell colSpan={7} className="p-0">
                                <div className="px-12 py-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200">
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                                            <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                                                <History className="h-3 w-3" /> Transaction Itemization
                                            </h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ref: {entry.referenceNo}</span>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-8">Item Description</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-8">IMEI / Identifiers</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-8 text-right">Unit Price</TableHead>
                                            </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {entry.details.items?.map((item: any, idx: number) => (
                                                <TableRow key={idx} className="border-slate-50 hover:bg-slate-50/50">
                                                <TableCell className="font-bold text-slate-800 text-xs uppercase py-3">{item.itemName}</TableCell>
                                                <TableCell className="py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                    {item.imeis?.map((im: string) => (
                                                        <code key={im} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{im}</code>
                                                    ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-black text-slate-900 text-xs py-3 tabular-nums">৳{(item.price || 0).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                </TableCell>
                            </TableRow>
                            )}
                        </React.Fragment>
                        ))
                    )}
                    </TableBody>
                    
                    {ledgerData.ledger.length > 0 && (
                        <tfoot className="border-t-2 border-slate-900 bg-slate-900 text-white">
                            <tr>
                                <td colSpan={4} className="py-4 pl-8 text-xs font-black uppercase tracking-widest">Period Statement Summary</td>
                                <td className="py-4 text-right font-bold text-sm tabular-nums pr-4">৳{totals.debit.toLocaleString()}</td>
                                <td className="py-4 text-right font-bold text-sm tabular-nums pr-4">৳{totals.credit.toLocaleString()}</td>
                                <td className="py-4 text-right font-black text-sm tabular-nums pr-8 bg-slate-800">
                                    ৳{(ledgerData.contact.customerBalance - ledgerData.contact.supplierBalance).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : !loading && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
           <div className="h-24 w-24 bg-slate-50 rounded-3xl flex items-center justify-center shadow-sm mb-6 border border-slate-100">
             <Wallet className="h-10 w-10 text-slate-300" />
           </div>
           <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tighter">Account Selection Required</h3>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 max-w-xs text-center leading-relaxed">
               Please choose a customer or supplier from the filters above to generate their transaction ledger.
           </p>
           <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  Select Contact
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  Pick Date Range
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  Load Ledger
              </div>
           </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-32">
           <div className="relative h-16 w-16 mb-6">
               <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
               <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
           </div>
           <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Reconciling Ledger Entries...</p>
        </div>
      )}
    </div>
  );
}
