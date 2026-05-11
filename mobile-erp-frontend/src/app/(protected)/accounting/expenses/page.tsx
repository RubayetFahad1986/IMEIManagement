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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Receipt, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface AccountHead {
  id: number;
  name: string;
  accountType: string;
}

export default function ExpensesPage() {
  const [expenseAccounts, setExpenseAccounts] = useState<AccountHead[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<AccountHead[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    paymentAccountId: "" as string | number,
    expenseDate: format(new Date(), "yyyy-MM-dd"),
    remarks: "",
    details: [{ expenseAccountId: "" as string | number, amount: 0, note: "" }]
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data: AccountHead[] = await apiFetch("/setup/accounts");
      setExpenseAccounts(data.filter(a => a.accountType === "General")); 
      setPaymentAccounts(data.filter(a => a.accountType === "Cash" || a.accountType === "Bank"));
    } catch (error: any) {
      toast.error("Failed to load accounts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { expenseAccountId: "", amount: 0, note: "" }]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/accounting/expense", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          paymentAccountId: typeof formData.paymentAccountId === "string" ? parseInt(formData.paymentAccountId) : formData.paymentAccountId,
          details: formData.details.map(d => ({
            ...d,
            expenseAccountId: typeof d.expenseAccountId === "string" ? parseInt(d.expenseAccountId) : d.expenseAccountId,
            amount: parseFloat(d.amount.toString())
          }))
        })
      });
      toast.success("Expense recorded and journalized!");
      setFormData({
        paymentAccountId: "",
        expenseDate: format(new Date(), "yyyy-MM-dd"),
        remarks: "",
        details: [{ expenseAccountId: "", amount: 0, note: "" }]
      });
    } catch (error: any) {
      toast.error("Failed to save expense: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Record daily shop expenses with searchable accounts.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" /> New Expense Voucher
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Source</Label>
                <SearchableSelect 
                  options={paymentAccounts.map(a => ({ label: a.name, value: a.id }))}
                  value={formData.paymentAccountId}
                  onChange={val => setFormData({...formData, paymentAccountId: val})}
                  placeholder="Select Account..."
                />
              </div>
              <div className="space-y-2">
                <Label>General Remarks</Label>
                <Input placeholder="Optional notes..." value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Expense Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Expense Category</TableHead>
                    <TableHead className="w-1/4">Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.details.map((detail, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <SearchableSelect 
                          options={expenseAccounts.map(a => ({ label: a.name, value: a.id }))}
                          value={detail.expenseAccountId}
                          onChange={val => {
                            const newDetails = [...formData.details];
                            newDetails[idx].expenseAccountId = val;
                            setFormData({...formData, details: newDetails});
                          }}
                          placeholder="Select Category..."
                        />
                      </TableCell>
                      <TableCell>
                        <Input type="number" placeholder="0.00" value={detail.amount} onChange={e => {
                          const newDetails = [...formData.details];
                          newDetails[idx].amount = parseFloat(e.target.value) || 0;
                          setFormData({...formData, details: newDetails});
                        }} />
                      </TableCell>
                      <TableCell>
                        <Input placeholder="Details..." value={detail.note} onChange={e => {
                          const newDetails = [...formData.details];
                          newDetails[idx].note = e.target.value;
                          setFormData({...formData, details: newDetails});
                        }} />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="sm" disabled={formData.details.length === 1} onClick={() => {
                          const newDetails = formData.details.filter((_, i) => i !== idx);
                          setFormData({...formData, details: newDetails});
                        }}> &times; </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRow}><Plus className="mr-2 h-4 w-4" /> Add Row</Button>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 bg-slate-50/50">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm font-medium">Total: <span className="text-lg font-bold text-primary ml-2">${formData.details.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}</span></div>
              <Button type="submit" size="lg">Save Expense</Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
