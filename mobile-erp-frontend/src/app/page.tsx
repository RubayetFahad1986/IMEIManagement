"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Smartphone, ShieldCheck, Zap, BarChart3, Users, Star } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-blue-500">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse delay-700"></div>
      </div>

      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-black italic tracking-tighter">Mobile<span className="text-blue-500">ERP</span></span>
        </div>
        <div className="flex gap-4">
            <Link href="/login"><Button variant="ghost" className="font-bold uppercase tracking-widest text-xs">Login</Button></Link>
            <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs rounded-full px-6">Get Started</Button></Link>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="text-center max-w-4xl mx-auto">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Star className="h-4 w-4 text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">#1 Mobile Shop Management System</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black uppercase italic leading-[0.9] tracking-tighter mb-8">
            Dominate your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mobile Business</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-slate-400 font-bold max-w-2xl mx-auto mb-12">
            Complete ERP, IMEI tracking, and financial intelligence built specifically for mobile shop owners. One-time investment, lifetime growth.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <Link href="/signup"><Button size="lg" className="h-16 px-12 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-black uppercase italic tracking-widest shadow-2xl shadow-blue-500/20">Launch Now</Button></Link>
            <Button variant="outline" size="lg" className="h-16 px-12 rounded-full border-slate-800 bg-transparent text-lg font-black uppercase italic tracking-widest hover:bg-slate-900">View Demo</Button>
          </motion.div>
        </motion.div>

        {/* Pricing & Features Section */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-sm font-black uppercase italic text-slate-400 tracking-widest mb-4">One-Time Lifetime Investment</h3>
                    <div className="flex items-baseline gap-4 mb-2">
                        <span className="text-6xl font-black italic tracking-tighter">৳50,000</span>
                        <span className="text-xl font-bold text-slate-500 line-through">৳62,500</span>
                    </div>
                    <div className="bg-blue-600 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full w-fit">Save 20% Today</div>
                    <p className="text-slate-400 text-sm font-medium mt-6">Secure your business with 5 years of full support. No monthly subscriptions, no hidden fees. Just pure efficiency.</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} className="grid grid-cols-2 gap-6">
                {[
                    { icon: ShieldCheck, label: "IMEI Security" },
                    { icon: Zap, label: "Realtime Stock" },
                    { icon: BarChart3, label: "Financial BI" },
                    { icon: Users, label: "Reseller Network" }
                ].map((feat, i) => (
                    <div key={i} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center">
                        <feat.icon className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                        <p className="font-black uppercase italic text-xs tracking-widest">{feat.label}</p>
                    </div>
                ))}
            </motion.div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-slate-900 text-center">
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">&copy; 2026 MobileERP System. Built for Profit.</p>
      </footer>
    </div>
  );
}
