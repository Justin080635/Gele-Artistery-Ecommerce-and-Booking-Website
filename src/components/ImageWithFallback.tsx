import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, ShoppingBag, User, BookOpen, Award, Image } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  referrerPolicy?: any;
  iconType?: 'crown' | 'sparkles' | 'bag' | 'user' | 'academy' | 'award' | 'image' | 'logo';
  fallbackText?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  iconType = 'image',
  fallbackText,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [showGuide, setShowGuide] = useState(() => {
    try {
      return localStorage.getItem('fg_image_guide') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleToggle = () => {
      try {
        setShowGuide(localStorage.getItem('fg_image_guide') === 'true');
      } catch {}
    };
    window.addEventListener('fg_toggle_image_guide', handleToggle);
    return () => window.removeEventListener('fg_toggle_image_guide', handleToggle);
  }, []);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const renderGuideOverlay = () => {
    if (!showGuide) return null;
    return (
      <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-25 pointer-events-auto border-2 border-dashed border-brand-gold/60 animate-fade-in select-none">
        <div className="bg-brand-gold/15 p-2 rounded-full mb-1.5 border border-brand-gold/30 text-brand-gold">
          {iconType === 'crown' && <Crown size={16} />}
          {iconType === 'sparkles' && <Sparkles size={16} />}
          {iconType === 'bag' && <ShoppingBag size={16} />}
          {iconType === 'user' && <User size={16} />}
          {iconType === 'academy' && <BookOpen size={16} />}
          {iconType === 'award' && <Award size={16} />}
          {iconType === 'image' && <Image size={16} />}
          {iconType === 'logo' && <Crown size={16} />}
        </div>
        <span className="text-[9px] font-mono tracking-wider text-brand-gold uppercase font-bold block leading-none">
          📷 Placeholder Image
        </span>
        <p className="text-brand-cream text-[10px] font-bold line-clamp-2 mt-1 uppercase max-w-[95%] leading-tight text-center">
          {alt || fallbackText || 'Image Asset'}
        </p>
        <span className="text-[8px] font-mono text-brand-gold/70 mt-1 block px-2 py-0.5 bg-brand-gold/5 rounded border border-brand-gold/10">
          Key/Tag: "{alt || fallbackText || 'N/A'}"
        </span>
      </div>
    );
  };

  if (hasError || !src) {
    // Beautiful cultural-infused fallback placeholder with luxurious gold & emerald colors
    return (
      <div 
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark via-[#0F2E1B] to-brand-primary overflow-hidden border border-brand-sage/20 text-center p-6 select-none ${className}`}
        style={{ contentVisibility: 'auto' }}
      >
        {/* Decorative African traditional line-art circles */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border-4 border-dashed border-brand-gold animate-spin-slow" />
          <div className="absolute w-36 h-36 rounded-full border border-double border-brand-gold" />
          <div className="absolute w-24 h-24 rounded-full border border-dotted border-brand-gold" />
        </div>

        {/* Small gold sparkle dots */}
        <div className="absolute top-4 left-4 text-brand-gold/30"><Sparkles size={14} /></div>
        <div className="absolute bottom-4 right-4 text-brand-gold/30"><Sparkles size={14} /></div>
        <div className="absolute top-1/4 right-8 text-brand-gold/20"><Sparkles size={12} /></div>
        <div className="absolute bottom-1/4 left-8 text-brand-gold/20"><Sparkles size={12} /></div>

        {/* Centered themed icon */}
        <div className="relative z-10 w-14 h-14 bg-brand-gold/10 border border-brand-gold/30 rounded-full flex items-center justify-center text-brand-gold mb-3 shadow-inner">
          {iconType === 'crown' && <Crown size={26} className="text-brand-gold" />}
          {iconType === 'sparkles' && <Sparkles size={26} className="text-brand-gold" />}
          {iconType === 'bag' && <ShoppingBag size={26} className="text-brand-gold" />}
          {iconType === 'user' && <User size={26} className="text-brand-gold" />}
          {iconType === 'academy' && <BookOpen size={26} className="text-brand-gold" />}
          {iconType === 'award' && <Award size={26} className="text-brand-gold" />}
          {iconType === 'image' && <Image size={26} className="text-brand-gold" />}
          {iconType === 'logo' && (
            <div className="font-serif font-bold text-lg text-brand-gold tracking-tighter">FG</div>
          )}
        </div>

        {/* Text information */}
        <div className="relative z-10 max-w-[85%]">
          <p className="font-serif font-bold text-brand-cream text-xs tracking-wide line-clamp-2 uppercase">
            {fallbackText || alt || 'Fabulous Gele Artistry'}
          </p>
          <span className="text-[9px] font-mono font-medium tracking-widest text-brand-gold uppercase block mt-1 opacity-75">
            Crowned with elegance
          </span>
        </div>

        {/* Guide Overlay on fallback card */}
        {renderGuideOverlay()}
      </div>
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        {...props}
      />
      {renderGuideOverlay()}
    </div>
  );
}
