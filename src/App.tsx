import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Sparkles, Phone, MapPin, Calendar, Clock, User, Mail, 
  BookOpen, ShoppingBag, Award, ChevronDown, ChevronUp, Search, 
  Heart, MessageCircle, Play, Send, Star, Crown, Camera, Check, 
  CheckCircle, Facebook, Instagram, Shield, GraduationCap, Scissors, ExternalLink,
  AlertTriangle
} from 'lucide-react';

import Logo from './components/Logo';
import TikTokFeedEmbed from './components/TikTokFeedEmbed';
import Testimonials from './components/Testimonials';
import BookingForm from './components/BookingForm';
import AcademySection from './components/AcademySection';
import AdminDashboard from './components/AdminDashboard';
import PromoStrip from './components/PromoStrip';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ImageWithFallback from './components/ImageWithFallback';
import AnimatedCounter from './components/AnimatedCounter';
import AwardsCarousel from './components/AwardsCarousel';
import { saveOrderToFirestore, saveClientToFirestore, fetchProductsFromFirestore, saveProductToFirestore, subscribeToProducts, fetchArticlesFromFirestore, saveArticleToFirestore, fetchServicesFromFirestore, fetchPromoBannerFromFirestore, fetchGalleryFromFirestore, fetchSiteImagesFromFirestore, saveSiteImagesToFirestore, fetchConversionsFromFirestore, saveConversionsToFirestore, resetConversionsInFirestore, subscribeToTestimonials, saveTestimonialToFirestore } from './firebase';
import { SiteImages } from './types';

import { 
  INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_GALLERY, 
  INITIAL_TESTIMONIALS, INITIAL_BLOG_POSTS, INITIAL_FAQS, 
  BRAND_STORY 
} from './data/initialData';
import { Product, Service, PromoBanner, GalleryItem, BlogPost, FAQItem, Testimonial } from './types';

const ACADEMY_GALLERY = [
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

export default function App() {
  // --- Persistent State management (localStorage) ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fabulous_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('fabulous_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [promoBanner, setPromoBanner] = useState<PromoBanner>(() => {
    const saved = localStorage.getItem('fabulous_promo');
    return saved ? JSON.parse(saved) : {
      text: '✨ Special Offer: Secure your Bridal Gele styling slot for any date in 2026 and get a complimentary auto-gele styling tutorial! ✨',
      isActive: true,
      linkText: 'Book Now'
    };
  });

  const [ordersCount, setOrdersCount] = useState<number>(() => {
    const saved = localStorage.getItem('fabulous_orders_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [articles, setArticles] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('fabulous_articles');
    return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('fabulous_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [siteImages, setSiteImages] = useState<SiteImages>(() => {
    const saved = localStorage.getItem('fabulous_site_images');
    return saved ? JSON.parse(saved) : {
      heroImage: '/src/assets/images/gele_by_him_1784695959540.jpg',
      heroBadgeText: 'Master Artisan Showcase',
      artistPortrait: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
      academyBanner: '/src/assets/images/tutor_and_models_1784637118947.jpg',
      testimonialBanner: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800'
    };
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('fabulous_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS.slice(0, 3);
  });

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('fabulous_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('fabulous_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fabulous_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('fabulous_promo', JSON.stringify(promoBanner));
  }, [promoBanner]);

  useEffect(() => {
    localStorage.setItem('fabulous_orders_count', ordersCount.toString());
  }, [ordersCount]);

  useEffect(() => {
    localStorage.setItem('fabulous_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('fabulous_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('fabulous_site_images', JSON.stringify(siteImages));
  }, [siteImages]);

  // Sync site pictures with Firebase Firestore
  useEffect(() => {
    fetchSiteImagesFromFirestore().then(remoteImages => {
      if (remoteImages && remoteImages.heroImage) {
        setSiteImages(remoteImages);
      }
    }).catch(err => console.warn('Non-blocking Firestore site images fetch error:', err));
  }, []);

  // Live Real-Time Sync of Testimonials with Firebase Firestore
  useEffect(() => {
    let seedAttempted = false;
    const unsubscribe = subscribeToTestimonials((remoteTestimonials) => {
      if (remoteTestimonials && remoteTestimonials.length > 0) {
        setTestimonials(remoteTestimonials.slice(0, 3));
      } else if (!seedAttempted) {
        seedAttempted = true;
        // Seed Firestore with initial testimonials if empty
        INITIAL_TESTIMONIALS.slice(0, 3).forEach(t => {
          saveTestimonialToFirestore(t).catch(err => console.warn('Non-blocking seed testimonial warning:', err));
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Live Real-Time Sync of Products Catalog with Firebase Firestore
  useEffect(() => {
    let seedAttempted = false;
    const unsubscribe = subscribeToProducts((remoteProducts) => {
      if (remoteProducts && remoteProducts.length > 0) {
        setProducts(remoteProducts.map(p => ({
          id: p.id || 'p_' + Math.random(),
          name: p.name,
          price: p.price,
          category: p.category as any,
          image: p.image,
          description: p.description,
          inStock: p.inStock ?? true
        })));
      } else if (!seedAttempted) {
        seedAttempted = true;
        // Seed Firestore with initial catalog if empty
        INITIAL_PRODUCTS.forEach(p => {
          saveProductToFirestore({
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.image,
            description: p.description,
            inStock: p.inStock
          }).catch(err => console.warn('Non-blocking seed product warning:', err));
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync articles with Firebase Firestore
  useEffect(() => {
    fetchArticlesFromFirestore().then(remoteArticles => {
      if (remoteArticles && remoteArticles.length > 0) {
        setArticles(remoteArticles.map(a => ({
          id: a.id || 'b_' + Math.random(),
          title: a.title,
          category: a.category,
          excerpt: a.excerpt,
          content: a.content,
          date: a.date,
          readTime: a.readTime,
          image: a.image,
          author: a.author
        })));
      } else {
        // Seed Firestore with initial blog posts if empty
        INITIAL_BLOG_POSTS.forEach(b => {
          saveArticleToFirestore({
            id: b.id,
            title: b.title,
            category: b.category || 'Artistry Insights',
            excerpt: b.excerpt,
            content: b.content,
            date: b.date,
            readTime: b.readTime,
            image: b.image,
            author: b.author || 'Oluwapelumi - Lead Artist'
          }).catch(err => console.warn('Non-blocking seed article warning:', err));
        });
      }
    }).catch(err => console.warn('Non-blocking article sync warning:', err));
  }, []);

  // Sync services & promo banner with Firebase Firestore
  useEffect(() => {
    fetchServicesFromFirestore().then(remoteServices => {
      if (remoteServices && remoteServices.length > 0) {
        setServices(remoteServices);
      }
    }).catch(err => console.warn('Non-blocking services sync warning:', err));

    fetchPromoBannerFromFirestore().then(remotePromo => {
      if (remotePromo) {
        setPromoBanner(remotePromo);
      }
    }).catch(err => console.warn('Non-blocking promo sync warning:', err));

    fetchGalleryFromFirestore().then(remoteGallery => {
      if (remoteGallery && remoteGallery.length > 0) {
        setGallery(prev => {
          const remoteIds = new Set(remoteGallery.map(g => g.id));
          const localOnly = prev.filter(g => !remoteIds.has(g.id));
          return [...remoteGallery, ...localOnly];
        });
      }
    }).catch(err => console.warn('Non-blocking gallery sync warning:', err));

    fetchConversionsFromFirestore().then(remoteCount => {
      if (typeof remoteCount === 'number') {
        setOrdersCount(prev => Math.max(prev, remoteCount));
      }
    }).catch(err => console.warn('Non-blocking conversions fetch error:', err));
  }, []);

  // --- UI and Navigation States ---
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'bridal' | 'owambe' | 'asoebi' | 'before_after' | 'bts' | 'training'>('all');
  const [shopCategory, setShopCategory] = useState<'all' | 'Auto Gele' | 'Fabrics' | 'Senator Caps' | 'Accessories'>('all');
  const [shopSearch, setShopSearch] = useState('');
  
  // Lightboxes and Detail Modals
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [selectedBookingServiceId, setSelectedBookingServiceId] = useState<string>('');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [brandVideoActive, setBrandVideoActive] = useState<string | null>(null);
  const [activeTrainingImageIdx, setActiveTrainingImageIdx] = useState(0);

  // --- Hidden Admin Dashboard Trigger ---
  const [adminOpen, setAdminOpen] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    logoClickCount.current += 1;

    // Reset count if user stops clicking
    if (logoClickTimeout.current) clearTimeout(logoClickTimeout.current);
    
    logoClickTimeout.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 3000); // 3 seconds timeout

    if (logoClickCount.current >= 5) {
      setAdminOpen(true);
      logoClickCount.current = 0;
      if (logoClickTimeout.current) clearTimeout(logoClickTimeout.current);
    }
  };

  // State-based dynamic subpage routing with auto-top scroll and History API
  const navigateTo = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);

    const newHash = `#${sectionId}`;
    if (window.location.hash !== newHash) {
      window.history.pushState({ sectionId }, '', newHash);
    }

    setTimeout(() => {
      const mainElem = document.querySelector('main');
      if (mainElem) {
        const yOffset = -80; // height of the sticky header
        const y = mainElem.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  // Initial deep-link hash routing on page load & back/forward navigation support
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = ['home', 'about', 'services', 'portfolio', 'pricing', 'shop', 'training', 'blog', 'contact', 'booking'];
      if (hash && validSections.includes(hash)) {
        setActiveSection(hash);
        setTimeout(() => {
          const mainElem = document.querySelector('main');
          if (mainElem) {
            const yOffset = -80; // height of the sticky header
            const y = mainElem.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else if (!hash) {
        setActiveSection('home');
      }
    };

    // Run once on load
    handleLocationChange();

    // Listen to hash changes (for direct manual hash edits or anchor links)
    window.addEventListener('hashchange', handleLocationChange);
    // Listen to popstate (for browser Back/Forward navigation)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Pre-fill booking service from buttons
  const handleBookNow = (serviceId: string) => {
    setSelectedBookingServiceId(serviceId);
    navigateTo('booking');
  };

  const handleIncrementOrdersCount = () => {
    setOrdersCount(prev => {
      const next = prev + 1;
      saveConversionsToFirestore(next).catch(err => console.warn(err));
      return next;
    });
  };

  const handleResetOrdersCount = () => {
    setOrdersCount(0);
    resetConversionsInFirestore().catch(err => console.warn(err));
  };

  // Filter portfolio
  const filteredPortfolio = portfolioFilter === 'all' 
    ? gallery 
    : gallery.filter(item => item.category === portfolioFilter);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = shopCategory === 'all' || p.category === shopCategory;
    const matchesSearch = p.name.toLowerCase().includes(shopSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(shopSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark selection:bg-brand-gold/30 selection:text-brand-dark flex flex-col font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <PromoStrip 
        banner={promoBanner} 
        onCTAClick={(actionType) => {
          if (actionType === 'shop') {
            navigateTo('shop');
          } else if (actionType === 'bridal') {
            handleBookNow('bridal_gele');
          } else {
            handleBookNow('gele_training');
          }
        }} 
      />

      {/* 2. STICKY HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-brand-dark text-brand-cream border-b border-brand-sage/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo Triggering Hidden Admin Panel */}
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer group relative flex items-center gap-1 active:scale-95 transition-transform"
            title="Double-click wordmark several times for creative services login"
          >
            <Logo size="md" />
            <span className="sr-only">Fabulous Gele Artistry Logo</span>
          </div>

          {/* Desktop Navigation Link Menu with active highlights */}
          <nav className="hidden lg:flex items-center gap-5 text-xs uppercase tracking-widest font-semibold text-brand-silver">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'services', label: 'Services' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'shop', label: 'Shop' },
              { id: 'training', label: 'Training' },
              { id: 'blog', label: 'Blog' },
              { id: 'contact', label: 'Contact' }
            ].map((tab) => {
              const isCurrent = activeSection === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)} 
                  className={`hover:text-brand-gold transition-all duration-200 cursor-pointer relative py-1 ${
                    isCurrent ? 'text-brand-gold font-bold border-b-2 border-brand-gold' : 'text-brand-silver'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Call to Action Button */}
          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={() => handleBookNow('')}
              className="bg-brand-primary text-brand-cream text-xs uppercase font-bold tracking-widest px-5 py-2.5 rounded-full hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 shadow-md cursor-pointer"
            >
              Book Styling
            </button>
          </div>

          {/* Mobile Hamburger menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-brand-cream p-1 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brand-dark/95 border-t border-brand-sage/10 py-4 px-6 space-y-3 flex flex-col text-sm tracking-wider font-medium uppercase text-brand-silver">
            <button onClick={() => navigateTo('home')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'home' ? 'text-brand-gold font-bold' : ''}`}>Home</button>
            <button onClick={() => navigateTo('about')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'about' ? 'text-brand-gold font-bold' : ''}`}>About Story</button>
            <button onClick={() => navigateTo('services')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'services' ? 'text-brand-gold font-bold' : ''}`}>Services Directory</button>
            <button onClick={() => navigateTo('portfolio')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'portfolio' ? 'text-brand-gold font-bold' : ''}`}>Portfolio Gallery</button>
            <button onClick={() => navigateTo('pricing')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'pricing' ? 'text-brand-gold font-bold' : ''}`}>Pricing List</button>
            <button onClick={() => navigateTo('shop')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'shop' ? 'text-brand-gold font-bold' : ''}`}>Boutique Shop</button>
            <button onClick={() => navigateTo('training')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'training' ? 'text-brand-gold font-bold' : ''}`}>Academy Training</button>
            <button onClick={() => navigateTo('blog')} className={`text-left py-1.5 border-b border-white/5 cursor-pointer ${activeSection === 'blog' ? 'text-brand-gold font-bold' : ''}`}>Cultural Blog</button>
            <button onClick={() => navigateTo('contact')} className={`text-left py-1.5 cursor-pointer ${activeSection === 'contact' ? 'text-brand-gold font-bold' : ''}`}>Contact Us</button>
            
            <button 
              onClick={() => handleBookNow('')}
              className="bg-brand-primary text-white text-center text-xs font-bold py-3 rounded-xl tracking-wider cursor-pointer mt-2"
            >
              Book Your Gele Now
            </button>
          </div>
        )}
      </header>

      {/* ==================== SUBPAGES CONTAINER ==================== */}
      <main className="flex-1">

        {/* -------------------- A. SUBPAGE: HOME (SUMMARIZED) -------------------- */}
        {activeSection === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* HERO HERO HERO */}
            <section className="relative bg-brand-dark text-brand-cream py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--color-brand-primary)_0%,transparent_60%)] opacity-30" />
              
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                
                {/* Left Text Column */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-7 space-y-6 text-left"
                >
                  {/* Luxury Cultural Brand Accent Header */}
                  <div className="flex items-center gap-3 text-brand-gold py-1">
                    <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-brand-gold/70" />
                    <div className="flex items-center gap-2 text-brand-gold text-[11px] sm:text-xs font-serif font-bold tracking-[0.2em] uppercase">
                      <Crown size={14} className="text-brand-gold shrink-0 fill-brand-gold/20" />
                      <span>Haute Couture Gele &amp; Bridal Artistry</span>
                    </div>
                    <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-brand-gold/70 to-transparent" />
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none font-serif">
                    Elegant Gele Artistry, <br />
                    <span className="text-brand-gold italic">Rooted in Culture.</span>
                  </h1>
                  
                  <p className="text-brand-silver text-sm sm:text-base leading-relaxed max-w-xl font-sans">
                    We preserve and celebrate the majestic beauty of African culture through elegant, timeless gele styles, delivered with absolute professionalism in Ibadan. Empowering your style, crowning your confidence.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      onClick={() => handleBookNow('')}
                      className="px-8 py-3.5 bg-brand-primary hover:bg-brand-gold text-brand-cream hover:text-brand-dark font-bold text-sm rounded-full tracking-wider transition-all duration-300 shadow-lg text-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Book Your Gele
                    </button>
                    <button 
                      onClick={() => navigateTo('portfolio')}
                      className="px-8 py-3.5 border border-brand-sage/50 hover:border-brand-gold hover:text-brand-gold text-brand-cream font-bold text-sm rounded-full tracking-wider transition-colors text-center cursor-pointer"
                    >
                      View Portfolio
                    </button>
                  </div>
                </motion.div>

                {/* Right Image/Model Frame Column */}
                <motion.div 
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-5 relative"
                >
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-brand-gold/30 shadow-2xl relative bg-zinc-900 group">
                    <ImageWithFallback 
                      src={siteImages.heroImage || "/src/assets/images/gele_by_him_1784695959540.jpg"} 
                      alt="Fabulous Gele Artistry Masterpiece" 
                      iconType="crown"
                      className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-transparent to-transparent p-6 flex flex-col justify-end text-left">
                      <span className="bg-brand-gold text-brand-dark font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-1.5 shadow-md">
                        {siteImages.heroBadgeText || "Master Artisan Showcase"}
                      </span>
                      <p className="text-white font-serif font-bold text-lg sm:text-xl">Fabulous Gele Artistry</p>
                      <p className="text-brand-gold text-xs font-sans font-medium tracking-wide">Learn. Create. Empower.</p>
                    </div>
                  </div>

                  {/* Accent Gold Badge */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -bottom-6 -left-6 bg-brand-gold text-brand-dark p-4 rounded-2xl shadow-xl border border-brand-cream max-w-[180px] hidden sm:block"
                  >
                    <p className="text-2xl font-serif font-black text-brand-primary">100%</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Handcrafted Artistry & Comfort</p>
                  </motion.div>
                </motion.div>

              </div>

              {/* TIKTOK REELS WIDGET EMBED */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto mt-16"
              >
                <TikTokFeedEmbed />
              </motion.div>
            </section>

            {/* AWARDS RIBBON */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative bg-gradient-to-b from-brand-dark to-zinc-950 text-brand-cream border-y-2 border-brand-gold/20 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
            >
              {/* Background ambient gold glows */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full filter blur-3xl" />
              
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 px-3 py-1 rounded-full text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-4">
                    <Award size={12} className="text-brand-gold animate-pulse" />
                    <span>Honors & Professional Accreditation</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif mb-3 leading-tight">
                    Crowned with <span className="text-brand-gold">Industry Distinction</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-silver font-sans max-w-xl mx-auto leading-relaxed">
                    Our commitment to authentic cultural preservation, meticulous craft, and student empowerment has earned recognition from prominent regional and cultural bodies.
                  </p>
                </div>

                <AwardsCarousel awards={BRAND_STORY.awards} />
              </div>
            </motion.section>

            {/* SUMMARY: ABOUT STORY */}
            <motion.section 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 relative">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-brand-sage/20 shadow-xl relative bg-zinc-800">
                    <ImageWithFallback 
                      src={siteImages.artistPortrait || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800"} 
                      alt="Adeniji Oluwapelumi - Gele Stylist Headshot" 
                      iconType="user"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div>
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Heritage</span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">About Fabulous Gele</h2>
                  </div>
                  <p className="text-brand-slate text-sm sm:text-base leading-relaxed line-clamp-4">
                    {BRAND_STORY.paragraphs[0]} {BRAND_STORY.paragraphs[1]}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-brand-sage/20 pt-6">
                    {BRAND_STORY.stats.map((stat, i) => (
                      <div key={i} className="text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-serif font-black text-brand-primary">
                          <AnimatedCounter value={stat.value} />
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-brand-slate mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => navigateTo('about')}
                      className="bg-brand-primary text-brand-cream text-xs uppercase font-bold tracking-widest px-6 py-3 rounded-full hover:bg-brand-dark hover:text-white transition-all shadow-md cursor-pointer"
                    >
                      Read Full Brand Story →
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* SUMMARY: SERVICES OFFERED */}
            <motion.section 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-brand-silver/10 py-20 px-4 sm:px-6 lg:px-8 border-y border-brand-sage/15"
            >
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Offerings</span>
                  <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Signature Styling Services</h2>
                  <p className="text-sm text-brand-slate mt-2">Bespoke luxury styling tailored specifically for standard, bridal, and creative styling requirements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.slice(0, 3).map((service, idx) => (
                    <motion.div 
                      key={service.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={{ y: -6 }}
                      className="bg-white p-6 rounded-2xl border border-brand-sage/15 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h3 className="text-lg font-serif font-bold text-brand-dark">{service.name}</h3>
                          <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded">
                            {service.pricingInfo}
                          </span>
                        </div>
                        <p className="text-xs text-brand-slate leading-relaxed line-clamp-3 mb-6">{service.description}</p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleBookNow(service.id)}
                          className="w-full py-2 text-xs font-bold uppercase tracking-wider text-center border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all cursor-pointer"
                        >
                          Book Session
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <button 
                    onClick={() => navigateTo('services')}
                    className="bg-brand-primary text-brand-cream text-xs uppercase font-bold tracking-widest px-8 py-3 rounded-full hover:bg-brand-dark hover:text-white transition-all shadow-md cursor-pointer"
                  >
                    View All Services & Curriculum →
                  </button>
                </div>
              </div>
            </motion.section>

            {/* SUMMARY: PORTFOLIO PREVIEW */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Portfolio Highlights</span>
                <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Crowning Glory Gallery</h2>
                <p className="text-sm text-brand-slate mt-2">Discover our filterable lookbook showcasing styled models, before-and-afters, and student work.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {gallery.slice(0, 3).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => { navigateTo('portfolio'); setActiveLightboxImage(item.image); }}
                    className="group relative rounded-2xl overflow-hidden aspect-square border border-brand-sage/10 shadow-xs hover:shadow-md cursor-pointer transition-shadow"
                  >
                    <ImageWithFallback 
                      src={item.image} 
                      alt={item.title} 
                      iconType="crown"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent p-4 flex flex-col justify-end text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-0.5">{item.category}</span>
                      <p className="font-serif font-bold text-white text-xs">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <button 
                  onClick={() => navigateTo('portfolio')}
                  className="bg-brand-primary text-brand-cream text-xs uppercase font-bold tracking-widest px-8 py-3 rounded-full hover:bg-brand-gold hover:text-brand-dark transition-all shadow-md cursor-pointer"
                >
                  View Full Gallery & Lightboxes →
                </button>
              </div>
            </section>

            {/* SUMMARY: BOUTIQUE SHOP */}
            <section className="bg-brand-cream border-t border-brand-sage/15 py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Boutique Shop</span>
                  <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Ready-to-Wear Auto Gele & Fabrics</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {products.slice(0, 2).map((p) => (
                    <div 
                      key={p.id}
                      className="p-[1.5px] rounded-[28px] bg-gradient-to-br from-amber-400/50 via-brand-sage/25 to-brand-primary/35 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group overflow-hidden flex flex-col"
                    >
                      <div className="bg-white rounded-[calc(28px-1.5px)] h-full overflow-hidden flex flex-col justify-between">
                        <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900 border-b border-brand-sage/10 rounded-t-[calc(28px-1.5px)]">
                          <ImageWithFallback 
                            src={p.image} 
                            alt={p.name} 
                            iconType="bag"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-serif font-bold text-brand-dark text-sm">{p.name}</h4>
                              <span className="font-mono font-bold text-brand-primary text-xs shrink-0">
                                ₦{p.price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-brand-slate leading-relaxed line-clamp-2">{p.description}</p>
                          </div>
                          <button 
                            onClick={() => navigateTo('shop')}
                            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-center border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all cursor-pointer font-sans"
                          >
                            Visit Boutique Catalog
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <button 
                    onClick={() => navigateTo('shop')}
                    className="bg-brand-primary text-brand-cream text-xs uppercase font-bold tracking-widest px-8 py-3 rounded-full hover:bg-brand-dark hover:text-white transition-all shadow-md cursor-pointer"
                  >
                    Go to Full Boutique Shop →
                  </button>
                </div>
              </div>
            </section>

            {/* SUMMARY: ACADEMY TRAINING */}
            <section className="bg-brand-primary text-brand-cream py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-3xl my-10 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-brand-primary)_0%,transparent_60%)] opacity-30" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
                <div className="lg:col-span-8 space-y-4">
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">Gele Academy</span>
                  <h2 className="text-3xl font-serif text-white">Empower Your Beauty Career</h2>
                  <p className="text-sm text-brand-silver leading-relaxed max-w-xl">
                    Build a highly profitable career in the wedding industry. Our physical, hands-on masterclasses teach you all modern head-wrap styles, draping symmetry, pricing models, and client management.
                  </p>
                </div>
                <div className="lg:col-span-4 text-center lg:text-right">
                  <button 
                    onClick={() => navigateTo('training')}
                    className="px-8 py-3.5 bg-brand-gold hover:bg-brand-cream text-brand-dark font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer inline-block"
                  >
                    View Academy & Curriculum →
                  </button>
                </div>
              </div>
            </section>

            {/* SUMMARY: CULTURAL BLOG */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-brand-sage/10">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Culture & Tips</span>
                <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Beauty & Styling Guides</h2>
              </div>

              <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden border border-brand-sage/15 shadow-xs flex flex-col sm:flex-row items-stretch group">
                <div className="sm:w-2/5 aspect-[16/10] sm:aspect-auto bg-zinc-850 relative">
                  <ImageWithFallback 
                    src={INITIAL_BLOG_POSTS[0].image} 
                    alt={INITIAL_BLOG_POSTS[0].title} 
                    iconType="academy"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4 text-left">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded uppercase">Featured Column</span>
                    <h4 className="font-serif font-bold text-brand-dark text-base leading-snug mt-1.5">{INITIAL_BLOG_POSTS[0].title}</h4>
                    <p className="text-xs text-brand-slate leading-relaxed mt-2 line-clamp-3">{INITIAL_BLOG_POSTS[0].excerpt}</p>
                  </div>
                  <button 
                    onClick={() => { navigateTo('blog'); setActiveArticle(INITIAL_BLOG_POSTS[0]); }}
                    className="text-xs font-bold text-brand-primary hover:text-brand-gold hover:underline transition-all cursor-pointer text-left self-start"
                  >
                    Read Featured Article →
                  </button>
                </div>
              </div>

              <div className="text-center mt-10">
                <button 
                  onClick={() => navigateTo('blog')}
                  className="bg-brand-primary text-brand-cream text-xs uppercase font-bold tracking-widest px-8 py-3 rounded-full hover:bg-brand-dark hover:text-white transition-all shadow-md cursor-pointer"
                >
                  Read All Beauty Guides →
                </button>
              </div>
            </section>

            {/* BOTTOM BOOKING DESK TEASER */}
            <section className="bg-brand-dark text-brand-cream py-16 px-4 text-center">
              <div className="max-w-4xl mx-auto space-y-6">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">Ready To Glam?</span>
                <h2 className="text-3xl font-serif text-white">Crown Your Traditional Elegance Today</h2>
                <p className="text-sm text-brand-silver max-w-md mx-auto leading-relaxed">
                  Avoid long waits and disappointment on your wedding or special owambe. Secure your professional gele styling slot in Ibadan with Adeniji Oluwapelumi.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => handleBookNow('')}
                    className="px-8 py-3.5 bg-brand-gold hover:bg-brand-cream text-brand-dark hover:text-brand-primary font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer"
                  >
                    Open Booking Form Scheduler
                  </button>
                  <button 
                    onClick={() => navigateTo('contact')}
                    className="px-8 py-3.5 border border-brand-sage/40 text-white hover:border-brand-gold hover:text-brand-gold font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
                  >
                    Inquire via Message Form
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* -------------------- B. SUBPAGE: FULL ABOUT STORY -------------------- */}
        {activeSection === 'about' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
              
              {/* Left Headshot Column */}
              <div className="lg:col-span-5 relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-brand-sage/20 shadow-xl relative bg-zinc-800">
                  <ImageWithFallback 
                    src={siteImages.artistPortrait || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800"} 
                    alt="Adeniji Oluwapelumi - Gele Stylist Headshot" 
                    iconType="user"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                </div>
                
                {/* Soft decorative Leaf Outline Backdrop element */}
                <div className="absolute -top-6 -right-6 w-24 h-24 border border-brand-gold/30 rounded-full flex items-center justify-center animate-spin-slow">
                  <Sparkles size={24} className="text-brand-gold/40" />
                </div>
              </div>

              {/* Right Brand Story text Column */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div>
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Story</span>
                  <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">About Fabulous Gele</h2>
                </div>

                <div className="text-brand-slate text-sm sm:text-base leading-relaxed space-y-4 font-sans">
                  {BRAND_STORY.paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Statistics indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-brand-sage/20 pt-6">
                  {BRAND_STORY.stats.map((stat, i) => (
                    <div key={i} className="text-center sm:text-left">
                      <p className="text-2xl sm:text-3xl font-serif font-black text-brand-primary">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-brand-slate mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GELE TRANSFORMATION PROCESS VIDEO */}
            <div className="bg-brand-dark rounded-3xl py-12 px-6 text-center text-brand-cream border border-brand-sage/10 mb-16">
              <div className="max-w-3xl mx-auto space-y-6">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">Behind The Artistry</span>
                <h2 className="text-2xl sm:text-3xl font-serif text-white">Watch a Bridal Gele Transformation</h2>
                <p className="text-xs sm:text-sm text-brand-silver max-w-xl mx-auto font-sans">
                  Gele styling is a physical manifestation of high fashion sculpture. Watch how we form precise symmetrical crowns that elevate facial symmetry.
                </p>
                
                <div className="aspect-video max-w-xl mx-auto rounded-2xl overflow-hidden relative shadow-2xl bg-zinc-900 border border-brand-sage/20 group">
                  {brandVideoActive ? (
                    <video
                      src={brandVideoActive}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <>
                      <ImageWithFallback 
                        src="https://images.unsplash.com/photo-1532453242-95cd2a5e9334?auto=format&fit=crop&q=80&w=800" 
                        alt="Traditional African Gele Makeup Video Cover" 
                        iconType="crown"
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-brand-dark/40 flex items-center justify-center">
                        <button
                          onClick={() => setBrandVideoActive('https://www.w3schools.com/html/mov_bbb.mp4')}
                          className="w-16 h-16 bg-brand-gold text-brand-dark rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                          title="Watch tutorial"
                        >
                          <Play size={24} className="fill-brand-dark ml-1" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* AWARDS & PRESS RECOGNITION */}
            <div className="border-t border-brand-sage/25 pt-16 text-center">
              <p className="text-[10px] font-bold tracking-widest text-brand-slate uppercase mb-2">Honors & Public Showcase</p>
              <h3 className="text-2xl font-serif font-black text-brand-dark mb-8">Credibility Confirmed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
                {BRAND_STORY.awards.map((award, i) => {
                  const icons = [
                    <Crown key="1" size={24} className="text-brand-gold shrink-0" />,
                    <Award key="2" size={24} className="text-brand-gold shrink-0" />,
                    <Star key="3" size={24} className="text-brand-gold shrink-0" />
                  ];
                  return (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-brand-sage/20 hover:border-brand-gold/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-brand-gold/10 rounded-xl border border-brand-gold/20">
                            {icons[i] || <Award size={24} className="text-brand-gold shrink-0" />}
                          </div>
                          <span className="font-mono text-[10px] font-bold text-brand-gold bg-brand-gold/5 border border-brand-gold/10 px-2.5 py-0.5 rounded-full ml-auto">
                            {award.year}
                          </span>
                        </div>
                        <p className="font-serif font-black text-brand-dark text-base leading-tight mb-2">{award.name}</p>
                        <p className="text-brand-slate text-xs leading-relaxed mb-4 font-sans">{award.desc}</p>
                      </div>
                      <div className="border-t border-brand-sage/10 pt-3 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-brand-gold" />
                        <p className="font-mono text-[9px] uppercase tracking-wider text-brand-slate font-semibold">
                          By {award.authority}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- C. SUBPAGE: FULL SERVICES -------------------- */}
        {activeSection === 'services' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Offerings</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Signature Styling Services</h2>
              <p className="text-sm text-brand-slate mt-2">Bespoke luxury styling tailored specifically for standard, bridal, and creative styling requirements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const isTraining = service.id === 'gele_training';
                
                return (
                  <div 
                    key={service.id}
                    className="bg-white p-6 rounded-2xl border border-brand-sage/15 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary mb-5">
                        {service.iconName === 'Crown' && <Crown size={24} />}
                        {service.iconName === 'Sparkles' && <Sparkles size={24} />}
                        {service.iconName === 'Camera' && <Camera size={24} />}
                        {service.iconName === 'Users' && <UsersIcon size={24} />}
                        {service.iconName === 'BookOpen' && <BookOpen size={24} />}
                        {service.iconName === 'ShoppingBag' && <ShoppingBag size={24} />}
                        {service.iconName === 'Award' && <Award size={24} />}
                      </div>

                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-xl font-serif font-bold text-brand-dark">{service.name}</h3>
                        <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded">
                          {service.pricingInfo}
                        </span>
                      </div>

                      <p className="text-xs text-brand-slate leading-relaxed mb-6 font-sans">{service.description}</p>

                      <ul className="space-y-2 border-t border-brand-sage/10 pt-4 mb-6">
                        {service.details?.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-brand-dark/90 text-left">
                            <Check size={14} className="text-brand-primary shrink-0 mt-0.5" />
                            <span className="font-sans">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleBookNow(service.id)}
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-center border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all cursor-pointer"
                      >
                        {isTraining ? 'Register for Training' : 'Book Session'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- D. SUBPAGE: FULL PORTFOLIO -------------------- */}
        {activeSection === 'portfolio' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Portfolio</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Crowning Glory Gallery</h2>
              <p className="text-sm text-brand-slate mt-2">Filter through our high-definition catalog of actual clients styled in Ibadan and beyond.</p>
            </div>

            {/* Filter Tab list */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'bridal', label: 'Bridal' },
                { id: 'owambe', label: 'Owambe Glam' },
                { id: 'asoebi', label: 'Aso Ebi Ladies' },
                { id: 'before_after', label: 'Before & After' },
                { id: 'bts', label: 'Behind The Scenes' },
                { id: 'training', label: 'Student Work' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPortfolioFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                    portfolioFilter === tab.id
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'bg-white hover:bg-brand-sage/10 text-brand-dark border border-brand-sage/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPortfolio.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setActiveLightboxImage(item.image)}
                  className="group relative rounded-2xl overflow-hidden aspect-square border border-brand-sage/10 shadow-xs hover:shadow-md cursor-pointer transition-shadow bg-zinc-800"
                >
                  <ImageWithFallback 
                    src={item.image} 
                    alt={item.title} 
                    iconType="crown"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent p-4 flex flex-col justify-end text-left opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-0.5">{item.category}</span>
                    <p className="font-serif font-bold text-white text-sm">{item.title}</p>
                    <span className="text-[10px] text-brand-silver/95 underline mt-1.5 font-medium font-sans">Click to view full photo</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox */}
            {activeLightboxImage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/95 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setActiveLightboxImage(null)} />
                <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center z-10">
                  <button
                    onClick={() => setActiveLightboxImage(null)}
                    className="absolute -top-12 right-0 sm:top-4 sm:-right-12 text-white hover:text-brand-gold transition-colors p-2 cursor-pointer"
                    title="Close Lightbox"
                  >
                    <X size={30} />
                  </button>
                  <ImageWithFallback 
                    src={activeLightboxImage} 
                    alt="Enlarged Portfolio masterpiece" 
                    iconType="crown"
                    className="rounded-xl max-w-full max-h-[80vh] object-contain shadow-2xl border border-brand-sage/20"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- E. SUBPAGE: FULL PRICING -------------------- */}
        {activeSection === 'pricing' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Affordable Luxury</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Pricing Structure & Tiers</h2>
              <p className="text-sm text-brand-slate mt-2">Transparent, competitive packages. Styled beautifully without compromise.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              
              {/* Bridal Gele Panel */}
              <div className="bg-white border-2 border-brand-primary rounded-3xl p-6 relative shadow-md flex flex-col justify-between">
                <div className="absolute -top-3 left-6 bg-brand-primary text-brand-cream text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-sans">
                  Bespoke Bridal
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-black text-brand-dark">Bridal Gele</h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-sans">Crown styling for the gorgeous traditional bride. Includes home styling.</p>
                  <div className="space-y-2 border-t border-brand-sage/10 pt-4 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Home Service (Ibadan):</span>
                      <span className="font-bold text-brand-primary font-mono">₦30,000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Outside Ibadan:</span>
                      <span className="font-bold text-brand-primary font-mono">₦70,000</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleBookNow('bridal_gele')}
                  className="w-full mt-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-dark cursor-pointer font-sans"
                >
                  Inquire & Book
                </button>
              </div>

              {/* Party & Photoshoots Panel */}
              <div className="bg-white border border-brand-sage/20 rounded-3xl p-6 relative flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-black text-brand-dark">Glam & Shoots</h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-sans">Perfect symmetrical wraps optimized for studio photography and owambes.</p>
                  <div className="space-y-2 border-t border-brand-sage/10 pt-4 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Party Guests (Each):</span>
                      <span className="font-bold text-brand-primary font-mono">₦15,000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Photoshoot Gele:</span>
                      <span className="font-bold text-brand-primary font-mono">₦15,000</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleBookNow('party_guests')}
                  className="w-full mt-6 py-2.5 border border-brand-primary text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white cursor-pointer font-sans"
                >
                  Inquire & Book
                </button>
              </div>

              {/* Aso Ebi Group Panel */}
              <div className="bg-white border border-brand-sage/20 rounded-3xl p-6 relative flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-black text-brand-dark">Group / Squad</h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-sans">Styled in groups to guarantee a magnificent, unified appearance for bridesmaids or squad.</p>
                  <div className="space-y-2 border-t border-brand-sage/10 pt-4 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Aso Ebi Ladies:</span>
                      <span className="font-bold text-brand-primary font-mono">₦10,000</span>
                    </div>
                    <p className="text-[10px] text-brand-slate italic mt-1 leading-normal font-sans">*Requires a minimum cohort of 5 guests to qualify for pricing.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleBookNow('aso_target')}
                  className="w-full mt-6 py-2.5 border border-brand-primary text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white cursor-pointer font-sans"
                >
                  Inquire & Book
                </button>
              </div>

              {/* Training Class panel */}
              <div className="bg-white border border-brand-sage/20 rounded-3xl p-6 relative flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-black text-brand-dark">Training Courses</h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-sans">Comprehensive masterclass training. Learn modern folds and customer relations.</p>
                  <div className="space-y-2 border-t border-brand-sage/10 pt-4 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Beginners Class:</span>
                      <span className="font-bold text-brand-primary font-mono">₦50,000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Upgrade Class:</span>
                      <span className="font-bold text-brand-primary font-mono">₦70,000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-slate font-medium">Masterclass Pro:</span>
                      <span className="font-bold text-brand-primary font-mono">₦100,000</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleBookNow('gele_training')}
                  className="w-full mt-6 py-2.5 border border-brand-primary text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white cursor-pointer font-sans"
                >
                  Enroll In Academy
                </button>
              </div>

            </div>

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-100/50 rounded-lg inline-flex items-center gap-1.5 px-4 py-2 font-mono">
                <AlertTriangle size={14} className="text-red-600" />
                <span>Policy: No refund after payment.</span>
              </p>
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer font-sans"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- F. SUBPAGE: FULL SHOP CATALOG -------------------- */}
        {activeSection === 'shop' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Our Boutique Shop</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Ready-to-Wear Auto Gele & Fabrics</h2>
              <p className="text-sm text-brand-slate mt-2 font-sans">Skip the wrap sessions with our high-end, elegant ready-made auto geles and traditional accessories.</p>
            </div>

            {/* Search + Category tab filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Catalog' },
                  { id: 'Auto Gele', label: 'Auto Gele' },
                  { id: 'Fabrics', label: 'Premium Fabrics' },
                  { id: 'Senator Caps', label: 'Senator Caps' },
                  { id: 'Accessories', label: 'Accessories' }
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setShopCategory(category.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                      shopCategory === category.id
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'bg-white hover:bg-brand-sage/10 text-brand-dark border border-brand-sage/10'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:max-w-xs shrink-0">
                <span className="absolute left-3 top-3 text-brand-slate">
                  <Search size={16} />
                </span>
                <input 
                  type="text"
                  placeholder="Search boutique items..."
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  className="w-full bg-white pl-9 pr-4 py-2 rounded-xl text-xs border border-brand-sage/20 text-brand-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-brand-slate bg-white rounded-2xl border border-brand-sage/10 italic font-sans">
                  No products found matching your active filter.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const whatsappMessage = encodeURIComponent(
                    `Hello Fabulous Gele Artistry! I would love to order the following boutique item:\n\n- *Product:* ${p.name}\n- *Price:* ₦${p.price.toLocaleString()}\n- *Category:* ${p.category}\n\nPlease let me know if this is currently available so I can make my deposit.`
                  );
                  const whatsappPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '2348162067064';
                  const orderLink = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

                  return (
                    <div 
                      key={p.id}
                      className="p-[1.5px] rounded-[28px] bg-gradient-to-br from-amber-400/50 via-brand-sage/25 to-brand-primary/35 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group overflow-hidden flex flex-col"
                    >
                      <div className="bg-white rounded-[calc(28px-1.5px)] h-full overflow-hidden flex flex-col justify-between">
                        <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900 border-b border-brand-sage/10 rounded-t-[calc(28px-1.5px)]">
                          <ImageWithFallback 
                            src={p.image} 
                            alt={p.name} 
                            iconType="bag"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="bg-brand-dark/80 backdrop-blur-xs text-brand-cream text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                              {p.category}
                            </span>
                            {p.inStock ? (
                              <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                                Ready
                              </span>
                            ) : (
                              <span className="bg-zinc-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-serif font-bold text-brand-dark text-base">{p.name}</h4>
                              <span className="font-mono font-bold text-brand-primary text-sm shrink-0">
                                ₦{p.price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-brand-slate leading-relaxed font-sans">{p.description}</p>
                          </div>

                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleBookNow('ready_to_wear');
                              }}
                              className="inline-flex items-center justify-center gap-1 py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider bg-brand-primary hover:bg-brand-dark text-white rounded-xl transition-colors text-center cursor-pointer font-sans"
                            >
                              <span>Order via Form</span>
                            </button>

                            <a 
                              href={orderLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                saveOrderToFirestore({
                                  clientName: 'WhatsApp Order Client',
                                  clientEmail: '',
                                  clientPhone: '',
                                  itemTitle: p.name,
                                  itemType: 'product',
                                  amount: p.price,
                                  notes: `Category: ${p.category}`,
                                  status: 'pending'
                                }).catch(err => console.warn('Non-blocking Firestore order save warning:', err));
                                setOrdersCount(prev => prev + 1);
                              }}
                              className="inline-flex items-center justify-center gap-1 py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors text-center cursor-pointer font-sans"
                            >
                              <Send size={11} className="fill-current" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- G. SUBPAGE: FABULOUS GELE ACADEMY -------------------- */}
        {activeSection === 'training' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            
            <AcademySection 
              onRegister={(tierName) => {
                handleBookNow('gele_training');
              }}
            />

            {/* TESTIMONIALS SLIDER SECTION INSIDE ACADEMY */}
            <div className="border-t border-brand-sage/15 pt-16 mt-16">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Academy Reviews & Testimonials</span>
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-dark">Words From Our Graduates & Royalty</h2>
                <p className="text-sm text-brand-slate mt-2 font-sans">Discover what graduate students and elegant brides say about Fabulous Gele Academy.</p>
              </div>

              <Testimonials testimonials={testimonials} />
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer font-sans"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- H. SUBPAGE: FULL CULTURAL BLOG -------------------- */}
        {activeSection === 'blog' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Beauty & Styling Blog</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Culture, Tips & Bridal Guides</h2>
              <p className="text-sm text-brand-slate mt-2 font-sans">Insights on styling matching, comfort tips, and common gele mistakes to avoid on your wedding day.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white rounded-3xl overflow-hidden border border-brand-sage/15 shadow-xs flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] relative bg-zinc-800 border-b border-brand-sage/10">
                    <ImageWithFallback 
                      src={post.image} 
                      alt={post.title} 
                      iconType="academy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 left-3 bg-brand-dark/80 text-brand-cream text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-sans">
                      {post.date}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-left">
                      <h4 className="font-serif font-bold text-brand-dark text-base leading-snug line-clamp-2">{post.title}</h4>
                      <p className="text-xs text-brand-slate leading-relaxed line-clamp-3 font-sans">{post.excerpt}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-brand-sage/10 pt-4">
                      <span className="text-[10px] font-mono font-bold text-brand-slate">{post.readTime}</span>
                      <button
                        onClick={() => setActiveArticle(post)}
                        className="text-xs font-bold text-brand-primary hover:text-brand-gold hover:underline transition-all cursor-pointer font-sans"
                      >
                        Read Full Guide →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Blog Article Detail Modal Lightbox */}
            {activeArticle && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setActiveArticle(null)} />
                
                <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden border border-brand-sage/20">
                  
                  {/* Header Image */}
                  <div className="aspect-video relative bg-zinc-950">
                    <ImageWithFallback 
                      src={activeArticle.image} 
                      alt={activeArticle.title} 
                      iconType="academy"
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => setActiveArticle(null)}
                      className="absolute top-4 right-4 w-9 h-9 bg-brand-dark text-white hover:bg-brand-primary rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                      title="Close Guide"
                    >
                      <X size={18} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-6 text-white text-xs text-left">
                      <p className="font-serif italic text-brand-gold">Fabulous Gele Academy</p>
                      <p className="text-[10px] opacity-75">{activeArticle.date} • {activeArticle.readTime}</p>
                    </div>
                  </div>

                  {/* Scrolling Article text Body */}
                  <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4 text-left">
                    <h3 className="text-2xl font-serif font-black text-brand-dark">{activeArticle.title}</h3>
                    <div className="text-brand-slate text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
                      {activeArticle.content}
                    </div>
                  </div>

                  <div className="bg-brand-cream border-t border-brand-sage/10 p-4 flex justify-between items-center text-xs">
                    <span className="text-brand-slate font-sans">Fabulous Gele Artistry, Ibadan</span>
                    <button
                      onClick={() => {
                        setActiveArticle(null);
                        handleBookNow('gele_training');
                      }}
                      className="px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition-colors cursor-pointer font-sans"
                    >
                      Join Training Masterclass
                    </button>
                  </div>

                </div>
              </div>
            )}

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- I. SUBPAGE: CONTACT & FAQS -------------------- */}
        {activeSection === 'contact' && (
          <section className="animate-fadeIn">
            <div className="bg-brand-dark text-brand-cream py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Details block Column */}
                <div className="lg:col-span-5 space-y-6 text-left">
                  <div>
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block mb-1">Get In Touch</span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-white">Contact Our Studio</h2>
                    <p className="text-xs text-brand-silver mt-2 leading-relaxed font-sans">
                      Connect directly with Adeniji Oluwapelumi. Visit our physical studio or request private wedding travels across Nigeria.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs font-medium text-brand-silver font-sans">
                    
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">Physical Location</p>
                        <p className="text-[11px] opacity-85 mt-0.5">Ibadan, Oyo State, Nigeria</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">Call / WhatsApp Channel</p>
                        <p className="text-[11px] opacity-85 mt-0.5">+234 816 206 7064</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">Email Communications</p>
                        <a href="mailto:fabulousgeleartistry@gmail.com" className="text-[11px] opacity-85 mt-0.5 hover:text-brand-gold transition-colors block">
                          fabulousgeleartistry@gmail.com
                        </a>
                      </div>
                    </div>

                  </div>

                  {/* Social handles links */}
                  <div className="border-t border-brand-sage/10 pt-6 space-y-3">
                    <p className="text-[10px] font-bold text-brand-gold uppercase tracking-wider font-sans">Follow Our Artistry</p>
                    <div className="flex items-center gap-4 text-brand-silver">
                      <a 
                        href="https://instagram.com/fabulousgele_artistry" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-brand-gold transition-colors cursor-pointer"
                        title="Instagram Page"
                      >
                        <Instagram size={20} />
                      </a>
                      <a 
                        href="https://tiktok.com/@fabulousgele_artistry" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-brand-gold transition-colors cursor-pointer"
                        title="TikTok Reels"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39-.28-.2-.54-.43-.78-.68-.06-.05-.12-.05-.16 0-.08 1.94-.03 3.88-.04 5.82a7.51 7.51 0 01-1.33 4.29c-1.4 1.98-3.79 3.19-6.24 3.11-2.43-.07-4.79-1.37-5.99-3.48-1.23-2.12-1.15-4.88.2-6.9 1.25-1.92 3.49-3.08 5.78-3.01.27.01.55.03.82.08v4.04c-.31-.1-.64-.13-.97-.13a3.48 3.48 0 00-3.43 3.87 3.51 3.51 0 004.14 3c1.37-.26 2.39-1.4 2.5-2.79.08-1.57.03-3.15.05-4.72.01-2.31.01-4.62.01-6.93 0-.08-.03-.12-.11-.12H12.52c-.01 0-.01-.01 0-.01z" />
                        </svg>
                      </a>
                      <a 
                        href="https://facebook.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-brand-gold transition-colors cursor-pointer"
                        title="Facebook Group"
                      >
                        <Facebook size={20} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Direct Inbox Message Form Column */}
                <div className="lg:col-span-7 bg-white/5 border border-brand-sage/15 p-6 sm:p-8 rounded-3xl">
                  <h4 className="font-serif text-lg font-bold text-white mb-6 text-left">Send Us a Direct Message</h4>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const fData = new FormData(form);
                      const data = Object.fromEntries(fData.entries());
                      const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/xlgqlkvz";
                      
                      // Save client inquiry to Firestore
                      saveClientToFirestore({
                        name: String(data.name || ''),
                        email: String(data.email || ''),
                        phone: '',
                        notes: `Topic: ${data.subject || 'Direct Inquiry'}. Message: ${data.message || ''}`
                      }).catch(err => console.warn('Non-blocking Firestore client save warning:', err));

                      if (endpoint && endpoint.trim() !== "") {
                        try {
                          await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            body: JSON.stringify({
                              subject: `Contact Message: ${data.subject || 'Direct Inquiry'}`,
                              name: data.name,
                              email: data.email,
                              message: data.message
                            })
                          });
                        } catch (err) {
                          console.info("Formspree webhook dispatch info (saved to Firestore):", err);
                        }
                      }
                      alert('Thank you for contacting Fabulous Gele Artistry! Your message has been sent successfully. We will email or text you within 2 hours.');
                      form.reset();
                    }}
                    className="space-y-4 text-xs text-brand-dark"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-brand-silver font-semibold uppercase tracking-wider block font-sans">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          required 
                          placeholder="Enter your name"
                          className="w-full p-3 bg-white/10 border border-brand-sage/20 rounded-xl text-white focus:outline-none focus:border-brand-gold text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-brand-silver font-semibold uppercase tracking-wider block font-sans">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          required 
                          placeholder="name@gmail.com"
                          className="w-full p-3 bg-white/10 border border-brand-sage/20 rounded-xl text-white focus:outline-none focus:border-brand-gold text-xs font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-brand-silver font-semibold uppercase tracking-wider block font-sans">Subject Topic</label>
                      <input 
                        type="text" 
                        name="subject"
                        required 
                        placeholder="e.g. Wedding Booking In Ibadan"
                        className="w-full p-3 bg-white/10 border border-brand-sage/20 rounded-xl text-white focus:outline-none focus:border-brand-gold text-xs font-sans"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-brand-silver font-semibold uppercase tracking-wider block font-sans">Your Message</label>
                      <textarea 
                        name="message"
                        rows={4} 
                        required 
                        placeholder="Describe your requested service dates, fabric colors, custom needs..."
                        className="w-full p-3 bg-white/10 border border-brand-sage/20 rounded-xl text-white focus:outline-none focus:border-brand-gold text-xs font-sans"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-brand-gold text-brand-dark hover:bg-brand-cream hover:text-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer font-sans"
                    >
                      Send Message
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* FREQUENTLY ASKED QUESTIONS Accordion */}
            <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Common Inquiries</span>
                <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Frequently Asked Questions</h2>
                <p className="text-sm text-brand-slate mt-2 font-sans">Everything you need to know about traditional gele sessions, booking travel guidelines, and masterclasses.</p>
              </div>

              <div className="space-y-3.5">
                {INITIAL_FAQS.map((faq, i) => {
                  const isOpen = faqOpenIndex === i;
                  return (
                    <div 
                      key={i} 
                      className="bg-white border border-brand-sage/15 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                        className="w-full p-5 text-left flex items-center justify-between font-serif font-bold text-brand-dark hover:text-brand-primary transition-colors cursor-pointer"
                      >
                        <span className="text-sm sm:text-base">{faq.question}</span>
                        <span className="text-brand-primary shrink-0 ml-4">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-slate leading-relaxed border-t border-brand-sage/5 animate-fadeIn text-left font-sans">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pb-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

        {/* -------------------- J. SUBPAGE: APPOINTMENT BOOKING FLOW -------------------- */}
        {activeSection === 'booking' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">Make Appointment</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Book Your Custom Styling Slot</h2>
              <p className="text-sm text-brand-slate mt-2 font-sans">Provide your date, location, and contact information below. Submits safely to our inbox.</p>
            </div>

            <BookingForm 
              services={services} 
              preSelectedServiceId={selectedBookingServiceId} 
              onBookingComplete={handleIncrementOrdersCount} 
            />

            <div className="text-center mt-12">
              <button 
                onClick={() => navigateTo('home')}
                className="text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-brand-gold hover:underline cursor-pointer font-sans"
              >
                ← Back to Home
              </button>
            </div>
          </section>
        )}

      </main>

      {/* ==================== SITE FOOTER ==================== */}
      <footer className="bg-brand-dark border-t border-brand-sage/10 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-brand-silver">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col items-center justify-center">
            <Logo size="lg" />
            <p className="text-[10px] tracking-widest text-brand-slate uppercase mt-3">Crown of Elegance & Cultural Proud Artistry</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-brand-slate uppercase tracking-widest font-semibold">
            <button onClick={() => navigateTo('home')} className="hover:text-brand-gold transition-colors cursor-pointer">Home</button>
            <button onClick={() => navigateTo('about')} className="hover:text-brand-gold transition-colors cursor-pointer">About</button>
            <button onClick={() => navigateTo('services')} className="hover:text-brand-gold transition-colors cursor-pointer">Services</button>
            <button onClick={() => navigateTo('portfolio')} className="hover:text-brand-gold transition-colors cursor-pointer">Portfolio</button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-brand-gold transition-colors cursor-pointer">Pricing</button>
            <button onClick={() => navigateTo('shop')} className="hover:text-brand-gold transition-colors cursor-pointer">Shop</button>
            <button onClick={() => navigateTo('training')} className="hover:text-brand-gold transition-colors cursor-pointer">Academy</button>
            <button onClick={() => navigateTo('contact')} className="hover:text-brand-gold transition-colors cursor-pointer">Contact</button>
          </div>

          <p className="text-[10px] text-brand-slate/85 max-w-md mx-auto leading-relaxed font-mono">
            © {new Date().getFullYear()} Fabulous Gele Artistry. Ibadan, Oyo State, Nigeria. <br />
            All Rights Reserved. No refund after payment policy holds strictly on deposits.
          </p>

        </div>
      </footer>

      {/* FLOATING ACTIVE WHATSAPP BUTTON */}
      <FloatingWhatsApp />

      {/* ADMINISTRATIVE BACKEND PANEL TRIGGER */}
      <AdminDashboard 
        products={products}
        setProducts={setProducts}
        services={services}
        setServices={setServices}
        promoBanner={promoBanner}
        setPromoBanner={setPromoBanner}
        articles={articles}
        setArticles={setArticles}
        gallery={gallery}
        setGallery={setGallery}
        siteImages={siteImages}
        setSiteImages={setSiteImages}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        ordersInitiated={ordersCount}
        resetOrdersCount={handleResetOrdersCount}
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

    </div>
  );
}

// Custom UsersIcon fallback component
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
