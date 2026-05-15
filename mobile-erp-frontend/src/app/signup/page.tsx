"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Smartphone, CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BASE_URL } from "@/lib/api";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "Monthly";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    adminFullName: "",
    password: "",
    promoCode: "",
    planType: selectedPlan
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Account created! Check your email for OTP.");
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        const error = await response.text();
        toast.error(error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-5xl z-10"
      >
        <Card className="shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border-none rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
              
              {/* Left: Branding & Features (40%) */}
              <div className="lg:col-span-5 bg-card-foreground p-8 md:p-12 text-background flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20"></div>
                  
                  <div className="relative z-10">
                      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12">
                          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                              <Smartphone className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <span className="text-xl font-black tracking-tighter uppercase italic">Mobile<span className="text-primary">ERP</span></span>
                      </motion.div>

                      <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase italic leading-[1.1] mb-8 tracking-tighter">
                          Scale your <br /> 
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Inventory</span> <br /> 
                          faster.
                      </motion.h2>
                      
                      <motion.p variants={itemVariants} className="text-muted text-xs font-bold uppercase tracking-[0.2em] mb-12 max-w-xs">
                          The all-in-one distribution platform for mobile retailers.
                      </motion.p>
                      
                      <div className="space-y-8">
                          {[
                              { icon: ShieldCheck, title: "IMEI SECURITY", desc: "Automated fraud detection & tracking" },
                              { icon: Zap, title: "REAL-TIME SYNC", desc: "Instant stock updates across branches" },
                              { icon: Globe, title: "SaaS READY", desc: "Access your business from anywhere" },
                              { icon: Lock, title: "SECURE AUDIT", desc: "Full history of every transaction" }
                          ].map((item, i) => (
                              <motion.div key={i} variants={itemVariants} className="flex items-start gap-4 group">
                                  <div className="mt-1 bg-background/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                                      <item.icon className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-background mb-1">{item.title}</h4>
                                      <p className="text-[11px] font-medium text-muted">{item.desc}</p>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </div>

                  <motion.div variants={itemVariants} className="relative z-10 mt-12 pt-8 border-t border-background/10">
                      <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Configuration:</p>
                            <p className="text-lg font-black text-primary uppercase italic leading-none">{formData.planType} Professional</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[24px] font-black leading-none italic text-background">14<span className="text-xs ml-1 text-muted not-italic uppercase tracking-widest">Days Free</span></p>
                          </div>
                      </div>
                  </motion.div>
              </div>

              {/* Right: Form Section (60%) */}
              <div className="lg:col-span-7 p-8 md:p-16 bg-background flex flex-col justify-center">
                  <motion.div variants={itemVariants} className="mb-10">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-foreground mb-2">Initialize Account</h3>
                      <div className="h-1.5 w-12 bg-primary rounded-full"></div>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div variants={itemVariants} className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Business Identity</Label>
                              <Input 
                                required 
                                placeholder="Elite Mobile Ltd." 
                                className="h-14 rounded-2xl border-border bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-foreground" 
                                value={formData.companyName} 
                                onChange={e => setFormData({...formData, companyName: e.target.value})} 
                              />
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Global Phone</Label>
                              <Input 
                                required 
                                placeholder="+880..." 
                                className="h-14 rounded-2xl border-border bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-foreground" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                              />
                          </motion.div>
                      </div>

                      <motion.div variants={itemVariants} className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Admin Official Email</Label>
                          <Input 
                            required 
                            type="email" 
                            placeholder="admin@company.com" 
                            className="h-14 rounded-2xl border-border bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-foreground" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                          />
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div variants={itemVariants} className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Admin Full Name</Label>
                              <Input 
                                required 
                                placeholder="MD. Rashid Ali" 
                                className="h-14 rounded-2xl border-border bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-foreground" 
                                value={formData.adminFullName} 
                                onChange={e => setFormData({...formData, adminFullName: e.target.value})} 
                              />
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Secure Password</Label>
                              <Input 
                                required 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-14 rounded-2xl border-border bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-foreground" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                              />
                          </motion.div>
                      </div>

                      <motion.div variants={itemVariants} className="space-y-2 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 flex justify-between items-center">
                            <span>Reseller / Referral (Optional)</span>
                            <span className="bg-primary/20 text-[8px] px-1.5 py-0.5 rounded text-primary">VALIDATED ON SIGNUP</span>
                          </Label>
                          <Input 
                            placeholder="E.G. PARTNER2026" 
                            className="h-12 rounded-xl border-primary/20 bg-background/50 focus:bg-background font-black text-primary uppercase tracking-widest placeholder:text-primary/30" 
                            value={formData.promoCode} 
                            onChange={e => setFormData({...formData, promoCode: e.target.value})} 
                          />
                      </motion.div>

                      <motion.div variants={itemVariants} className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full h-16 bg-foreground hover:bg-foreground/90 text-background font-black uppercase italic tracking-widest rounded-2xl shadow-2xl transition-all active:scale-[0.98] group overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? "Deploying ERP Infrastructure..." : "Launch Network"} 
                                {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </Button>
                      </motion.div>
                      
                      <motion.p variants={itemVariants} className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-8">
                          Already have an instance? <Link href="/login" className="text-primary hover:text-primary/80 transition-colors border-b border-primary/20">Access Login</Link>
                      </motion.p>
                  </form>
              </div>
          </div>
        </Card>
        
        {/* Trust Footer */}
        <motion.div 
            variants={itemVariants}
            className="mt-8 flex flex-wrap justify-center gap-8 opacity-40 grayscale"
        >
            <div className="flex items-center gap-2 font-black uppercase italic text-xs">Trusted By 500+ Dealers</div>
            <div className="flex items-center gap-2 font-black uppercase italic text-xs">PCI DSS Compliant</div>
            <div className="flex items-center gap-2 font-black uppercase italic text-xs">256-bit Encryption</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black uppercase italic animate-pulse text-primary">Provisioning Environment...</div>}>
      <SignupContent />
    </Suspense>
  );
}
