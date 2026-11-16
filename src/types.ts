export interface Service {
  id: string;
  name: string;
  description: string;
  pricingInfo: string;
  priceValue?: number; // raw value for any default pricing reference
  tiers?: { name: string; price: string }[];
  details?: string[];
  iconName: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  inStock: boolean;
}

export interface Booking {
  serviceId: string;
  date: string;
  time: string;
  location: string;
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text?: string;
  stars: number;
  image: string;
  isVideo: boolean;
  videoThumbnail?: string;
  videoUrl?: string;
}

export interface GalleryItem {
  id: string;
  category: 'bridal' | 'owambe' | 'asoebi' | 'before_after' | 'bts' | 'training';
  title: string;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category?: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  author?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PromoBanner {
  text: string;
  isActive: boolean;
  linkText?: string;
}

export interface SiteImages {
  heroImage: string;
  heroBadgeText?: string;
  artistPortrait: string;
  academyBanner: string;
  testimonialBanner?: string;
}

