import React, { useState, useEffect } from 'react';
import { X, Sparkles, Flame, Volume2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PromoBanner } from '../types';

interface PromoStripProps {
  banner: PromoBanner;
  onCTAClick?: (actionType?: string) => void;
}

export default function PromoStrip({ banner, onCTAClick }: PromoStripProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const slides = [
    {
      text: banner.text || "🌟 PROFESSIONAL MASTERCLASS: Register for the 2-Week Intensive in Ibadan. Early bird ₦15,000 (Reg. ₦25,000)!",
      linkText: banner.linkText || "Register Now",
      actionType: "academy",
      icon: <Sparkles size={14} className="fill-brand-dark stroke-brand-dark animate-bounce text-brand-dark shrink-0" />
    },
    {
      text: "👑 LUXURY BRIDAL STYLING: Dates are booking fast for 2026/2027 weddings. Secure Oyo State’s top gele artisan!",
      linkText: "Book Styling",
      actionType: "bridal",
      icon: <Flame size={14} className="text-brand-dark fill-brand-dark shrink-0 animate-pulse" />
    },
    {
      text: "📦 BOUTIQUE AUTO GELES: Beautiful pre-woven, comfortable, fully adjustable crowns shipped worldwide.",
      linkText: "Shop Collection",
      actionType: "shop",
      icon: <Trophy size={14} className="text-brand-dark shrink-0" />
    },
    {
      text: "✨ MASTER MODERN FOLDS: Learn standard 5-row Infinity Pleats, Millionaire Folds, Fan, and Rose designs.",
      linkText: "Learn Academy",
      actionType: "academy",
      icon: <Sparkles size={14} className="text-brand-dark shrink-0" />
    }
  ];

  // Auto slide rotation every 6 seconds
  useEffect(() => {
    if (!banner.isActive || !isVisible) return;
    const interval = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banner.isActive, isVisible, slides.length]);

  if (!banner.isActive || !isVisible) return null;

  const currentSlide = slides[currentSlideIdx] || slides[0];

  return (
    <div className="bg-brand-gold text-brand-dark px-4 py-2 relative flex items-center justify-center min-h-[40px] shadow-md z-40 overflow-hidden select-none border-b border-brand-gold/20">
      {/* Decorative luxury gold glitter background effect */}
      <div className="absolute inset-0 bg-radial-gradient(circle_at_center, rgba(255,255,255,0.15)_0%, transparent_80%)" />
      
      <div className="flex items-center justify-center w-full max-w-5xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center text-xs font-semibold leading-normal"
          >
            <div className="flex items-center gap-1.5 justify-center">
              {currentSlide.icon}
              <span className="tracking-wide text-[11px] sm:text-xs">
                {currentSlide.text}
              </span>
            </div>
            {currentSlide.linkText && (
              <button 
                type="button"
                onClick={() => onCTAClick?.(currentSlide.actionType)}
                className="underline sm:ml-1.5 hover:text-white transition-colors font-black cursor-pointer shrink-0 text-[11px] sm:text-xs inline-flex items-center gap-0.5 whitespace-nowrap"
              >
                {currentSlide.linkText} →
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Close button with visual touch pad */}
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 text-brand-dark/70 hover:text-brand-dark hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
