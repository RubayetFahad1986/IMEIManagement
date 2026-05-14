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
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, UserPlus, MapPin, Phone, Mail, Edit, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ServerPagination } from "@/components/ui/server-pagination";

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  isCustomer: boolean;
  isSupplier: boolean;
  customerBalance: number;
  supplierBalance: number;
}

export default function ContactsPage() {
  const [pageSize, setPageSize] = useState(10);
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
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    isCustomer: true,
    isSupplier: false,
    openingBalance: 0
  });

  const fetchContacts = useCallback(async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const result = await apiFetch(`/setup/contacts?page=${page}&pageSize=${size}&search=${search}`);
      // Standardize casing
      const formatted = {
        items: result.items || result.Items || [],
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      };
      setData(formatted);
    } catch (error: any) {
      toast.error("Failed to load contacts: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts(1, pageSize, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageSize, fetchContacts]);

  const handleCreate = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and Phone are required.");
      return;
    }

    // Client-side check for duplicates
    const isDuplicate = data.items.some((c: any) => 
        c.name.toLowerCase() === newContact.name.toLowerCase() || 
        c.phone === newContact.phone
    );

    if (isDuplicate) {
        toast.warning("A contact with this Name or Phone already exists in the current list.");
    }

    try {
      await apiFetch("/setup/contacts", {
        method: "POST",
        body: JSON.stringify(newContact),
      });
      toast.success("Contact created successfully!");
      setIsAddOpen(false);
      setNewContact({ name: "", phone: "", email: "", address: "", isCustomer: true, isSupplier: false, openingBalance: 0 });
      fetchContacts(1, pageSize, "");
    } catch (error: any) {
      toast.error("Creation failed: " + error.message);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingContact) return;
    try {
      await apiFetch(`/setup/contacts`, {
        method: "PUT",
        body: JSON.stringify(editingContact),
      });
      toast.success("Contact updated successfully!");
      setIsEditOpen(false);
      setEditingContact(null);
      fetchContacts(data.pageNumber, pageSize, searchTerm);
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await apiFetch(`/setup/contacts/${id}`, {
        method: "DELETE",
      });
      toast.success("Contact deleted!");
      fetchContacts(data.pageNumber, pageSize, searchTerm);
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    }
  };

  const items = data.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Contacts</h1>
          <p className="text-muted-foreground">Manage your relationships with server-side pagination.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" /> Add New Contact</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create New Contact</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cName">Full Name</Label>
                <Input id="cName" name="name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cPhone">Phone Number</Label>
                  <Input id="cPhone" name="phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cEmail">Email</Label>
                  <Input id="cEmail" name="email" type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cAddr">Full Address</Label>
                <Input id="cAddr" name="address" value={newContact.address} onChange={e => setNewContact({...newContact, address: e.target.value})} />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isCust" checked={newContact.isCustomer} onCheckedChange={(c) => setNewContact({...newContact, isCustomer: !!c})} />
                    <label htmlFor="isCust" className="text-sm font-medium">Customer</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isSupp" checked={newContact.isSupplier} onCheckedChange={(c) => setNewContact({...newContact, isSupplier: !!c})} />
                    <label htmlFor="isSupp" className="text-sm font-medium">Supplier</label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Directory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name or phone..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Receivable</TableHead>
                <TableHead className="text-right">Payable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell></TableRow>
              ) : (
                items.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center mt-0.5"><MapPin className="mr-1 h-2 w-2" /> {c.address}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{c.phone}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.isCustomer && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Customer</Badge>}
                        {c.isSupplier && <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Supplier</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">৳{(c.customerBalance || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">৳{(c.supplierBalance || 0).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link 
                          href={`/accounting/contact-ledger?id=${c.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-600")}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            pageSize={pageSize}
            onPageChange={(p) => fetchContacts(p, pageSize, searchTerm)}
            onPageSizeChange={(s) => setPageSize(s)}
          />

        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Contact</DialogTitle></DialogHeader>
          {editingContact && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editingContact.name} onChange={e => setEditingContact({...editingContact, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={editingContact.phone} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={editingContact.email} onChange={e => setEditingContact({...editingContact, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Address</Label>
                <Input value={editingContact.address} onChange={e => setEditingContact({...editingContact, address: e.target.value})} />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="eCust" checked={editingContact.isCustomer} onCheckedChange={(c) => setEditingContact({...editingContact, isCustomer: !!c})} />
                    <label htmlFor="eCust" className="text-sm font-medium">Customer</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="eSupp" checked={editingContact.isSupplier} onCheckedChange={(c) => setEditingContact({...editingContact, isSupplier: !!c})} />
                    <label htmlFor="eSupp" className="text-sm font-medium">Supplier</label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
