"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, ChevronRight, Info, Lightbulb, PlayCircle, MonitorPlay, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTour } from "./PageTour";
import { TOUR_STEPS } from "@/lib/tour-config";

export function HelpGuide() {
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Determine help key and tour steps based on path
  const getContext = () => {
    if (pathname.includes("/dashboard")) return { key: "dashboard_help", tour: "dashboard" };
    if (pathname.includes("/pos")) return { key: "pos_help", tour: "pos" };
    if (pathname.includes("/inventory")) return { key: "inventory_help", tour: "inventory" };
    if (pathname.includes("/sales")) return { key: "sales_help", tour: "sales" };
    if (pathname.includes("/purchases")) return { key: "purchases_help", tour: "purchases" };
    if (pathname.includes("/accounting")) return { key: "accounting_help", tour: "accounting" };
    if (pathname.includes("/contacts")) return { key: "contacts_help", tour: "contacts" };
    if (pathname.includes("/stolen")) return { key: "stolen_help", tour: "stolen" };
    if (pathname.includes("/settings")) return { key: "settings_help", tour: "settings" };
    return null;
  };

  const context = getContext();

  useEffect(() => {
    if (context?.key) {
        setShowNotification(true);
        const timer = setTimeout(() => setShowNotification(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [context?.key]);

  if (!context) return null;

  return (
    <>
      <div className={`fixed bottom-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} z-50 flex flex-col items-end gap-3`}>
        <AnimatePresence>
          {showNotification && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-primary text-white px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 mb-2 cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <Lightbulb className="h-4 w-4 text-amber-300" />
              {t('help_guide')} Available!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, transformOrigin: "bottom right" }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="mb-4"
            >
              <Card className="w-80 rounded-[2rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
                  <CardContent className="p-0">
                      <div className="bg-primary p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                              <Sparkles className="h-24 w-24" />
                          </div>
                          <div className="flex justify-between items-start mb-4 relative z-10">
                              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                  <HelpCircle className="h-6 w-6" />
                              </div>
                              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                                  <X className="h-5 w-5" />
                              </Button>
                          </div>
                          <h3 className="text-lg font-black uppercase tracking-tight leading-none relative z-10">{t('help_guide')}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1 relative z-10">{t('contextual_guideline')}</p>
                      </div>
                      <div className="p-6 space-y-6">
                          <div className="space-y-3">
                              <div className="flex items-center gap-2 text-primary">
                                  <Info className="h-4 w-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{t('how_to_use')}</span>
                              </div>
                              <p className="text-sm font-bold text-slate-300 leading-relaxed">
                                  {t(context.key)}
                              </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                              <Button 
                                onClick={() => { setShowTour(true); setIsOpen(false); }}
                                className="bg-white text-slate-900 hover:bg-slate-100 font-black uppercase italic tracking-widest rounded-xl h-14 flex flex-col items-center justify-center gap-1"
                              >
                                  <PlayCircle className="h-5 w-5 text-primary" />
                                  <span className="text-[8px]">{t('start_tour')}</span>
                              </Button>
                              <Button 
                                onClick={() => setShowDemo(true)}
                                className="bg-slate-800 text-white hover:bg-slate-700 font-black uppercase italic tracking-widest rounded-xl h-14 flex flex-col items-center justify-center gap-1"
                              >
                                  <MonitorPlay className="h-5 w-5 text-amber-400" />
                                  <span className="text-[8px]">{t('animated_demo')}</span>
                              </Button>
                          </div>
                      </div>
                  </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Button 
          size="icon" 
          className={`h-14 w-14 rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center transition-all ${isOpen ? 'rotate-90 bg-slate-200 text-slate-900' : 'bg-primary text-white hover:scale-110'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <HelpCircle className="h-7 w-7" />}
        </Button>
      </div>

      <PageTour 
        steps={TOUR_STEPS[context.tour || ''] || []} 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />

      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 w-full max-w-4xl aspect-video rounded-3xl overflow-hidden relative shadow-2xl border border-white/10"
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="bg-primary/20 p-8 rounded-full mb-6"
                    >
                        <MonitorPlay className="h-16 w-16 text-primary" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                        {t('animated_demo')}
                    </h2>
                    <p className="text-slate-400 font-bold max-w-md">
                        {t(context.key)}
                        <br /><br />
                        <span className="text-primary uppercase text-[10px] tracking-widest">Interactive simulation is loading...</span>
                    </p>

                    <div className="mt-12 flex gap-4">
                        <Button onClick={() => setShowDemo(false)} className="bg-white text-slate-900 hover:bg-slate-100 font-black px-8 rounded-xl h-12 uppercase italic tracking-widest">
                            {t('finish')}
                        </Button>
                    </div>
                </div>

                {/* Simulated UI elements for animation */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-800">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="h-full bg-primary"
                    />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
