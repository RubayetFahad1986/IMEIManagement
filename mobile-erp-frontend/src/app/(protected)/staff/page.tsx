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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { UserCircle, Plus, Wallet, TrendingUp, DollarSign, UserPlus, Phone, Briefcase, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  designation: string;
  phone: string;
  commissionBalance: number;
  totalCommissionEarned: number;
}

export default function StaffPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    designation: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await apiFetch("/setup/staff");
      setEmployees(data);
    } catch (error: any) {
      toast.error("Failed to fetch staff: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newEmployee.name || !newEmployee.phone) {
        toast.error("Name and Phone are required.");
        return;
    }
    try {
      await apiFetch("/setup/staff", {
        method: "POST",
        body: JSON.stringify({ ...newEmployee, comId: 1 }),
      });
      toast.success("Employee added successfully!");
      setIsAddOpen(false);
      setNewEmployee({ name: "", designation: "", phone: "", email: "" });
      fetchStaff();
    } catch (error: any) {
      toast.error("Failed to add employee: " + error.message);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEmployee) return;
    try {
      await apiFetch(`/setup/staff`, {
        method: "PUT",
        body: JSON.stringify(editingEmployee),
      });
      toast.success("Employee updated!");
      setIsEditOpen(false);
      setEditingEmployee(null);
      fetchStaff();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await apiFetch(`/setup/staff/${id}`, {
        method: "DELETE",
      });
      toast.success("Employee removed!");
      fetchStaff();
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage employees and their sales commissions.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>} />
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5" /> New Employee</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Full Name</Label>
                 <Input value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} placeholder="e.g. John Doe" />
               </div>
               <div className="space-y-2">
                 <Label>Designation</Label>
                 <div className="relative">
                   <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input className="pl-10" value={newEmployee.designation} onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})} placeholder="e.g. Sales Manager" />
                 </div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                   <Label>Phone Number</Label>
                   <div className="relative">
                     <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input className="pl-10" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} placeholder="e.g. 01712345678" />
                   </div>
                 </div>
               </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <UserCircle className="mr-2 h-4 w-4" /> Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{employees.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ৳{employees.reduce((acc, e) => acc + (e.totalCommissionEarned || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <Wallet className="mr-2 h-4 w-4" /> Unpaid Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ৳{employees.reduce((acc, e) => acc + (e.commissionBalance || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Total Earned</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading staff data...</TableCell></TableRow>
              ) : employees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No employees found. Register your first staff member.</TableCell></TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6">
                       <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">{emp.name[0]}</div>
                          <div className="font-medium text-slate-900">{emp.name}</div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">{emp.designation || "Staff"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{emp.phone}</TableCell>
                    <TableCell className="text-right font-mono text-slate-500">৳{(emp.totalCommissionEarned || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={(emp.commissionBalance || 0) > 0 ? "default" : "secondary"} className={(emp.commissionBalance || 0) > 0 ? "bg-orange-100 text-orange-700 border-none" : ""}>
                        ৳{(emp.commissionBalance || 0).toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(emp)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(emp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs"><DollarSign className="mr-1 h-3 w-3" /> Pay</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Employee Details</DialogTitle></DialogHeader>
          {editingEmployee && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={editingEmployee.designation} onChange={e => setEditingEmployee({...editingEmployee, designation: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={editingEmployee.phone} onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
