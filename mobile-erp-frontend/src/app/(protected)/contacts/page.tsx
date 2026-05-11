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
import { Users, Plus, Search, Phone, Mail, MapPin, UserPlus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newContact, setNewAccount] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    isCustomer: true,
    isSupplier: false,
    openingBalance: 0
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await apiFetch("/setup/contacts");
      setContacts(data);
    } catch (error: any) {
      toast.error("Failed to load contacts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and Phone are required.");
      return;
    }
    try {
      await apiFetch("/setup/contacts", {
        method: "POST",
        body: JSON.stringify({ ...newContact, comId: 1 }),
      });
      toast.success("Contact created successfully!");
      setIsAddOpen(false);
      setNewAccount({ name: "", phone: "", email: "", address: "", isCustomer: true, isSupplier: false, openingBalance: 0 });
      fetchContacts();
    } catch (error: any) {
      toast.error("Creation failed: " + error.message);
    }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Contacts</h1>
          <p className="text-muted-foreground">Manage your relationships with customers and suppliers.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Add New Contact</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newContact.name} onChange={e => setNewAccount({...newContact, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={newContact.phone} onChange={e => setNewAccount({...newContact, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input type="email" value={newContact.email} onChange={e => setNewAccount({...newContact, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Address</Label>
                <Input value={newContact.address} onChange={e => setNewAccount({...newContact, address: e.target.value})} />
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-500">Contact Roles</Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isCust" checked={newContact.isCustomer} onCheckedChange={(c) => setNewAccount({...newContact, isCustomer: !!c})} />
                    <label htmlFor="isCust" className="text-sm font-medium">Customer</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isSupp" checked={newContact.isSupplier} onCheckedChange={(c) => setNewAccount({...newContact, isSupplier: !!c})} />
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
              <Input
                placeholder="Search name or phone..."
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
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell></TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center mt-0.5">
                        <MapPin className="mr-1 h-2 w-2" /> {c.address}
                      </div>
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
                    <TableCell className="text-right font-medium text-green-600">
                      ${c.customerBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      ${c.supplierBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">History</Button>
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
