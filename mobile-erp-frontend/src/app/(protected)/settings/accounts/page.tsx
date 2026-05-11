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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Plus, Search, Tag, Wallet } from "lucide-react";
import { toast } from "sonner";

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
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newAccount, setNewAccount] = useState({
    name: "",
    accountCategoryId: "",
    accountType: "General",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accData, catData] = await Promise.all([
        apiFetch("/setup/accounts"),
        apiFetch("/accounting/categories"),
      ]);
      setAccounts(accData);
      setCategories(catData);
    } catch (error: any) {
      toast.error("Failed to load accounts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAccount.name || !newAccount.accountCategoryId) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await apiFetch("/setup/accounts", {
        method: "POST",
        body: JSON.stringify({
          ...newAccount,
          accountCategoryId: parseInt(newAccount.accountCategoryId),
          comId: 1
        }),
      });
      toast.success("Account head created successfully!");
      setIsAddOpen(false);
      setNewAccount({ name: "", accountCategoryId: "", accountType: "General" });
      fetchData();
    } catch (error: any) {
      toast.error("Creation failed: " + error.message);
    }
  };

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your account heads and financial categories.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Account Head</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account Head</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input 
                  placeholder="e.g. Petty Cash, Office Supplies" 
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={newAccount.accountCategoryId}
                  onChange={e => setNewAccount({...newAccount, accountCategoryId: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={newAccount.accountType}
                  onChange={e => setNewAccount({...newAccount, accountType: e.target.value})}
                >
                  <option value="General">General (Expense/Income/Asset)</option>
                  <option value="Cash">Cash (Physical Cash)</option>
                  <option value="Bank">Bank (Account/Gateway)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-slate-500" /> Total Heads
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{accounts.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Directory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No accounts found.</TableCell></TableRow>
              ) : (
                filtered.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-medium">{acc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center">
                        <Tag className="mr-1 h-3 w-3" /> {acc.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-500 uppercase">{acc.accountType}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${acc.currentBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {acc.isDefault ? (
                        <Badge className="bg-slate-100 text-slate-600 border-none">System</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
