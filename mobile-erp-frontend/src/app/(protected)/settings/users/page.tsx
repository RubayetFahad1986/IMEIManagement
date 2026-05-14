"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { UserCog, Plus, Search, Edit, Trash2, ShieldCheck, Eye, EyeOff, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { ServerPagination } from "@/components/ui/server-pagination";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  isShowCosting: boolean;
  canSeeOthersEntry: boolean;
  branchId?: number;
}

export default function UserManagementPage() {
  const [data, setData] = useState<any>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "User",
    isActive: true,
    isShowCosting: false,
    canSeeOthersEntry: true
  });

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/setup/users?page=${page}&pageSize=10&search=${search}`);
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchUsers(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchUsers]);

  const handleCreate = async () => {
    if (!newUser.username || !newUser.fullName) {
        toast.error("Username and Full Name are required.");
        return;
    }
    try {
      await apiFetch("/setup/users", {
        method: "POST",
        body: JSON.stringify({ ...newUser, comId: 1 }),
      });
      toast.success("User created successfully! Default password is 'Admin123'");
      setIsAddOpen(false);
      setNewUser({ username: "", fullName: "", email: "", role: "User", isActive: true, isShowCosting: false, canSeeOthersEntry: true });
      fetchUsers(1, "");
    } catch (error: any) {
      toast.error("Creation failed: " + error.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await apiFetch(`/setup/users`, {
        method: "PUT",
        body: JSON.stringify(editingUser),
      });
      toast.success("User updated successfully!");
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers(data.pageNumber, searchTerm);
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiFetch(`/setup/users/${id}`, {
        method: "DELETE",
      });
      toast.success("User removed!");
      setData((prev: any) => ({
        ...prev,
        items: prev.items.filter((u: any) => u.id !== id),
        totalCount: prev.totalCount - 1
      }));
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    }
  };

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system access, roles, and advanced permissions.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Create User</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New User Account</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Username</Label>
                 <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="e.g. johndoe" />
               </div>
               <div className="space-y-2">
                 <Label>Full Name</Label>
                 <Input value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} placeholder="e.g. John Doe" />
               </div>
               <div className="space-y-2">
                 <Label>Role</Label>
                 <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="User">User / Staff</option>
                    <option value="Admin">Admin</option>
                    <option value="CompanyAdmin">Company Admin</option>
                    <option value="SuperAdmin">Super Admin</option>
                 </select>
               </div>
               
               <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-500">Permissions</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ncost" checked={newUser.isShowCosting} onCheckedChange={v => setNewUser({...newUser, isShowCosting: !!v})} />
                    <Label htmlFor="ncost" className="text-sm font-medium">Show Costing (Cost Price)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="nothers" checked={newUser.canSeeOthersEntry} onCheckedChange={v => setNewUser({...newUser, canSeeOthersEntry: !!v})} />
                    <Label htmlFor="nothers" className="text-sm font-medium">See Other Person's Entry</Label>
                  </div>
               </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registered Users</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name or username..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
              ) : (
                items.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50">
                    <TableCell>
                       <div className="font-medium">{u.fullName}</div>
                       <div className="text-xs text-muted-foreground">@{u.username}</div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-2">
                          {u.isShowCosting ? <Badge title="Can see cost price" className="bg-green-100 text-green-700 border-none"><DollarSign className="h-3 w-3" /></Badge> : <Badge variant="secondary" className="opacity-30"><DollarSign className="h-3 w-3" /></Badge>}
                          {u.canSeeOthersEntry ? <Badge title="Can see others' entries" className="bg-indigo-100 text-indigo-700 border-none"><Eye className="h-3 w-3" /></Badge> : <Badge variant="secondary" className="opacity-30"><EyeOff className="h-3 w-3" /></Badge>}
                       </div>
                    </TableCell>
                    <TableCell>
                       {u.isActive ? <Badge className="bg-green-500">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(u)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <ServerPagination 
            pageNumber={data.pageNumber} 
            totalPages={data.totalPages} 
            totalCount={data.totalCount}
            onPageChange={(p) => fetchUsers(p, searchTerm)}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit User Permissions</DialogTitle></DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editingUser.fullName} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="User">User / Staff</option>
                    <option value="Admin">Admin</option>
                    <option value="CompanyAdmin">Company Admin</option>
                    <option value="SuperAdmin">Super Admin</option>
                 </select>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-500">Permissions</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ecost" checked={editingUser.isShowCosting} onCheckedChange={v => setEditingUser({...editingUser, isShowCosting: !!v})} />
                    <Label htmlFor="ecost" className="text-sm font-medium">Show Costing (Cost Price)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="eothers" checked={editingUser.canSeeOthersEntry} onCheckedChange={v => setEditingUser({...editingUser, canSeeOthersEntry: !!v})} />
                    <Label htmlFor="eothers" className="text-sm font-medium">See Other Person's Entry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="eactive" checked={editingUser.isActive} onCheckedChange={v => setEditingUser({...editingUser, isActive: !!v})} />
                    <Label htmlFor="eactive" className="text-sm font-medium">Account Active</Label>
                  </div>
               </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
