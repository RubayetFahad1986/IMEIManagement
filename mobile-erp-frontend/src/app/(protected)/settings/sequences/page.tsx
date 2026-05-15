"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hash, Save, RotateCcw, Loader2, Settings2, ShieldCheck, Ticket } from "lucide-react";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";

export default function DocumentSequencesPage() {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  const fetchSequences = useCallback(async () => {
    try {
      const res = await apiFetch("/settings/sequences");
      setSequences(res);
    } catch (err) {
      toast.error("Failed to load document sequences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  const handleUpdate = async (seq: any) => {
    setIsSaving(seq.id);
    try {
      await apiFetch(`/settings/sequences/${seq.id}`, {
        method: "PUT",
        body: JSON.stringify(seq)
      });
      toast.success(`${seq.documentType} sequence updated successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update sequence");
    } finally {
      setIsSaving(null);
    }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-primary uppercase italic tracking-widest">Configuring Core Automations...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary" /> 
          Document <span className="text-primary italic">Sequences</span>
        </h1>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
          Configure auto-incrementing codes and prefixes for all system modules
        </p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card">
        <CardHeader className="bg-slate-950 text-white p-8">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Hash className="h-6 w-6 text-primary" /> Global Master Sequence
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                        Define starting numbers and unique document identifiers
                    </CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary font-black uppercase text-[10px] px-3 h-8">
                    Production Environment
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-muted/10">
                    <TableRow className="border-none">
                        <TableHead className="pl-8 text-[10px] font-black uppercase h-12">Document Module</TableHead>
                        <TableHead className="text-[10px] font-black uppercase h-12">Code Prefix</TableHead>
                        <TableHead className="text-[10px] font-black uppercase h-12">Next Sequence #</TableHead>
                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase h-12">Commit Changes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sequences.map((seq, idx) => (
                        <TableRow key={seq.id} className="hover:bg-muted/5 border-border transition-colors">
                            <TableCell className="pl-8 py-6">
                                <div className="flex flex-col">
                                    <span className="font-black text-foreground uppercase tracking-tight">{seq.documentType}</span>
                                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 italic">Auto-Increment System</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Input 
                                    className="w-32 h-11 rounded-xl bg-muted/20 border-border font-black text-primary uppercase text-center tracking-widest focus:ring-primary/20"
                                    value={seq.prefix}
                                    onChange={e => {
                                        const newSeqs = [...sequences];
                                        newSeqs[idx].prefix = e.target.value;
                                        setSequences(newSeqs);
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="number"
                                    className="w-40 h-11 rounded-xl bg-muted/20 border-border font-mono font-black text-lg focus:ring-primary/20"
                                    value={seq.nextNumber}
                                    onChange={e => {
                                        const newSeqs = [...sequences];
                                        newSeqs[idx].nextNumber = parseInt(e.target.value);
                                        setSequences(newSeqs);
                                    }}
                                />
                            </TableCell>
                            <TableCell className="text-right pr-8">
                                <Button 
                                    onClick={() => handleUpdate(seq)}
                                    disabled={isSaving === seq.id}
                                    className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase italic text-[10px] tracking-widest px-6 transition-all active:scale-95 shadow-lg"
                                >
                                    {isSaving === seq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Sync Module</>}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 space-y-4">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-blue-600 dark:text-blue-400">Pattern <span className="text-foreground">Recognition</span></h3>
              <p className="text-[11px] font-bold text-blue-800/60 dark:text-blue-200/60 leading-relaxed">
                  The system will automatically combine your Prefix with the Next Number. E.g., <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono font-black text-blue-600">SAL-10001</span>. This ensures non-sequential collisions across different business departments.
              </p>
          </div>
          <div className="p-8 bg-slate-950 rounded-[2rem] text-white space-y-4 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-40 w-40" /></div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter relative z-10 text-primary">Security <span className="text-white">Audit</span></h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest relative z-10 leading-loose">
                  Changes to sequence numbers are logged. Decreasing a sequence number may result in <span className="text-rose-400">Duplicate Entry Errors</span> if the number has already been utilized by a committed document.
              </p>
          </div>
      </div>
    </div>
  );
}
