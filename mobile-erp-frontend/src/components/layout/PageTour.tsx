"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

interface Step {
  target: string; // Selector for the element to highlight
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface PageTourProps {
  steps: Step[];
  isOpen: boolean;
  onClose: () => void;
}

export function PageTour({ steps, isOpen, onClose }: PageTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const updateRect = () => {
        const element = document.querySelector(steps[currentStep].target);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      updateRect();
      window.addEventListener('resize', updateRect);
      return () => window.removeEventListener('resize', updateRect);
    }
  }, [isOpen, currentStep, steps]);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentStep, steps.length]);

  if (!isOpen || !targetRect || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay Backdrop with Hole */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" style={{
        clipPath: `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
      }} onClick={onClose} />

      {/* Highlight Border */}
      <motion.div
        initial={false}
        animate={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
        className="absolute border-2 border-primary rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none z-[101]"
      />

      {/* Tooltip Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          top: targetRect.bottom + 20,
          left: Math.min(window.innerWidth - 340, Math.max(20, targetRect.left + (targetRect.width / 2) - 160))
        }}
        className="absolute w-80 bg-white rounded-3xl shadow-2xl p-6 pointer-events-auto z-[102]"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h4 className="text-lg font-black text-slate-900 mb-2">{step.title}</h4>
        <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">{step.content}</p>

        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="font-bold text-slate-400"
            disabled={currentStep === 0}
            onClick={handlePrev}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> {t('prev')}
          </Button>

          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentStep ? 'bg-primary w-4' : 'bg-slate-200'}`} />
            ))}
          </div>

          <Button 
            size="sm" 
            className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase italic tracking-widest rounded-xl"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {t('finish')}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {t('next')}
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
