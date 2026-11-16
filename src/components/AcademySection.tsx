import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Calendar, Clock, MapPin, Users, Sparkles, Check, 
  CheckCircle, Gift, Award, ArrowRight, ShieldCheck, Star, Zap,
  BookOpen, ChevronRight, MessageCircle, AlertTriangle
} from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface AcademySectionProps {
  onRegister: (tierName?: string) => void;
}

const ACADEMY_GALLERY_IMAGES = [
  {
    src: '/src/assets/images/gele_by_him_1784695959540.jpg',
    alt: 'GELE by Him - 2 Weeks Gele Training Masterclass Poster',
    badge: 'GELE by Him'
  },
  {
    src: '/src/assets/images/academy_flyer_1784637074409.jpg',
    alt: 'Fabulous Gele Academy Professional 2-Week Masterclass Flyer',
    badge: 'Official Flyer'
  },
  {
    src: '/src/assets/images/tutor_teaching_blue_1784637098304.jpg',
    alt: 'Physical Hands-on Training Session with Tutor (Blue Gele)',
    badge: 'Tutor in Action'
  },
  {
    src: '/src/assets/images/tutor_teaching_green_1784637134935.jpg',
    alt: 'Artisan Gele Wrapping Techniques Training (Green Gele)',
    badge: 'Step-by-Step'
  },
  {
    src: '/src/assets/images/tutor_and_models_1784637118947.jpg',
    alt: 'Masterclass Finished Models Showcase',
    badge: 'Student Success'
  }
];

export default function AcademySection({ onRegister }: AcademySectionProps) {
  const [activeWeekTab, setActiveWeekTab] = useState<'week1' | 'week2'>('week1');
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0);

  return (
    <div className="space-y-16 py-8 font-sans">
      
      {/* 1. HERO BRANDING & COHORT BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden bg-brand-dark text-white border border-brand-gold/30 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent z-10" />
        <ImageWithFallback 
          src="/src/assets/images/tutor_and_models_1784637118947.jpg" 
          alt="Fabulous Gele Academy Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />

        <div className="relative z-20 p-6 sm:p-12 lg:p-16 max-w-4xl text-left">
          
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-gold text-brand-dark uppercase tracking-widest shadow-md">
              <GraduationCap size={15} />
              <span>Physical Training Institute</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-brand-gold border border-brand-gold/30 backdrop-blur-md">
              <Sparkles size={13} className="text-brand-gold animate-pulse" />
              <span>Enrolling: Cohort 003</span>
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight mb-4"
          >
            FABULOUS GELE ACADEMY
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-brand-gold text-base sm:text-xl font-serif italic mb-6"
          >
            Professional Gele Training Institute • Ibadan, Nigeria
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm sm:text-base text-brand-silver max-w-2xl leading-relaxed mb-8"
          >
            Empowering the next generation of creative beauty entrepreneurs. From foundational hand grip mechanics to high-ticket celebrity bridal styling and business monetization.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegister('Tier 3 – Professional Cohort (Elite)')}
              className="px-8 py-4 bg-brand-primary text-white font-bold text-sm uppercase tracking-wider rounded-full shadow-lg hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span>Pre-Register for Next Cohort</span>
              <ArrowRight size={18} />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="https://wa.me/2348162067064?text=Hello%20Fabulous%20Gele%20Academy!%20I%20would%20like%20to%20inquire%20about%20the%20upcoming%20training%20cohort."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <MessageCircle size={18} className="text-green-400" />
              <span>Ask Questions on WhatsApp</span>
            </motion.a>
          </motion.div>

        </div>
      </motion.div>

      {/* 2. TRAINING FORMAT HIGHLIGHTS GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-sage/20 shadow-sm text-left"
      >
        <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">Structure & Modality</h3>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-6">Training Format & Schedule</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {[
            { icon: <Calendar size={20} />, label: 'Duration', val: '2-Week Intensive', sub: 'Cohort-Based System' },
            { icon: <Clock size={20} />, label: 'Schedule', val: 'Mon, Wed & Fri', sub: '3–4 hours per session' },
            { icon: <MapPin size={20} />, label: 'Mode', val: 'Physical Classes', sub: 'Studio in Ibadan' },
            { icon: <Users size={20} />, label: 'Class Size', val: 'Limited Seats', sub: '10–20 Students/Batch' },
            { icon: <Award size={20} />, label: 'Certification', val: 'Official Letter', sub: 'Certificate & Alumni ID', highlight: true }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl flex items-start gap-3 ${
                item.highlight 
                  ? 'bg-brand-gold/10 border border-brand-gold/30' 
                  : 'bg-brand-cream/60 border border-brand-sage/15'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                item.highlight ? 'bg-brand-gold/20 text-brand-dark' : 'bg-brand-primary/10 text-brand-primary'
              }`}>
                {item.icon}
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  item.highlight ? 'text-brand-primary' : 'text-brand-slate'
                }`}>{item.label}</span>
                <span className="font-serif font-bold text-brand-dark text-sm">{item.val}</span>
                <p className={`text-[11px] mt-0.5 ${item.highlight ? 'text-brand-dark/80' : 'text-brand-slate'}`}>{item.sub}</p>
              </div>
            </motion.div>
          ))}

        </div>
      </motion.div>

      {/* 3. EARLY BIRD SPECIAL OFFER BANNER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-amber-500 via-brand-gold to-yellow-500 rounded-3xl p-6 sm:p-8 text-brand-dark shadow-xl relative overflow-hidden text-left border border-amber-300"
      >
        <div className="absolute -right-8 -bottom-8 opacity-10 text-brand-dark pointer-events-none">
          <Gift size={220} />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-dark text-brand-gold rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            <Zap size={14} className="fill-brand-gold" />
            <span>Early Registration Perk</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-2">
            Save ₦10,000 With Our Early Bird Discount!
          </h3>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/90 leading-relaxed mb-6">
            Students who register and confirm their tuition at least <strong>two weeks before the cohort launch</strong> date unlock these exclusive early bird bonuses:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { main: '₦10,000 Off', sub: 'Tuition Discount' },
              { main: 'Free Printed', sub: 'Training Manual' },
              { main: 'Free Practice', sub: 'Fabric Material Kit' },
              { main: 'Priority Seating', sub: 'Front-Row Practical Access' }
            ].map((perk, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/60 shadow-xs"
              >
                <span className="font-bold text-brand-primary text-sm block">{perk.main}</span>
                <span className="text-xs text-brand-dark">{perk.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. FOUR TRAINING TIERS */}
      <div className="text-left space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Select Your Cohort Tier</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark">Training Tiers & Curriculum Scope</h2>
          <p className="text-sm text-brand-slate mt-1 max-w-2xl">
            Choose the tier tailored to your experience level. Each cohort is structured for maximum practical hands-on mastery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* TIER 1 – BEGINNER COHORT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl p-6 border border-brand-sage/20 shadow-md flex flex-col justify-between hover:border-brand-primary/40 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
                  Tier 1
                </span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Early: ₦20,000
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-brand-dark mb-1">BEGINNER COHORT</h3>
              <p className="text-xs text-brand-slate mb-4 italic">For starters with little or no prior experience</p>

              <div className="mb-6 pb-4 border-b border-brand-sage/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-brand-dark">₦30,000</span>
                  <span className="text-xs text-brand-slate font-sans">/ tuition</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wider text-[10px]">What You'll Learn:</span>
                  <ul className="space-y-1.5 text-brand-dark/90">
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Introduction to Gele Artistry</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Gele Fabrics & Tools</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Basic Foundation Techniques</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>8–10 Everyday Gele Styles</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Client Preparation</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Finishing & Neatness</span></li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-brand-sage/10">
                  <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wider text-[10px]">What's Included:</span>
                  <ul className="space-y-1 text-brand-slate">
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Certificate of Completion</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Printed Training Manual</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Practical Sessions</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Student WhatsApp Community</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>2 Weeks Support</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRegister('Tier 1 – Beginner Cohort')}
              className="mt-6 w-full py-3 bg-brand-cream hover:bg-brand-primary hover:text-white text-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-brand-primary/20 cursor-pointer font-sans"
            >
              Enroll Beginner Tier
            </button>
          </motion.div>

          {/* TIER 2 – INTERMEDIATE COHORT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl p-6 border border-brand-sage/20 shadow-md flex flex-col justify-between hover:border-brand-primary/40 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
                  Tier 2
                </span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Early: ₦40,000
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-brand-dark mb-1">INTERMEDIATE COHORT</h3>
              <p className="text-xs text-brand-slate mb-4 italic">For stylists upgrading into professional artistry</p>

              <div className="mb-6 pb-4 border-b border-brand-sage/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-brand-dark">₦50,000</span>
                  <span className="text-xs text-brand-slate font-sans">/ tuition</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wider text-[10px]">Everything in Beginner, Plus:</span>
                  <ul className="space-y-1.5 text-brand-dark/90">
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Bridal Gele Techniques</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Trending Luxury Gele Styles</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Face-Shaping Techniques</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Speed Styling Optimization</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Client Consultation</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Professional Finishing</span></li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-brand-sage/10">
                  <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wider text-[10px]">Exclusive Bonuses:</span>
                  <ul className="space-y-1 text-brand-slate">
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Business Pricing Guide</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Personal Branding Class</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Social Media Marketing Tips</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>30-Day Mentorship Access</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Professional Photoshoot</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRegister('Tier 2 – Intermediate Cohort')}
              className="mt-6 w-full py-3 bg-brand-cream hover:bg-brand-primary hover:text-white text-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-brand-primary/20 cursor-pointer font-sans"
            >
              Enroll Intermediate Tier
            </button>
          </motion.div>

          {/* TIER 3 – PROFESSIONAL COHORT (ELITE) - FEATURED */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-brand-dark text-white rounded-3xl p-6 border-2 border-brand-gold shadow-xl flex flex-col justify-between relative transform lg:-translate-y-2"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-dark px-4 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1 font-sans">
              <Star size={12} className="fill-brand-dark" />
              <span>Most Popular Choice</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-white/10 px-2.5 py-1 rounded-full">
                  Tier 3 (Elite)
                </span>
                <span className="text-xs text-brand-gold font-semibold bg-white/10 px-2 py-0.5 rounded border border-brand-gold/30">
                  Early: ₦60,000
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-white mb-1">PROFESSIONAL ELITE</h3>
              <p className="text-xs text-brand-silver mb-4 italic">For luxury artists ready to build a premium brand</p>

              <div className="mb-6 pb-4 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-brand-gold">₦70,000</span>
                  <span className="text-xs text-brand-silver font-sans">/ tuition</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="font-bold text-brand-gold block mb-2 uppercase tracking-wider text-[10px]">Everything in Intermediate, Plus:</span>
                  <ul className="space-y-1.5 text-brand-silver">
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-gold shrink-0 mt-0.5" /><span>Celebrity Bridal Styling</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-gold shrink-0 mt-0.5" /><span>Luxury Layering Techniques</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-gold shrink-0 mt-0.5" /><span>Editorial Gele & Auto Gele</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-gold shrink-0 mt-0.5" /><span>Working with Difficult Fabrics</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-gold shrink-0 mt-0.5" /><span>Live Client Practical Sessions</span></li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="font-bold text-brand-gold block mb-2 uppercase tracking-wider text-[10px]">Full Business Masterclass:</span>
                  <ul className="space-y-1 text-brand-silver">
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Building a Luxury Brand</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Attracting Premium Clients</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Instagram Marketing & Content</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Sales Psychology & Pricing</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Portfolio Photoshoot & Kit</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRegister('Tier 3 – Professional Cohort (Elite)')}
              className="mt-6 w-full py-3.5 bg-brand-gold hover:bg-white text-brand-dark font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer font-sans"
            >
              Enroll Professional Elite
            </button>
          </motion.div>

          {/* VIP ELITE MENTORSHIP */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-gradient-to-b from-brand-cream/80 to-amber-50/50 rounded-3xl p-6 border border-brand-gold/40 shadow-md flex flex-col justify-between hover:border-brand-gold transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full">
                  VIP Direct
                </span>
                <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Only 3–5 Seats
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-brand-dark mb-1">VIP MENTORSHIP</h3>
              <p className="text-xs text-brand-slate mb-4 italic">Direct 1-on-1 coaching & live job shadowing</p>

              <div className="mb-6 pb-4 border-b border-brand-gold/20">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-brand-dark">₦100,000</span>
                  <span className="text-xs text-brand-slate font-sans">/ investment</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wider text-[10px]">Everything in Professional, Plus:</span>
                  <ul className="space-y-1.5 text-brand-dark/90">
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Personal 1-on-1 Coaching Sessions</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Shadow Me on Live Bridal Jobs</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Business Setup & Brand Identity</span></li>
                    <li className="flex items-start gap-1.5"><Check size={14} className="text-brand-primary shrink-0 mt-0.5" /><span>Client Sourcing Strategy</span></li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-brand-gold/20">
                  <span className="font-bold text-brand-dark block mb-2 uppercase tracking-wider text-[10px]">Exclusive VIP Perks:</span>
                  <ul className="space-y-1 text-brand-slate">
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>3 Months Direct Mentorship</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Lifetime Direct Support</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Internship Opportunities</span></li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={13} className="text-brand-gold shrink-0" /><span>Priority Client Referrals</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRegister('VIP Elite Mentorship')}
              className="mt-6 w-full py-3 bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer font-sans"
            >
              Apply for VIP Mentorship
            </button>
          </motion.div>

        </div>
      </div>

      {/* 5. SAMPLE TRAINING SCHEDULE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-sage/20 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8 border-b border-brand-sage/10 pb-6">
          <div>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Curriculum Breakdown</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">Sample 2-Week Cohort Schedule</h2>
            <p className="text-xs text-brand-slate mt-1">Structured learning path for maximum skill retention</p>
          </div>

          {/* Week Tabs Switcher */}
          <div className="flex items-center bg-brand-cream/80 p-1 rounded-2xl border border-brand-sage/20 shrink-0">
            <button
              onClick={() => setActiveWeekTab('week1')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeWeekTab === 'week1' 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'text-brand-dark hover:text-brand-primary'
              }`}
            >
              Week 1: Foundations
            </button>
            <button
              onClick={() => setActiveWeekTab('week2')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeWeekTab === 'week2' 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'text-brand-dark hover:text-brand-primary'
              }`}
            >
              Week 2: Advanced & Graduation
            </button>
          </div>
        </div>

        {/* Week 1 Content */}
        {activeWeekTab === 'week1' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            
            <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-sage/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-sage/10">
                <span className="font-serif font-bold text-brand-dark text-base">MONDAY</span>
                <span className="text-[10px] font-bold text-brand-primary uppercase bg-brand-primary/10 px-2 py-0.5 rounded">Day 1</span>
              </div>
              <h4 className="font-serif font-semibold text-brand-dark text-sm text-brand-primary">Introduction & Fundamentals</h4>
              <ul className="space-y-2 text-xs text-brand-dark/85 font-sans">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Introduction to Gele Artistry</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Gele Fabrics & Tools Masterclass</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Basic Foundation Techniques & Hand Grips</span></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-sage/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-sage/10">
                <span className="font-serif font-bold text-brand-dark text-base">WEDNESDAY</span>
                <span className="text-[10px] font-bold text-brand-primary uppercase bg-brand-primary/10 px-2 py-0.5 rounded">Day 2</span>
              </div>
              <h4 className="font-serif font-semibold text-brand-dark text-sm text-brand-primary">Beginner Gele Folds</h4>
              <ul className="space-y-2 text-xs text-brand-dark/85 font-sans">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>5-Row Pleat Mechanics & Alignment</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Everyday Fan & Rose Gele Styles</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Guided Student Practical Sessions</span></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-sage/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-sage/10">
                <span className="font-serif font-bold text-brand-dark text-base">FRIDAY</span>
                <span className="text-[10px] font-bold text-brand-primary uppercase bg-brand-primary/10 px-2 py-0.5 rounded">Day 3</span>
              </div>
              <h4 className="font-serif font-semibold text-brand-dark text-sm text-brand-primary">Assessment & Corrections</h4>
              <ul className="space-y-2 text-xs text-brand-dark/85 font-sans">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Timed Speed & Symmetry Tests</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Individual Tutor Feedback & Correction</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Homework Assignment & Practice Review</span></li>
              </ul>
            </div>

          </div>
        )}

        {/* Week 2 Content */}
        {activeWeekTab === 'week2' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            
            <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-sage/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-sage/10">
                <span className="font-serif font-bold text-brand-dark text-base">MONDAY</span>
                <span className="text-[10px] font-bold text-brand-primary uppercase bg-brand-primary/10 px-2 py-0.5 rounded">Day 4</span>
              </div>
              <h4 className="font-serif font-semibold text-brand-dark text-sm text-brand-primary">Bridal & Luxury Artistry</h4>
              <ul className="space-y-2 text-xs text-brand-dark/85 font-sans">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Bridal Gele Techniques & Face Shaping</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Millionaire Pleats & Avant-Garde Folds</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Multi-material & Aso-Oke Handling</span></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-sage/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-sage/10">
                <span className="font-serif font-bold text-brand-dark text-base">WEDNESDAY</span>
                <span className="text-[10px] font-bold text-brand-primary uppercase bg-brand-primary/10 px-2 py-0.5 rounded">Day 5</span>
              </div>
              <h4 className="font-serif font-semibold text-brand-dark text-sm text-brand-primary">Business & Live Practicals</h4>
              <ul className="space-y-2 text-xs text-brand-dark/85 font-sans">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Live Client Model Styling Sessions</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Business Monetization, Instagram & Pricing</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" /><span>Client Sourcing & Branding Masterclass</span></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-gold/20">
                <span className="font-serif font-bold text-brand-dark text-base">FRIDAY</span>
                <span className="text-[10px] font-bold text-brand-dark uppercase bg-brand-gold px-2 py-0.5 rounded">Graduation</span>
              </div>
              <h4 className="font-serif font-semibold text-brand-dark text-sm text-brand-primary">Graduation & Photoshoot</h4>
              <ul className="space-y-2 text-xs text-brand-dark/95 font-sans">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5" /><span>Final Practical Assessment</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5" /><span>Professional Model Portfolio Photoshoot</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5" /><span>Graduation Ceremony & Certificate Presentation</span></li>
              </ul>
            </div>

          </div>
        )}
      </div>

      {/* 6. ALUMNI BENEFITS & COMMUNITY */}
      <div className="bg-brand-dark text-white rounded-3xl p-8 border border-brand-sage/20 text-left relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">Lifetime Network</span>
            <h3 className="text-3xl font-serif font-bold text-white">Alumni Benefits & Direct Support</h3>
            <p className="text-xs sm:text-sm text-brand-silver leading-relaxed font-sans">
              Graduating from Fabulous Gele Academy is just the beginning. All alumni join our exclusive professional network with ongoing career advantages:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-sans text-xs">
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle size={16} className="text-brand-gold shrink-0" />
                <span>Student WhatsApp Community Access</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle size={16} className="text-brand-gold shrink-0" />
                <span>Discounts on Future Masterclasses</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle size={16} className="text-brand-gold shrink-0" />
                <span>Exclusive Networking Events</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle size={16} className="text-brand-gold shrink-0" />
                <span>Referral Rewards for New Students</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 p-6 rounded-2xl border border-brand-gold/30 text-center space-y-4">
            <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto border border-brand-gold/30">
              <Sparkles size={32} className="text-brand-gold" />
            </div>
            <h4 className="font-serif font-bold text-lg text-white">Official Cohort Identity</h4>
            <p className="text-xs text-brand-silver font-sans leading-relaxed">
              Every batch is officially branded (e.g., <strong className="text-brand-gold">Fabulous Gele Academy – Cohort 003</strong>). Build your credibility with certified cohort credentials.
            </p>
            <button
              onClick={() => onRegister('Tier 3 – Professional Cohort (Elite)')}
              className="w-full py-3 bg-brand-gold text-brand-dark font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-all cursor-pointer font-sans"
            >
              Secure Your Cohort Seat
            </button>
          </div>

        </div>
      </div>

      {/* 7. PHOTO & VIDEO GALLERY CAROUSEL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-sage/20 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Visual Proof & Experience</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">Academy Training Moments</h2>
          </div>
          <span className="text-xs text-brand-slate font-sans">
            Hands-on practical classes with Adeniji Oluwapelumi
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Featured Photo */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-brand-sage/20 bg-brand-dark relative aspect-video shadow-md">
            <ImageWithFallback 
              src={ACADEMY_GALLERY_IMAGES[selectedGalleryIdx].src} 
              alt={ACADEMY_GALLERY_IMAGES[selectedGalleryIdx].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-brand-dark/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-gold border border-brand-gold/30">
              {ACADEMY_GALLERY_IMAGES[selectedGalleryIdx].badge}
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-xs font-sans">
              {ACADEMY_GALLERY_IMAGES[selectedGalleryIdx].alt}
            </div>
          </div>

          {/* Gallery Thumbnails List */}
          <div className="lg:col-span-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {ACADEMY_GALLERY_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedGalleryIdx(idx)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedGalleryIdx === idx 
                    ? 'border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary' 
                    : 'border-brand-sage/20 bg-white hover:border-brand-sage/50'
                }`}
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-brand-cream border border-brand-sage/20">
                  <ImageWithFallback src={img.src} alt={img.badge} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-dark block">{img.badge}</span>
                  <p className="text-[10px] text-brand-slate line-clamp-1">{img.alt}</p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
