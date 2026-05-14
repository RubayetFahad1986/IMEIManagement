"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, ShieldCheck, BarChart4, Users, Zap, Globe, 
  ChevronRight, CheckCircle2, Star, Mail, Phone, MapPin,
  Package, LayoutDashboard, ShoppingCart, Wallet, Landmark, ShieldAlert, Repeat, Contact
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] opacity-60 animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-b shadow-sm py-4" : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Dominate <span className="text-blue-600">ERP</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Solutions", "Pricing", "Support"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors">Login</Link>
            <Link 
              href="/signup"
              className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 text-white rounded-full px-8 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100")}
            >
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="bg-blue-50 text-blue-600 border-blue-100 mb-6 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Next-Gen Inventory Intelligence</Badge>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8 uppercase italic">
            Command Your <br />
            <span className="text-blue-600">Mobile Empire</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium mb-12 leading-relaxed">
            The ultimate ERP solution engineered for mobile retailers and distributors. Track IMEIs, manage multi-branch inventory, and automate financial settlements in one high-performance interface.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Link 
              href="/signup"
              className={cn(buttonVariants({ variant: "default" }), "h-16 px-10 bg-blue-600 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-105 transition-transform flex items-center justify-center")}
            >
              Start Free Trial
            </Link>
            <Link 
              href="/stolen-check"
              className={cn(buttonVariants({ variant: "outline" }), "h-16 px-10 border-2 border-slate-900 rounded-2xl text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all")}
            >
              <ShieldAlert className="mr-2 h-4 w-4" /> Public IMEI Check
            </Link>
          </div>
          
          <div className="mt-20 relative">
             <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-40 bottom-0"></div>
             <div className="bg-slate-900 rounded-[3rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-slate-800 rotate-1 transform-gpu">
                <img src="https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop" alt="ERP Dashboard" className="rounded-[2.5rem] w-full h-[600px] object-cover opacity-80" />
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-none uppercase italic tracking-tighter mb-6">
                Built for the <br /> <span className="text-blue-600">Mobile Industry</span>
              </h2>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Every tool you need to scale from one shop to a global chain.</p>
            </div>
            <div className="flex gap-4">
               <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border"><Zap className="text-blue-600" /></div>
               <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border"><ShieldCheck className="text-emerald-600" /></div>
               <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border"><Globe className="text-orange-600" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "IMEI Intelligence", desc: "Scan, track, and audit every single device by IMEI1, IMEI2 or Serial Number with zero errors.", icon: Smartphone, color: "text-blue-600", href: "/signup" },
              { title: "Multi-Branch Flow", desc: "Seamlessly transfer stock between branches with automated transit tracking and verification.", icon: Repeat, color: "text-purple-600", href: "/signup" },
              { title: "Smart POS", desc: "Lightning fast sales interface with support for exchange, partial payments, and digital receipts.", icon: ShoppingCart, color: "text-emerald-600", href: "/signup" },
              { title: "Contact Ledgers", desc: "Full 360-degree audit trail for every customer and supplier with automated due calculation.", icon: Contact, color: "text-orange-600", href: "/signup" },
              { title: "Advanced Finance", desc: "Automated double-entry accounting with real-time balance sheets and expense vouchers.", icon: Landmark, color: "text-rose-600", href: "/signup" },
              { title: "Anti-Theft Registry", desc: "Integrated stolen device registry to protect your shop from fraudulent inventory.", icon: ShieldAlert, color: "text-indigo-600", href: "/stolen-check" }
            ].map((f, i) => (
              <Link key={i} href={f.href}>
                <Card className="group border-none shadow-xl rounded-[2.5rem] p-10 hover:bg-slate-900 hover:text-white transition-all duration-500 cursor-pointer h-full">
                  <CardContent className="p-0">
                    <div className={`h-16 w-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors`}>
                      <f.icon className={`h-8 w-8 ${f.color} group-hover:text-white`} />
                    </div>
                    <h3 className="text-xl font-black uppercase italic mb-4">{f.title}</h3>
                    <p className="text-sm font-medium leading-relaxed opacity-60">{f.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
             <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Precision <span className="text-blue-600">Pricing</span></h2>
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Choose the plan that fits your growth trajectory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { plan: "Monthly", price: "৳2,500", desc: "Perfect for single shops", period: "/ mo", color: "bg-white" },
              { plan: "Quarterly", price: "৳6,500", desc: "Popular for growing startups", period: "/ 3 mo", color: "bg-white", popular: true },
              { plan: "Half-Yearly", price: "৳12,000", desc: "Best for established retailers", period: "/ 6 mo", color: "bg-white" },
              { plan: "Yearly", price: "৳22,000", desc: "Full power for enterprise", period: "/ 12 mo", color: "bg-slate-900", text: "text-white" }
            ].map((p, i) => (
              <div key={i} className={`relative p-10 rounded-[3rem] border-2 ${p.popular ? 'border-blue-600 shadow-2xl' : 'border-slate-100'} ${p.color} ${p.text || 'text-slate-900'} transition-transform hover:-translate-y-2`}>
                {p.popular && <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white uppercase font-black px-6 py-1 rounded-full">Most Selected</Badge>}
                <h3 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">{p.plan}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-xs font-bold opacity-40 uppercase">{p.period}</span>
                </div>
                <p className="text-[10px] font-bold uppercase mb-8 opacity-60">{p.desc}</p>
                <div className="space-y-4 mb-10">
                   {["Unlimited IMEIs", "Up to 3 Branches", "Contact Ledgers", "Mobile POS App", "WhatsApp Alerts"].map(feat => (
                     <div key={feat} className="flex items-center gap-3">
                        <CheckCircle2 className={`h-4 w-4 ${p.text ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{feat}</span>
                     </div>
                   ))}
                </div>
                <Link 
                  href={`/signup?plan=${p.plan}`}
                  className={cn(buttonVariants({ variant: "default" }), "w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center shadow-xl", p.text ? "bg-blue-600" : "bg-slate-900", "text-white")}
                >
                    Subscribe Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="support" className="py-32 px-6 bg-slate-900 text-white rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
          <div className="flex-1">
             <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none">Ready to <br /><span className="text-blue-500">Dominate?</span></h2>
             <p className="text-slate-400 font-medium text-lg leading-relaxed mb-12">Our engineering team is ready to help you migrate your data and set up your multi-branch network within 24 hours.</p>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"><Phone className="text-blue-500 h-5 w-5" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Direct Hotline</p>
                      <p className="text-lg font-black italic">+880 1700-000000</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"><Mail className="text-emerald-500 h-5 w-5" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Inquiry Email</p>
                      <p className="text-lg font-black italic">hello@dominateerp.com</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"><MapPin className="text-orange-500 h-5 w-5" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">HQ Office</p>
                      <p className="text-lg font-black italic">Banani, Dhaka - 1213, Bangladesh</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl">
             <h3 className="text-xl font-black uppercase italic mb-8">Send a Message</h3>
             <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Your Name</label>
                      <input className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-blue-500 transition-colors" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Business Phone</label>
                      <input className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-blue-500 transition-colors" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Requirements / Notes</label>
                   <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 focus:outline-none focus:border-blue-500 transition-colors" placeholder="Tell us about your shop..."></textarea>
                </div>
                <Button className="w-full h-16 bg-blue-600 rounded-2xl font-black uppercase tracking-widest italic shadow-2xl shadow-blue-900/50">Submit Request</Button>
             </form>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-32 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 grayscale opacity-50">
              <Smartphone className="h-6 w-6 text-white" />
              <span className="text-xl font-black uppercase italic tracking-tighter">Dominate <span className="text-blue-500">ERP</span></span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 text-center">Engineered by Dominate Software Solution © 2026</p>
           <div className="flex gap-8">
              {["Terms", "Privacy", "Cookies"].map(item => (
                <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">{item}</Link>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}

// Icons imported from lucide-react above

