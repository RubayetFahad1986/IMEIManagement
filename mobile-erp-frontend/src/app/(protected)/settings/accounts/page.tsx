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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Plus, Search, Tag, Trash2, Pencil } from "lucide-react";
import { toast } from "@/lib/toast";
import { ServerPagination } from "@/components/ui/server-pagination";

interface AccountCategory {
  id: number;
  name: string;
}

interface AccountHead {
  id: number;
  name: string;
  accountCategoryId: number;
  category?: { name: string };
  accountType: string;
  currentBalance: number;
  isDefault: boolean;
}

export default function AccountHeadsPage() {
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [categories, setCategories] = useState<AccountCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageData, setPageData] = useState({ pageNumber: 1, totalPages: 1, totalCount: 0 });
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountHead | null>(null);
  const [form, setForm] = useState({ name: "", accountCategoryId: "", accountType: "General" });

  useEffect(() => {
    fetchData(1, "");
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const [accRes, catData] = await Promise.all([
        apiFetch(`/setup/accounts?page=${page}&pageSize=10&search=${search}`),
        apiFetch("/accounting/categories"),
      ]);
      setAccounts(accRes.items || accRes);
      setPageData({
        pageNumber: accRes.pageNumber || 1,
        totalPages: accRes.totalPages || 1,
        totalCount: accRes.totalCount || 0
      });
      setCategories(catData);
    } catch (error: any) {
      toast.error("Failed to load: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        await apiFetch(`/setup/accounts/${editingAccount.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, id: editingAccount.id, accountCategoryId: parseInt(form.accountCategoryId) })
        });
        toast.success("Account updated");
      } else {
        await apiFetch("/setup/accounts", {
          method: "POST",
          body: JSON.stringify({ ...form, accountCategoryId: parseInt(form.accountCategoryId) })
        });
        toast.success("Account created");
      }
      setIsAddOpen(false);
      setEditingAccount(null);
      setForm({ name: "", accountCategoryId: "", accountType: "General" });
      fetchData(1, "");
    } catch (error: any) {
      toast.error("Action failed: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/setup/accounts/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      setPageData(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your account heads and financial categories.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingAccount ? "Edit Account" : "Create Account"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input" value={form.accountCategoryId} onChange={e => setForm({...form, accountCategoryId: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input" value={form.accountType} onChange={e => setForm({...form, accountType: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingAccount ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={() => { setEditingAccount(null); setForm({ name: "", accountCategoryId: "", accountType: "General" }); setIsAddOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Account Head</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-slate-500" /> Total Accounts
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pageData.totalCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Directory</CardTitle>
            <Input placeholder="Search accounts..." className="w-72" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> : accounts.map(acc => (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell><Badge variant="outline">{acc.category?.name || categories.find(c => c.id === acc.accountCategoryId)?.name || "Uncategorized"}</Badge></TableCell>
                  <TableCell>{acc.accountType}</TableCell>
                  <TableCell className="text-right font-mono">${acc.currentBalance.toLocaleString()}</TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    {!acc.isDefault && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingAccount(acc); setForm({ name: acc.name, accountCategoryId: acc.accountCategoryId.toString(), accountType: acc.accountType }); setIsAddOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pageData.totalPages > 1 && <div className="mt-4"><ServerPagination pageNumber={pageData.pageNumber} totalPages={pageData.totalPages} totalCount={pageData.totalCount} onPageChange={(p) => fetchData(p, searchTerm)} /></div>}
        </CardContent>
      </Card>
    </div>
  );
}
