"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Search, AlertTriangle, CheckCircle2, FileText, Plus } from "lucide-react";
import { toast } from "@/lib/toast";

export default function StolenRegistryPage() {
  const [imei, setImei] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const [reportData, setReportData] = useState({
    imei1: "",
    imei2: "",
    brandModel: "",
    reporterName: "",
    reporterPhone: "",
    policeStation: "",
  });

  const handleCheck = async () => {
    if (!imei) return;
    setLoading(true);
    try {
      const result = await apiFetch(`/erp/stolen-check/${imei}`);
      setCheckResult(result);
    } catch (error: any) {
      toast.error("Check failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await apiFetch("/erp/stolen-report", {
        method: "POST",
        body: JSON.stringify(reportData),
      });
      toast.success("Device reported successfully! Claim ID: " + result.claimId);
      setShowReportForm(false);
    } catch (error: any) {
      toast.error("Report failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
          <ShieldAlert className="mr-3 h-10 w-10 text-destructive" /> Stolen IMEI Registry
        </h1>
        <p className="text-muted-foreground text-lg">Global database to report and check for stolen mobile devices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Check Device Status</CardTitle>
            <CardDescription>Enter an IMEI to see if it has been reported stolen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter IMEI 1 or 2..." 
                value={imei}
                onChange={(e) => setImei(e.target.value)}
              />
              <Button onClick={handleCheck} disabled={loading}>
                {loading ? "Checking..." : <><Search className="mr-2 h-4 w-4" /> Check</>}
              </Button>
            </div>

            {checkResult && (
              <div className={`p-4 rounded-lg border-2 ${checkResult.isStolen ? 'bg-destructive/10 border-destructive' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-start">
                  {checkResult.isStolen ? (
                    <AlertTriangle className="h-6 w-6 text-destructive mr-3 mt-1" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${checkResult.isStolen ? 'text-destructive' : 'text-green-800'}`}>
                      {checkResult.isStolen ? "STOLEN DEVICE DETECTED" : "Clean Device"}
                    </h3>
                    <p className="text-sm opacity-90">
                      {checkResult.isStolen ? checkResult.message : "This device is not in our stolen registry."}
                    </p>
                    {checkResult.isStolen && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Model:</strong> {checkResult.brandModel}</p>
                        <p><strong>Verification:</strong> {checkResult.isVerified ? "Verified by Authority" : "Pending Verification"}</p>
                        <p><strong>Contact Info:</strong> {checkResult.reporterPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Report Stolen Device</CardTitle>
            <CardDescription>Has your phone been stolen? Add it to the registry to prevent resale.</CardDescription>
          </CardHeader>
          <CardContent>
            {!showReportForm ? (
              <Button variant="outline" className="w-full py-12 border-dashed" onClick={() => setShowReportForm(true)}>
                <Plus className="mr-2 h-5 w-5" /> Start New Report
              </Button>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IMEI 1</Label>
                    <Input required value={reportData.imei1} onChange={e => setReportData({...reportData, imei1: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>IMEI 2 (Optional)</Label>
                    <Input value={reportData.imei2} onChange={e => setReportData({...reportData, imei2: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Brand & Model</Label>
                  <Input required placeholder="e.g. iPhone 15 Pro Max" value={reportData.brandModel} onChange={e => setReportData({...reportData, brandModel: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input required value={reportData.reporterName} onChange={e => setReportData({...reportData, reporterName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input required value={reportData.reporterPhone} onChange={e => setReportData({...reportData, reporterPhone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Police Station (GD Source)</Label>
                  <Input placeholder="e.g. Dhanmondi PS" value={reportData.policeStation} onChange={e => setReportData({...reportData, policeStation: e.target.value})} />
                </div>
                <div className="flex space-x-2 pt-2">
                   <Button type="submit" className="flex-1" disabled={loading}>Submit Report</Button>
                   <Button type="button" variant="ghost" onClick={() => setShowReportForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Why use the Registry?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="p-3 bg-slate-50 rounded">
            <p className="font-semibold text-foreground mb-1">Prevent Resale</p>
            Shops check this registry before buying used phones.
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="font-semibold text-foreground mb-1">Global Reach</p>
            Accessible by all tenants and the general public worldwide.
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="font-semibold text-foreground mb-1">Legal Support</p>
            Helps authorities track stolen property through verified GD reports.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
