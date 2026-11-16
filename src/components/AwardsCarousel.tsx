import React, { useState, useEffect, useRef } from 'react';
import { Award, Crown, Star, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface AwardItem {
  name: string;
  authority: string;
  year: string;
  desc: string;
}

interface AwardsCarouselProps {
  awards: AwardItem[];
}

export default function AwardsCarousel({ awards }: AwardsCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Repeat awards array to allow smooth infinite loop scrolling
  const displayAwards = [...awards, ...awards, ...awards, ...awards];

  const icons = [
    <Crown key="crown" size={24} className="text-brand-gold shrink-0" />,
    <Award key="award" size={24} className="text-brand-gold shrink-0" />,
    <Star key="star" size={24} className="text-brand-gold shrink-0" />
  ];

  // Auto-scroll logic moving continuously to the right
  useEffect(() => {
    let lastTime: number | null = null;
    const speed = 0.045; // Pixels per millisecond (slow & elegant)

    const step = (time: number) => {
      if (lastTime !== null && !isPaused && containerRef.current) {
        const delta = time - lastTime;
        setScrollPos((prev) => {
          const newPos = prev + delta * speed;
          // Loop smoothly when pos exceeds width of one original set of awards
          const maxSingleWidth = containerRef.current ? containerRef.current.scrollWidth / 4 : 1000;
          return newPos % maxSingleWidth;
        });
      }
      lastTime = time;
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const handlePauseStart = () => setIsPaused(true);
  const handlePauseEnd = () => setIsPaused(false);

  const scrollManual = (direction: 'left' | 'right') => {
    setScrollPos((prev) => {
      const delta = direction === 'left' ? -320 : 320;
      const newPos = prev + delta;
      return newPos < 0 ? 0 : newPos;
    });
  };

  return (
    <div className="relative w-full">
      {/* Top Controller Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[11px] font-medium">
            {isPaused ? (
              <>
                <Pause size={12} className="text-brand-gold animate-pulse" />
                <span>Paused (Click & Hold)</span>
              </>
            ) : (
              <>
                <Play size={12} className="text-brand-gold animate-spin" style={{ animationDuration: '4s' }} />
                <span>Auto-sliding Right</span>
              </>
            )}
          </span>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollManual('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-brand-gold/20 text-brand-gold transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollManual('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-brand-gold/20 text-brand-gold transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Overflow Carousel Viewport */}
      <div
        className="overflow-hidden relative py-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handlePauseStart}
        onMouseUp={handlePauseEnd}
        onMouseLeave={handlePauseEnd}
        onTouchStart={handlePauseStart}
        onTouchEnd={handlePauseEnd}
      >
        <div
          ref={containerRef}
          className="flex gap-6 transition-transform duration-75 ease-linear"
          style={{
            transform: `translateX(-${scrollPos}px)`,
          }}
        >
          {displayAwards.map((award, i) => {
            const iconIndex = i % awards.length;
            return (
              <div
                key={i}
                className="w-[300px] sm:w-[360px] shrink-0 relative group bg-white/[0.03] hover:bg-white/[0.06] border border-brand-gold/20 hover:border-brand-gold/60 rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(197,160,89,0.12)] flex flex-col justify-between"
              >
                {/* Year Badge */}
                <div className="absolute top-6 right-6 font-mono text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full border border-brand-gold/20">
                  {award.year}
                </div>

                <div>
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/25 mb-5 group-hover:scale-105 transition-transform duration-300">
                    {icons[iconIndex] || <Award size={24} className="text-brand-gold" />}
                  </div>

                  <h3 className="font-serif font-black text-white text-base leading-snug group-hover:text-brand-gold transition-colors duration-200">
                    {award.name}
                  </h3>

                  <p className="text-brand-silver text-xs leading-relaxed mt-2.5 font-sans">
                    {award.desc}
                  </p>
                </div>

                <div className="border-t border-brand-gold/10 pt-4 mt-5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  <p className="font-mono text-[9px] uppercase tracking-wider text-brand-gold/80 font-semibold">
                    Conferred by {award.authority}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="text-[11px] text-brand-silver/70 text-center mt-4 font-sans">
        💡 Tip: Click and hold (or press on touch screens) on any card to pause auto-scroll.
      </p>
    </div>
  );
}
