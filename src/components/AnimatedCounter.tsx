import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: string; // e.g. "1,200+" or "500+" or "5+"
  className?: string;
}

export default function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract the raw number, and any prefix or suffix
  // e.g. "1,200+" -> number: 1200, suffix: "+"
  const cleanNumber = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  
  // Find any suffix (like '+', '%', etc.)
  const suffix = value.replace(/[0-9,\s]/g, '');
  const hasComma = value.includes(',');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let start = 0;
    const end = cleanNumber;
    if (end === 0) return;

    const duration = 1500; // 1.5 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // Easing out quadratic function
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress); // easeOutQuad
      
      const currentVal = Math.round(easeProgress * end);
      setCount(currentVal);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [hasAnimated, cleanNumber]);

  // Format the current count
  const formattedCount = hasComma 
    ? count.toLocaleString() 
    : count.toString();

  return (
    <span ref={elementRef} className={className}>
      {formattedCount}
      {suffix}
    </span>
  );
}
