import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: {
      fabulous: 'text-xl tracking-tight',
      gele: 'text-[9px] tracking-[0.25em]',
      star: 12
    },
    md: {
      fabulous: 'text-2xl sm:text-3xl tracking-tight',
      gele: 'text-[10px] sm:text-[11px] tracking-[0.3em]',
      star: 14
    },
    lg: {
      fabulous: 'text-4xl sm:text-5xl tracking-tighter',
      gele: 'text-xs sm:text-sm tracking-[0.4em]',
      star: 18
    }
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none font-serif ${className}`}>
      <div className="relative flex items-center justify-center">
        <span className={`font-bold italic text-brand-cream font-serif leading-none ${selectedSize.fabulous}`}>
          Fabulous
        </span>
        <Sparkles 
          size={selectedSize.star} 
          className="text-brand-gold fill-brand-gold absolute -top-1 -right-4 animate-pulse" 
        />
      </div>
      <span className={`text-brand-gold font-sans font-semibold uppercase mt-0.5 leading-none ${selectedSize.gele}`}>
        GELE ARTISTRY
      </span>
    </div>
  );
}
