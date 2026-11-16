import React, { useState } from 'react';
import { Star, Play, X, Quote, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [activeVideo, setActiveVideo] = useState<Testimonial | null>(null);

  return (
    <div className="space-y-8">
      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => {
          if (t.isVideo) {
            return (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-brand-dark rounded-2xl overflow-hidden shadow-md group relative aspect-[4/5] flex flex-col justify-between"
              >
                {/* Background Video Thumbnail */}
                <ImageWithFallback 
                  src={t.videoThumbnail || t.image} 
                  alt={t.name}
                  iconType="user"
                  className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
                <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-brand-dark/30 transition-colors" />

                {/* Top Badge */}
                <div className="relative p-4 flex justify-between items-start">
                  <span className="bg-brand-gold text-brand-dark text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                    Video Review
                  </span>
                  <div className="flex text-brand-gold bg-brand-dark/60 backdrop-blur-sm px-2 py-1 rounded-full">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={11} className="fill-brand-gold stroke-brand-gold" />
                    ))}
                  </div>
                </div>

                {/* Center Play Button */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveVideo(t)}
                  className="relative self-center w-16 h-16 bg-brand-gold text-brand-dark rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:bg-brand-cream group-hover:text-brand-primary cursor-pointer"
                  title="Play video testimonial"
                >
                  <Play size={24} className="fill-current ml-1" />
                </motion.button>

                {/* Bottom details */}
                <div className="relative p-5 text-white">
                  <p className="text-xs text-brand-silver font-semibold tracking-wide flex items-center gap-1 mb-1">
                    <CheckCircle size={12} className="text-brand-gold fill-brand-gold stroke-brand-dark" />
                    {t.role}
                  </p>
                  <h4 className="text-lg font-serif font-bold text-brand-cream">{t.name}</h4>
                  <p className="text-xs text-brand-silver/90 italic mt-1 line-clamp-2">
                    "Click to watch my transformation styling and reaction!"
                  </p>
                </div>
              </motion.div>
            );
          }

          // Regular Text Testimonial
          return (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl border border-brand-sage/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Subtle gold brand line-art or quote marks in background */}
              <Quote className="absolute -top-2 -right-2 text-brand-sage/10 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform duration-300" />
              
              <div className="relative">
                <div className="flex text-brand-gold gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-gold stroke-brand-gold" />
                  ))}
                </div>

                <p className="text-brand-dark text-sm leading-relaxed italic mb-6 relative">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 relative border-t border-brand-sage/10 pt-4">
                <ImageWithFallback 
                  src={t.image} 
                  alt={t.name}
                  iconType="user"
                  className="w-12 h-12 rounded-full object-cover border border-brand-sage/30 shadow-inner"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-serif font-bold text-brand-dark text-sm">{t.name}</h4>
                  <p className="text-[11px] text-brand-slate font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Video Testimonial Lightbox Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/95 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setActiveVideo(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-black rounded-2xl overflow-hidden max-w-lg w-full aspect-[9/16] shadow-2xl z-10 border border-brand-sage/20"
            >
              {/* Close button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-brand-dark/60 text-white hover:bg-brand-primary rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Video Container */}
              <div className="w-full h-full flex flex-col bg-brand-dark">
                {/* Fake styling metadata on screen for real video look */}
                <div className="absolute top-4 left-4 z-20 text-white/95 text-xs drop-shadow-md">
                  <p className="font-serif italic font-bold text-brand-gold">Fabulous Gele Artistry</p>
                  <p className="text-[10px] opacity-75">{activeVideo.name} — Review</p>
                </div>

                <video
                  src={activeVideo.videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                >
                  Your browser does not support the video tag.
                </video>

                {/* Video Bottom overlay */}
                <div className="absolute bottom-16 left-4 right-4 z-10 text-white text-xs drop-shadow bg-black/40 p-3 rounded-lg backdrop-blur-xs border border-white/5">
                  <p className="font-bold text-brand-gold">{activeVideo.role}</p>
                  <p className="opacity-90 mt-1">
                    "The absolute best gele wrap experience in Oyo State! Extremely comfortable and professional service."
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
