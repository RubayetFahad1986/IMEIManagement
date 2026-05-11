"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, Calendar, List, Trash2, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServerPagination } from "@/components/ui/server-pagination";

interface AccountHead {
  id: number;
  name: string;
  accountType: string;
}

interface ExpenseData {
  id: number;
  voucherNo: string;
  expenseDate: string;
  createDate: string;
  remarks: string | null;
  totalAmount: number;
}

export default function ExpensesPage() {
  const [expenseAccounts, setExpenseAccounts] = useState<AccountHead[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<AccountHead[]>([]);
  const [activeTab, setActiveTab] = useState("list");

  // List State
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageData, setPageData] = useState({ pageNumber: 1, totalPages: 1, totalCount: 0 });
  
  // Form State
  const [formData, setFormData] = useState({
    id: null as number | null,
    paymentAccountId: "" as string | number,
    expenseDate: format(new Date(), "yyyy-MM-dd"),
    remarks: "",
    details: [{ expenseAccountId: "", amount: 0, note: "" }]
  });
  
  const handleEdit = async (id: number) => {
    try {
      const data = await apiFetch(`/accounting/expense/${id}`);
      setFormData({
        id: data.id,
        paymentAccountId: data.paymentAccountId,
        expenseDate: format(new Date(data.expenseDate), "yyyy-MM-dd"),
        remarks: data.remarks || "",
        details: data.details.map((d: any) => ({
          expenseAccountId: d.expenseAccountId,
          amount: d.amount,
          note: d.note || ""
        }))
      });
      setActiveTab("new");
    } catch (error: any) {
      toast.error("Failed to load expense for editing: " + error.message);
    }
  };

  const handlePrint = (id: number) => {
    // Basic implementation: you can replace this with a dedicated report print URL
    window.open(`/reports/expense/voucher/${id}`, "_blank");
  };

  const fetchAccounts = useCallback(async () => {
    try {
      const data: AccountHead[] = await apiFetch("/setup/accounts");
      setExpenseAccounts(data.filter(a => a.accountType === "General")); 
      setPaymentAccounts(data.filter(a => a.accountType === "Cash" || a.accountType === "Bank"));
    } catch (error: unknown) {
      const e = error as Error;
      toast.error("Failed to load accounts: " + e.message);
    }
  }, []);

  const fetchExpenses = useCallback(async (page: number, search: string) => {
    setListLoading(true);
    try {
      const result = await apiFetch(`/accounting/expenses?page=${page}&pageSize=10&search=${search}`);
      setExpenses(result.items || result.Items || []);
      setPageData({
        pageNumber: result.pageNumber || result.PageNumber || 1,
        totalPages: result.totalPages || result.TotalPages || 1,
        totalCount: result.totalCount || result.TotalCount || 0
      });
    } catch (error: unknown) {
      const e = error as Error;
      toast.error("Failed to load expenses: " + e.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchExpenses(1, "");
  }, [fetchAccounts, fetchExpenses]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchExpenses]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense? The journal entry will be reversed.")) return;
    try {
      await apiFetch(`/accounting/expense/${id}`, { method: "DELETE" });
      toast.success("Expense deleted successfully");
      fetchExpenses(pageData.pageNumber, searchTerm);
    } catch (error: unknown) {
      const e = error as Error;
      toast.error("Failed to delete expense: " + e.message);
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
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `/accounting/expense/${formData.id}` : "/accounting/expense";
      await apiFetch(url, {
        method: method,
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
      toast.success(formData.id ? "Expense updated!" : "Expense recorded!");
      setFormData({
        id: null,
        paymentAccountId: "",
        expenseDate: format(new Date(), "yyyy-MM-dd"),
        remarks: "",
        details: [{ expenseAccountId: "", amount: 0, note: "" }]
      });
      fetchExpenses(1, "");
      setActiveTab("list");
    } catch (error: unknown) {
      const e = error as Error;
      toast.error("Failed to save expense: " + e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Manage and record daily shop expenses.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center"><List className="mr-2 h-4 w-4" /> Expense List</TabsTrigger>
          <TabsTrigger value="new" className="flex items-center"><Plus className="mr-2 h-4 w-4" /> New Expense</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Recent Expenses</CardTitle>
              <Input 
                placeholder="Search voucher or remarks..." 
                className="max-w-xs mt-0" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Voucher No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading expenses...</TableCell></TableRow>
                  ) : expenses.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No expenses found.</TableCell></TableRow>
                  ) : (
                    expenses.map((exp: ExpenseData) => (
                      <TableRow key={exp.id}>
                        <TableCell className="font-bold text-blue-600">{exp.voucherNo}</TableCell>
                        <TableCell>{format(new Date(exp.expenseDate || exp.createDate), "dd MMM yyyy")}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{exp.remarks || "—"}</TableCell>
                        <TableCell className="text-right font-bold text-slate-900">৳{exp.totalAmount.toLocaleString("en-US")}</TableCell>
                        <TableCell className="text-center flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(exp.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handlePrint(exp.id)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {expenses.length > 0 && (
                <div className="mt-4">
                  <ServerPagination 
                    pageNumber={pageData.pageNumber} 
                    totalPages={pageData.totalPages} 
                    totalCount={pageData.totalCount}
                    onPageChange={(p) => fetchExpenses(p, searchTerm)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                   <div className="flex items-center">
                     <Receipt className="mr-2 h-5 w-5" /> {formData.id ? "Edit Expense Voucher" : "New Expense Voucher"}
                   </div>
                   {formData.id && <Badge variant="destructive">Editing Voucher: {formData.id}</Badge>}
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
                  <div className="text-sm font-medium">Total: <span className="text-lg font-bold text-primary ml-2">৳{formData.details.reduce((acc, d) => acc + d.amount, 0).toLocaleString("en-US")}</span></div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => {
                        setFormData({
                            id: null,
                            paymentAccountId: "",
                            expenseDate: format(new Date(), "yyyy-MM-dd"),
                            remarks: "",
                            details: [{ expenseAccountId: "", amount: 0, note: "" }]
                        });
                        setActiveTab("list");
                    }}>Cancel</Button>
                    <Button type="submit" size="lg" variant={formData.id ? "secondary" : "default"}>
                        {formData.id ? "Update Expense" : "Save Expense"}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}