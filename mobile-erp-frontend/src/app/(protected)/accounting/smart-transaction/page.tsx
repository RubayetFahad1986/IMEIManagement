"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { 
  Building2, 
  ArrowRightLeft, 
  UserPlus, 
  TrendingUp, 
  ShoppingBag, 
  History, 
  CheckCircle2,
  Calendar,
  Wallet,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSACTION_TYPES = [
  { id: "Expense", label: "Daily Expense", icon: ShoppingBag, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", desc: "Rent, Bills, Salary etc." },
  { id: "Income", label: "Other Income", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", desc: "Interest, Commissions etc." },
  { id: "Asset", label: "Asset Purchase", icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", desc: "Furniture, Computers etc." },
  { id: "Contra", label: "Contra Entry", icon: ArrowRightLeft, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", desc: "Bank Transfer, Cash in/out." },
  { id: "EmployeeLoan", label: "Staff Loan", icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", desc: "Advance or Recovery." },
];

export default function SmartTransactionPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("Expense");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    debitAccountId: "" as string | number,
    creditAccountId: "" as string | number,
    amount: "",
    transactionDate: format(new Date(), "yyyy-MM-dd"),
    remarks: "",
    referenceNo: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await apiFetch("/setup/accounts/all");
      setAccounts(data || []);
    } catch (e) { toast.error("Failed to load accounts"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.debitAccountId || !formData.creditAccountId) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/accounting/smart-transaction", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          transactionType: selectedType,
          amount: parseFloat(formData.amount),
          debitAccountId: typeof formData.debitAccountId === "string" ? parseInt(formData.debitAccountId) : formData.debitAccountId,
          creditAccountId: typeof formData.creditAccountId === "string" ? parseInt(formData.creditAccountId) : formData.creditAccountId,
        })
      });
      toast.success("Transaction recorded and journalized!");
      setFormData({
        ...formData,
        amount: "",
        remarks: "",
        referenceNo: "",
        debitAccountId: "",
        creditAccountId: ""
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  const getDebitLabel = () => {
    if (selectedType === "Expense") return "Expense Category (Debit)";
    if (selectedType === "Income") return "Received Into (Cash/Bank)";
    if (selectedType === "Asset") return "Asset Account (Debit)";
    if (selectedType === "Contra") return "Transfer TO (Debit)";
    if (selectedType === "EmployeeLoan") return "Debit Account";
    return "Debit Account";
  };

  const getCreditLabel = () => {
    if (selectedType === "Expense") return "Paid From (Cash/Bank)";
    if (selectedType === "Income") return "Income Source (Credit)";
    if (selectedType === "Asset") return "Paid From (Cash/Bank)";
    if (selectedType === "Contra") return "Transfer FROM (Credit)";
    if (selectedType === "EmployeeLoan") return "Credit Account";
    return "Credit Account";
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Transaction</h1>
        <p className="text-muted-foreground">Record any financial transaction with simple accounting logic.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TRANSACTION_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-2",
              selectedType === type.id 
                ? cn("border-primary bg-primary/5 ring-1 ring-primary shadow-sm")
                : "bg-white hover:bg-slate-50 border-slate-200"
            )}
          >
            <div className={cn("p-2 rounded-lg", type.bg, type.color)}>
              <type.icon className="h-5 w-5" />
            </div>
            <span className={cn("text-xs font-bold", selectedType === type.id ? "text-primary" : "text-slate-600")}>
              {type.label}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md", TRANSACTION_TYPES.find(t => t.id === selectedType)?.bg, TRANSACTION_TYPES.find(t => t.id === selectedType)?.color)}>
                {TRANSACTION_TYPES.find(t => t.id === selectedType)?.icon && 
                 React.createElement(TRANSACTION_TYPES.find(t => t.id === selectedType)!.icon, { className: "h-4 w-4" })}
              </div>
              {TRANSACTION_TYPES.find(t => t.id === selectedType)?.label} Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">{getDebitLabel()}</Label>
                  <SearchableSelect 
                    options={accounts.map(acc => ({ label: `${acc.name} (${acc.accountType})`, value: acc.id }))}
                    value={formData.debitAccountId}
                    onChange={v => setFormData({...formData, debitAccountId: v})}
                    placeholder="Search Account..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">{getCreditLabel()}</Label>
                  <SearchableSelect 
                    options={accounts.map(acc => ({ label: `${acc.name} (${acc.accountType})`, value: acc.id }))}
                    value={formData.creditAccountId}
                    onChange={v => setFormData({...formData, creditAccountId: v})}
                    placeholder="Search Account..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">Transaction Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-10" value={formData.transactionDate} onChange={e => setFormData({...formData, transactionDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">Amount (BDT)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="0.00" className="pl-10 text-lg font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500">Reference No / Voucher #</Label>
                <Input placeholder="Optional reference..." value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500">Remarks / Particulars</Label>
                <Input placeholder="Purpose of transaction..." value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50/30 p-6">
            <Button type="submit" disabled={loading} className="w-full h-12 text-md font-bold uppercase tracking-wide">
               {loading ? "Processing..." : "Confirm & Post Transaction"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-blue-400" /> Accounting Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Debit Account</span>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {accounts.find(a => a.id == formData.debitAccountId)?.name || "Not Selected"}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">
                    ৳{(parseFloat(formData.amount) || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-slate-600 rotate-90 lg:rotate-0" />
                </div>

                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Credit Account</span>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {accounts.find(a => a.id == formData.creditAccountId)?.name || "Not Selected"}
                    </span>
                  </div>
                  <span className="font-bold text-rose-400 font-mono">
                    ৳{(parseFloat(formData.amount) || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic opacity-80">
                This will create a dual-entry journal voucher in your system.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50 border border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {[
                  "Contra: For Bank to Cash or Bank to Bank.",
                  "Expenses: Decreases your cash/bank balance.",
                  "Asset: Increases your company's fixed value.",
                  "Income: Records non-sales revenue sources."
                ].map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-[10px] font-bold text-slate-600 uppercase leading-tight tracking-tight">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

