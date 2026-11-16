import React, { useRef, useState, useEffect } from 'react';
import { Play, Heart, MessageCircle, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function TikTokFeedEmbed() {
  const placeholderVideos = [
    {
      id: 'v1',
      title: 'Bespoke Bridal Gele Transformation 👑 #IbadanBride #GeleArt',
      likes: '14.2K',
      comments: '342',
      duration: '0:45',
      thumbnail: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=400',
      views: '112K'
    },
    {
      id: 'v2',
      title: 'How to wear our Auto Gele in under 30 seconds! ⏱️ #AutoGele #NigerianFashion',
      likes: '28.5K',
      comments: '812',
      duration: '0:30',
      thumbnail: 'https://images.unsplash.com/photo-1607831958387-aa07223bdf33?auto=format&fit=crop&q=80&w=400',
      views: '245K'
    },
    {
      id: 'v3',
      title: 'Aso Ebi Ladies squad matching perfectly! 💚 #Owambe #SlayNation',
      likes: '9.8K',
      comments: '189',
      duration: '0:58',
      thumbnail: 'https://images.unsplash.com/photo-1605493743455-c5d45230985f?auto=format&fit=crop&q=80&w=400',
      views: '88K'
    },
    {
      id: 'v4',
      title: 'Infinity Pleats Masterclass graduation ceremony 🎓 #Empowerment #CreativeCareer',
      likes: '5.6K',
      comments: '95',
      duration: '1:15',
      thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
      views: '45K'
    },
    {
      id: 'v5',
      title: 'Double Crown Gele Artistry BTS Secrets of Pleat Consistency ✨ #LuxuryHeadtie',
      likes: '12.4K',
      comments: '210',
      duration: '1:02',
      thumbnail: 'https://images.unsplash.com/photo-1532453242-95cd2a5e9334?auto=format&fit=crop&q=80&w=400',
      views: '98K'
    },
    {
      id: 'v6',
      title: 'Stunning Coral Gold Royal Owambe Slay ✨ #CrownOfElegance #HeadtieArt',
      likes: '19.1K',
      comments: '408',
      duration: '0:50',
      thumbnail: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=400',
      views: '162K'
    },
    {
      id: 'v7',
      title: 'Flawless side-fan Gele draping tutorial step-by-step 💎 #HeadtieHacks',
      likes: '31.2K',
      comments: '1,024',
      duration: '1:30',
      thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      views: '380K'
    },
    {
      id: 'v8',
      title: 'Fabulous Gele Academy Student practical showcase 👑 #ProudMentor #Ibadan',
      likes: '7.3K',
      comments: '115',
      duration: '0:40',
      thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
      views: '54K'
    }
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll positions to show/hide controls
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // initial check
      checkScrollPosition();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, []);

  // Auto-scroll loop when NOT hovering
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        // If reached the end, loop smoothly back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll forward by one card's width + gap (approx 300px)
          container.scrollBy({ left: 296, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -296 : 296;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="bg-brand-primary/20 backdrop-blur-sm p-6 rounded-2xl border border-brand-sage/20 my-10 relative group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-brand-gold uppercase block mb-1">Social Feed</span>
          <h3 className="text-2xl font-serif text-white flex items-center gap-2">
            Fabulous on TikTok
            <Sparkles size={16} className="text-brand-gold fill-brand-gold" />
          </h3>
          <p className="text-sm text-brand-silver mt-1">Check out our latest tutorial reels and client transformations</p>
        </div>
        <a 
          href="https://tiktok.com/@fabulousgele_artistry" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-gold hover:text-brand-cream transition-colors mt-3 sm:mt-0"
        >
          <span>Follow @fabulousgele_artistry</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* TikTok API Integration Notice */}
      <div className="mb-6 p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-xs text-brand-cream/90 leading-relaxed">
        <span className="font-bold text-brand-gold">✨ Live Integration Note:</span> This section currently displays premium curated placeholders. To connect your live real-time TikTok account, provide your TikTok API credentials or embed script in <code className="bg-white/10 border border-white/5 px-1 py-0.5 text-brand-gold rounded text-[10px]">TikTokFeedEmbed.tsx</code>.
      </div>

      {/* Navigation Buttons (Visible on Hover and Desktop) */}
      {canScrollLeft && (
        <button
          onClick={() => handleManualScroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-brand-dark/90 hover:bg-brand-gold text-brand-cream hover:text-brand-dark rounded-full flex items-center justify-center shadow-lg transition-all border border-brand-sage/20 cursor-pointer md:opacity-0 group-hover/carousel:opacity-100"
          title="Scroll Left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleManualScroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-brand-dark/90 hover:bg-brand-gold text-brand-cream hover:text-brand-dark rounded-full flex items-center justify-center shadow-lg transition-all border border-brand-sage/20 cursor-pointer md:opacity-0 group-hover/carousel:opacity-100"
          title="Scroll Right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Horizontal Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {placeholderVideos.map((video) => (
          <div 
            key={video.id}
            className="w-[280px] shrink-0 snap-start snap-always group relative bg-brand-dark rounded-xl overflow-hidden shadow-sm aspect-[9/16] cursor-pointer"
          >
            {/* Thumbnail with ImageFallback */}
            <ImageWithFallback 
              src={video.thumbnail} 
              alt={video.title} 
              iconType="user"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
              referrerPolicy="no-referrer"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/30 p-4 flex flex-col justify-between" />

            {/* Top Info */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/90 text-[11px]">
              <span className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full font-mono">
                {video.views} views
              </span>
              <span className="bg-brand-primary/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                Reel
              </span>
            </div>

            {/* Center Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 bg-brand-gold text-brand-dark rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <Play size={20} className="fill-brand-dark ml-0.5" />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-xs font-medium line-clamp-2 mb-2 group-hover:text-brand-gold transition-colors text-left">
                {video.title}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-white/75">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Heart size={12} className="fill-brand-gold stroke-brand-gold text-brand-gold" />
                    {video.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle size={12} />
                    {video.comments}
                  </span>
                </div>
                <span className="font-mono">{video.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
