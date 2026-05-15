"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Smartphone, Star, ShieldCheck, Zap, BarChart3, Users, Mail, MapPin, Phone, Check, Palette } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const pricingPlans = [
    { name: "Starter", price: "25,000", features: ["1 Branch", "Inventory", "Basic Reports", "1 Year Support"] },
    { name: "Business", price: "50,000", features: ["5 Branches", "Full ERP", "Advanced BI", "5 Years Support"], popular: true },
    { name: "Enterprise", price: "Custom", features: ["Unlimited Branches", "Custom Dev", "Dedicated Support", "API Access"] }
];

export default function HomePage() {
  const { setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black italic tracking-tighter">Mobile<span className="text-primary">ERP</span></span>
        </div>
        <div className="flex gap-4 items-center">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all">
                      <Palette className="h-5 w-5" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl p-2 border-border/50 bg-card">
                  <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-2 py-1.5">Switch Theme</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {['default', 'light', 'dark', 'ocean', 'forest', 'sunset', 'midnight'].map(theme => (
                      <DropdownMenuItem key={theme} onClick={() => setTheme(theme)} className="capitalize rounded-lg font-bold gap-2 focus:bg-primary focus:text-primary-foreground">
                          <div className={cn("h-2 w-2 rounded-full", `bg-${theme}-500`)} />
                          {theme}
                      </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/login"><Button variant="ghost" className="font-bold uppercase text-xs">Login</Button></Link>
            <Link href="/signup"><Button className="bg-primary hover:bg-primary/90 font-black rounded-full px-6">Get Started</Button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto mb-32">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-8">
            Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Inventory</span> like a Pro
          </h1>
          <p className="text-xl text-muted-foreground mb-12">The world's most trusted mobile shop ERP. Built for profit, reliability, and growth.</p>
          <Link href="/signup"><Button size="lg" className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-lg font-black uppercase shadow-2xl shadow-primary/20">Launch Your ERP Now</Button></Link>
        </motion.div>

        {/* Pricing Section */}
        <section className="mb-32">
            <h2 className="text-4xl font-black text-center mb-16 uppercase italic">Simple Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, i) => (
                    <div key={i} className={`p-8 rounded-[2rem] border ${plan.popular ? 'bg-card border-primary shadow-2xl' : 'bg-muted/30 border-border'}`}>
                        <h4 className="text-xl font-black mb-4">{plan.name}</h4>
                        <div className="text-4xl font-black mb-6">{plan.price !== "Custom" ? `৳${plan.price}` : "Custom"}</div>
                        <ul className="space-y-4 mb-8">
                            {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> {f}</li>)}
                        </ul>
                        <Link href="/signup"><Button className="w-full rounded-full bg-primary">Select Plan</Button></Link>
                    </div>
                ))}
            </div>
        </section>

        {/* Contact & Location */}
        <section className="mb-32 bg-card p-12 rounded-[2rem] border border-border shadow-lg">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-3xl font-black mb-6 italic">Get In Touch</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p className="flex items-center gap-3"><Mail className="text-primary" /> info@hisabplus.com</p>
                        <p className="flex items-center gap-3"><Phone className="text-primary" /> +880 1700-000000</p>
                        <p className="flex items-center gap-3"><MapPin className="text-primary" /> 123 Tech Park, Dhaka, Bangladesh</p>
                    </div>
                </div>
                <div>
                     <h2 className="text-3xl font-black mb-6 italic">Our Office</h2>
                     <div className="w-full h-48 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground font-black uppercase italic">Map Integration Placeholder</div>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border text-center text-muted-foreground text-sm">
        &copy; 2026 MobileERP System. All rights reserved.
      </footer>
    </div>
  );
}
