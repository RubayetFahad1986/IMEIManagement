"use client";

import { motion } from "framer-motion";
import { Smartphone, ShieldCheck, ShoppingCart, Truck, Wallet, BarChart3, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    { title: "IMEI Management", desc: "Advanced IMEI management for mobile", icon: <Smartphone className="h-6 w-6" /> },
    { title: "Warranty Claims", desc: "Seamless IMEI warranty claim & tracking", icon: <ShieldCheck className="h-6 w-6" /> },
    { title: "Stock Management", desc: "Real-time stock & inventory control", icon: <ShoppingCart className="h-6 w-6" /> },
    { title: "IMEI Wise Profit", desc: "Track exact profit per device via IMEI", icon: <Wallet className="h-6 w-6" /> },
    { title: "Reselling Feature", desc: "Advanced tools for wholesale & reselling", icon: <Truck className="h-6 w-6" /> },
    { title: "Global Intel", desc: "Analytics for your mobile management shop", icon: <BarChart3 className="h-6 w-6" /> },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Animated Gradient Background */}
      <motion.div 
        className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)]"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <main className="relative z-10 container mx-auto px-6 pt-20 flex flex-col items-center">
        {/* Hero */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 text-center"
        >
          MOBILE<span className="text-blue-500">ERP</span>
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl font-semibold text-blue-400 mb-4 text-center max-w-3xl"
        >
          World-Class Mobile Management Shop Software
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base text-slate-300 mb-6 max-w-3xl text-center leading-relaxed"
        >
          Master your business with advanced IMEI management for mobile, comprehensive warranty management, fast IMEI warranty claims, exact IMEI-wise profit tracking, robust stock control, and powerful reselling features.
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-slate-500 mb-16 max-w-4xl text-center font-medium"
        >
          Serving mobile retailers and wholesalers worldwide. Strongly established in <span className="text-blue-400/80">Bangladesh (Dhaka, Chittagong)</span>, <span className="text-blue-400/80">Dubai</span>, <span className="text-blue-400/80">Oman</span>, and <span className="text-blue-400/80">Saudi Arabia</span>.
        </motion.p>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <div className="mb-4 text-blue-400 p-3 bg-blue-500/10 rounded-2xl">{feat.icon}</div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-1">{feat.title}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 mb-20"
        >
          <Link href="/login" className="bg-blue-600 text-white font-black uppercase px-12 py-5 rounded-full tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">
            Launch Terminal
          </Link>
        </motion.div>

        {/* Footer Info */}
        <footer className="w-full border-t border-white/5 pt-12 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left text-slate-500">
            <div>
                <h4 className="text-white font-black uppercase tracking-widest mb-4">Contact</h4>
                <p className="flex items-center justify-center md:justify-start gap-2 mb-2"><Mail size={14} /> info@hisabplus.com</p>
                <p className="flex items-center justify-center md:justify-start gap-2 mb-2"><Phone size={14} /> +880 1700-000000</p>
            </div>
            <div>
                <h4 className="text-white font-black uppercase tracking-widest mb-4">Location</h4>
                <p className="flex items-center justify-center md:justify-start gap-2"><MapPin size={14} /> 123 Tech Park, Dhaka, BD</p>
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 MobileERP System. Built for Profit.</p>
            </div>
        </footer>
      </main>
    </div>
  );
}
