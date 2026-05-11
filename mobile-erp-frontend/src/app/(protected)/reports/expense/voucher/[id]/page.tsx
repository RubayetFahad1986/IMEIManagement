"use client";

import { use, useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface VoucherProps {
  params: Promise<{ id: string }>;
}

export default function ExpenseVoucherPage({ params }: VoucherProps) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const [invData, accData] = await Promise.all([
        apiFetch(`/accounting/expense/${id}`),
        apiFetch("/setup/accounts")
      ]);
      setData(invData);
      setAccounts(accData);
    } catch (error: any) {
      toast.error("Failed to load voucher: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Voucher...</div>;
  if (!data) return <div className="p-10 text-center text-destructive">Voucher not found.</div>;

  const getAccountName = (accId: number) => accounts.find(a => a.id === accId)?.name || "General Expense";


  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => router.push("/accounting/expenses")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print Voucher</Button>
      </div>

      <div className="bg-white p-8 border rounded-lg shadow-sm">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">Expense Voucher</h1>
            <p className="text-sm text-slate-500">Voucher No: {data.voucherNo}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Date</p>
                <p>{format(new Date(data.expenseDate), "dd MMM yyyy")}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Amount</p>
                <p className="font-bold text-xl">৳{data.totalAmount.toLocaleString()}</p>
            </div>
        </div>

        <div className="border-t border-b py-4 mb-4">
            <table className="w-full">
                <thead>
                    <tr className="text-xs uppercase text-slate-500 text-left">
                        <th className="pb-2">Account</th>
                        <th className="pb-2">Note</th>
                        <th className="pb-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.details.map((d: any, idx: number) => (
                        <tr key={idx}>
                            <td className="py-2">{getAccountName(d.expenseAccountId)}</td>
                            <td className="py-2 text-sm">{d.note || "—"}</td>
                            <td className="py-2 text-right">৳{d.amount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6">
            <p className="text-sm font-bold text-slate-600">Remarks:</p>
            <p className="text-sm">{data.remarks || "No remarks"}</p>
        </div>
      </div>
    </div>
  );
}
