"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { format } from "date-fns";
import { Plus, Trash2, List, Eye, Edit, X, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Branch { id: number; name: string; }
interface InventoryItem { 
  id: number; 
  deviceName: string; 
  imei1: string; 
  imei2?: string; 
  serialNumber?: string; 
  condition: string; 
  branchId: number;
}

interface TransferDetail {
  id: number;
  inventoryItemId: number;
  inventoryItem?: InventoryItem;
}

interface Transfer {
  id: number;
  fromBranchId: number;
  toBranchId: number;
  transferDate: string;
  remarks: string;
  status: string;
  details: TransferDetail[];
}

export default function BranchTransfersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fromBranchId: "",
    toBranchId: "",
    transferDate: format(new Date(), "yyyy-MM-dd"),
    remarks: "",
    details: [] as { inventoryItemId: number; deviceName?: string; imei?: string }[]
  });

  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [viewingTransfer, setViewingTransfer] = useState<Transfer | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [branchesRes, invRes] = await Promise.all([
        apiFetch("/setup/branches"),
        apiFetch("/inventory/all")
      ]);
      setBranches(branchesRes);
      setInventory(invRes);
    } catch (e: any) { toast.error(e.message); }
  }, []);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/transfer");
      setTransfers(res.items);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); fetchTransfers(); }, [fetchData, fetchTransfers]);

  const availableInventory = useMemo(() => {
    if (!formData.fromBranchId) return [];
    return inventory.filter(i => 
      (i.branchId === parseInt(formData.fromBranchId) || (editingId && inventory.find(inv => inv.id === i.id)?.branchId === inventory.find(inv => inv.id === i.id)?.branchId)) && 
      !formData.details.some(d => d.inventoryItemId === i.id)
    );
  }, [inventory, formData.fromBranchId, formData.details, editingId]);

  const addItem = () => {
    if (!selectedInventoryId) return;
    const item = inventory.find(i => i.id === parseInt(selectedInventoryId));
    if (item) {
      setFormData({
        ...formData,
        details: [...formData.details, { 
          inventoryItemId: item.id, 
          deviceName: item.deviceName, 
          imei: item.imei1 
        }]
      });
      setSelectedInventoryId("");
    }
  };

  const removeItem = (id: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter(d => d.inventoryItemId !== id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.details.length === 0) {
      toast.error("Please add at least one item to transfer.");
      return;
    }
    if (formData.fromBranchId === formData.toBranchId) {
      toast.error("From and To branches must be different.");
      return;
    }

    try {
      const url = editingId ? `/transfer/${editingId}` : "/transfer";
      const method = editingId ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify({
          fromBranchId: parseInt(formData.fromBranchId),
          toBranchId: parseInt(formData.toBranchId),
          transferDate: formData.transferDate,
          remarks: formData.remarks,
          details: formData.details.map(d => ({ inventoryItemId: d.inventoryItemId }))
        })
      });
      toast.success(editingId ? "Transfer updated!" : "Transfer completed!");
      resetForm();
      setActiveTab("list");
      fetchTransfers();
      fetchData(); // Refresh inventory
    } catch (e: any) { toast.error(e.message); }
  };

  const resetForm = () => {
    setFormData({
      fromBranchId: "",
      toBranchId: "",
      transferDate: format(new Date(), "yyyy-MM-dd"),
      remarks: "",
      details: []
    });
    setEditingId(null);
  };

  const handleEdit = async (transfer: Transfer) => {
    try {
      // Fetch full details if not present
      const fullTransfer = await apiFetch(`/transfer/${transfer.id}`);
      setFormData({
        fromBranchId: fullTransfer.fromBranchId.toString(),
        toBranchId: fullTransfer.toBranchId.toString(),
        transferDate: format(new Date(fullTransfer.transferDate), "yyyy-MM-dd"),
        remarks: fullTransfer.remarks || "",
        details: fullTransfer.details.map((d: any) => ({
          inventoryItemId: d.inventoryItemId,
          deviceName: d.inventoryItem?.deviceName || "Product",
          imei: d.inventoryItem?.imei1 || "N/A"
        }))
      });
      setEditingId(transfer.id);
      setActiveTab("new");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transfer? This will reverse the inventory changes.")) return;
    try {
      await apiFetch(`/transfer/${id}`, { method: "DELETE" });
      toast.success("Transfer deleted and inventory reversed.");
      fetchTransfers();
      fetchData();
    } catch (e: any) { toast.error(e.message); }
  };

  const openView = async (id: number) => {
    try {
      const res = await apiFetch(`/transfer/${id}`);
      setViewingTransfer(res);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          Inventory Transfers
        </h1>
        <Button onClick={() => {
          if (activeTab === "new") {
            resetForm();
            setActiveTab("list");
          } else {
            setActiveTab("new");
          }
        }}>
          {activeTab === "list" ? <Plus className="mr-2 h-4 w-4" /> : <List className="mr-2 h-4 w-4" />}
          {activeTab === "list" ? "New Transfer" : "Back to List"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        if (v === "list") resetForm();
        setActiveTab(v);
      }}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="list">Transfer History</TabsTrigger>
          <TabsTrigger value="new">{editingId ? "Edit Transfer" : "New Transfer"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Log</CardTitle>
              <CardDescription>Track movements between warehouses and branches.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From Warehouse</TableHead>
                    <TableHead>To Warehouse</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center">Loading transfers...</TableCell></TableRow>
                  ) : transfers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transfers found.</TableCell></TableRow>
                  ) : transfers.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{format(new Date(t.transferDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{branches.find(b => b.id === t.fromBranchId)?.name || t.fromBranchId}</TableCell>
                      <TableCell>{branches.find(b => b.id === t.toBranchId)?.name || t.toBranchId}</TableCell>
                      <TableCell>{t.details?.length || 0} items</TableCell>
                      <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openView(t.id)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t) }><Edit className="h-4 w-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Transfer Details" : "Transfer Details"}</CardTitle>
                <CardDescription>Select source and destination warehouses.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SearchableSelect 
                  label="From Warehouse" 
                  options={branches.map(b => ({ label: b.name, value: b.id }))} 
                  value={formData.fromBranchId} 
                  onChange={v => setFormData({...formData, fromBranchId: v, details: []})} 
                  disabled={!!editingId}
                />
                <SearchableSelect 
                  label="To Warehouse" 
                  options={branches.map(b => ({ label: b.name, value: b.id }))} 
                  value={formData.toBranchId} 
                  onChange={v => setFormData({...formData, toBranchId: v})} 
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transfer Date</label>
                  <Input type="date" value={formData.transferDate} onChange={e => setFormData({...formData, transferDate: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Products & IMEIs</CardTitle>
                <CardDescription>Add items from the source warehouse to this transfer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <SearchableSelect 
                      label="Select Item" 
                      options={availableInventory.map(i => ({ 
                        label: `${i.deviceName} (${i.imei1})`, 
                        value: i.id 
                      }))} 
                      value={selectedInventoryId} 
                      onChange={setSelectedInventoryId} 
                    />
                  </div>
                  <Button type="button" onClick={addItem} disabled={!selectedInventoryId || !formData.fromBranchId}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>IMEI / SN</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.details.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No items added to transfer yet.</TableCell></TableRow>
                    ) : formData.details.map(d => (
                      <TableRow key={d.inventoryItemId}>
                        <TableCell>{d.deviceName}</TableCell>
                        <TableCell>{d.imei}</TableCell>
                        <TableCell>{inventory.find(i => i.id === d.inventoryItemId)?.condition || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(d.inventoryItemId)}><X className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Remarks</label>
                  <Input placeholder="Any additional notes..." value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" size="lg" className="flex-1" disabled={formData.details.length === 0}>
                    {editingId ? "Update Transfer" : "Confirm & Complete Transfer"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" size="lg" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={!!viewingTransfer} onOpenChange={() => setViewingTransfer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
          </DialogHeader>
          {viewingTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>From Warehouse:</strong> {branches.find(b => b.id === viewingTransfer.fromBranchId)?.name}</div>
                <div><strong>To Warehouse:</strong> {branches.find(b => b.id === viewingTransfer.toBranchId)?.name}</div>
                <div><strong>Date:</strong> {format(new Date(viewingTransfer.transferDate), "dd MMM yyyy")}</div>
                <div><strong>Status:</strong> {viewingTransfer.status}</div>
              </div>
              <div>
                <strong>Remarks:</strong> {viewingTransfer.remarks || "N/A"}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>IMEI / SN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingTransfer.details?.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>
                        {d.inventoryItem?.deviceName || 
                         (d.inventoryItem?.mobileDevice ? `${d.inventoryItem.mobileDevice.brand} ${d.inventoryItem.mobileDevice.modelName}` : "Unknown")}
                      </TableCell>
                      <TableCell>{d.inventoryItem?.imei1 || d.inventoryItem?.serialNumber || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingTransfer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
