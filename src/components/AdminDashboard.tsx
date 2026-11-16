import React, { useState, useEffect } from 'react';
import { Shield, Key, Eye, EyeOff, LayoutDashboard, ShoppingBag, DollarSign, Megaphone, Trash2, Plus, Edit2, Check, RefreshCw, X, AlertCircle, Database, Phone, Mail, Clock, Upload, Image as ImageIcon, BookOpen, FileText, TrendingUp, BarChart2, Calendar, Layers, Quote, Star, Video, Play, HelpCircle, Info, Sparkles, ChevronDown, ChevronUp, PhoneCall, MessageSquare, ExternalLink, Download } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Product, Service, PromoBanner, BlogPost, GalleryItem, SiteImages, Testimonial } from '../types';
import { fetchOrdersFromFirestore, OrderRecord, saveProductToFirestore, deleteProductFromFirestore, fetchProductsFromFirestore, saveArticleToFirestore, deleteArticleFromFirestore, fetchArticlesFromFirestore, saveServicesToFirestore, savePromoBannerToFirestore, saveGalleryItemToFirestore, deleteGalleryItemFromFirestore, fetchGalleryFromFirestore, saveSiteImagesToFirestore, fetchSiteImagesFromFirestore, compressImage, saveTestimonialToFirestore, deleteTestimonialFromFirestore, fetchTestimonialsFromFirestore, exportOrdersToCSV } from '../firebase';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  promoBanner: PromoBanner;
  setPromoBanner: (banner: PromoBanner) => void;
  articles: BlogPost[];
  setArticles: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  siteImages: SiteImages;
  setSiteImages: React.Dispatch<React.SetStateAction<SiteImages>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  ordersInitiated: number;
  resetOrdersCount: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// ==========================================
// CLIENT SECURITY CONFIGURATION
// ==========================================
// Admin password is read dynamically from:
// 1. localStorage (if admin changed it in dashboard)
// 2. import.meta.env.VITE_ADMIN_PASSWORD (set in Netlify environment variables)
// 3. Fallback default password
const DEFAULT_ADMIN_PASSWORD = "fabulous2026"; 

const getStoredAdminPassword = (): string => {
  const customPass = localStorage.getItem('fabulous_admin_password');
  if (customPass) return customPass;
  return import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}; 

// ==========================================
// CHART HELPERS & DATA PARSER
// ==========================================
const parseOrderDate = (ord: OrderRecord): Date => {
  if (ord.createdAt) {
    if (typeof ord.createdAt.toDate === 'function') {
      return ord.createdAt.toDate();
    }
    if (typeof ord.createdAt.seconds === 'number') {
      return new Date(ord.createdAt.seconds * 1000);
    }
    if (ord.createdAt instanceof Date) {
      return ord.createdAt;
    }
    if (typeof ord.createdAt === 'string' || typeof ord.createdAt === 'number') {
      const parsed = new Date(ord.createdAt);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  if (ord.date) {
    const parsed = new Date(ord.date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const get30DaysTrendData = (orders: OrderRecord[]) => {
  const days: { dateKey: string; label: string; total: number; booking: number; product: number; academy: number }[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({
      dateKey,
      label,
      total: 0,
      booking: 0,
      product: 0,
      academy: 0
    });
  }

  const map = new Map(days.map(item => [item.dateKey, item]));

  orders.forEach(ord => {
    const d = parseOrderDate(ord);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const target = map.get(dateKey);
    if (target) {
      target.total += 1;
      if (ord.itemType === 'booking') target.booking += 1;
      else if (ord.itemType === 'academy') target.academy += 1;
      else target.product += 1;
    }
  });

  return days;
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl text-xs border border-zinc-800 space-y-1.5 font-sans">
        <p className="font-bold border-b border-zinc-800 pb-1 text-amber-400">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard({
  products,
  setProducts,
  services,
  setServices,
  promoBanner,
  setPromoBanner,
  articles,
  setArticles,
  gallery,
  setGallery,
  siteImages,
  setSiteImages,
  testimonials,
  setTestimonials,
  ordersInitiated,
  resetOrdersCount,
  isOpen,
  onClose
}: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'products' | 'articles' | 'promo' | 'gallery' | 'site_pictures' | 'testimonials' | 'orders'>('overview');
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'booking' | 'product' | 'academy'>('all');
  const [firestoreOrders, setFirestoreOrders] = useState<OrderRecord[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'overview') {
      loadOrders();
    }
    if (activeTab === 'articles') {
      loadArticlesFromFirestore();
    }
    if (activeTab === 'gallery') {
      loadGalleryFromFirestore();
    }
    if (activeTab === 'site_pictures') {
      loadSiteImagesFromFirestore();
    }
    if (activeTab === 'testimonials') {
      loadTestimonialsFromFirestore();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const fetched = await fetchOrdersFromFirestore();
      setFirestoreOrders(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Product form & Firestore sync states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Auto Gele',
    image: '',
    description: '',
    inStock: true
  });

  // Load products from Firestore
  const loadProductsFromFirestore = async () => {
    setIsLoadingProducts(true);
    try {
      const fetched = await fetchProductsFromFirestore();
      if (fetched && fetched.length > 0) {
        setProducts(fetched.map(p => ({
          id: p.id || 'p_' + Math.random(),
          name: p.name,
          price: p.price,
          category: p.category as any,
          image: p.image,
          description: p.description,
          inStock: p.inStock ?? true
        })));
      }
    } catch (e) {
      console.error('Error fetching products from Firestore:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Image file handler (converting uploaded device photo to compressed Base64 for Firestore)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressedData = await compressImage(file, 1000, 1000, 0.8);
      setProductForm(prev => ({ ...prev, image: compressedData }));
    } catch (err) {
      console.error('Error processing image file:', err);
      alert('Failed to process image file. Please choose another image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Service editing states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [servicePriceInput, setServicePriceInput] = useState('');

  // Article CRUD states
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isUploadingArticleImage, setIsUploadingArticleImage] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'Bridal Guide',
    excerpt: '',
    content: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: '4 min read',
    image: '',
    author: 'Oluwapelumi - Lead Artist'
  });

  // Gallery CRUD & image upload states
  const [isAddingGalleryItem, setIsAddingGalleryItem] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | GalleryItem['category']>('all');
  const [galleryForm, setGalleryForm] = useState<{
    title: string;
    category: GalleryItem['category'];
    image: string;
  }>({
    title: '',
    category: 'bridal',
    image: ''
  });

  const loadGalleryFromFirestore = async () => {
    setIsLoadingGallery(true);
    try {
      const fetched = await fetchGalleryFromFirestore();
      if (fetched && fetched.length > 0) {
        setGallery(fetched);
      }
    } catch (e) {
      console.error('Error fetching gallery from Firestore:', e);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleGalleryImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGalleryImage(true);
    try {
      const compressedData = await compressImage(file, 1200, 1200, 0.8);
      setGalleryForm(prev => ({ ...prev, image: compressedData }));
    } catch (err) {
      console.error('Error processing gallery image:', err);
      alert('Failed to process photo file. Please choose another image.');
    } finally {
      setIsUploadingGalleryImage(false);
    }
  };

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      category: 'bridal',
      image: ''
    });
    setIsAddingGalleryItem(false);
    setEditingGalleryItem(null);
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title.trim()) {
      alert('Please enter a photo title/description.');
      return;
    }
    if (!galleryForm.image.trim()) {
      alert('Please upload a photo or provide an image URL.');
      return;
    }

    const payload = {
      title: galleryForm.title.trim(),
      category: galleryForm.category,
      image: galleryForm.image.trim()
    };

    try {
      const firestoreId = await saveGalleryItemToFirestore(payload);
      const newItem: GalleryItem = {
        id: firestoreId,
        ...payload
      };
      setGallery(prev => [newItem, ...prev]);
      resetGalleryForm();
      alert('✨ Photo successfully added to Portfolio Gallery and database!');
    } catch (err) {
      console.warn('Firestore gallery save warning:', err);
    }
  };

  const handleStartEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setIsAddingGalleryItem(false);
    setGalleryForm({
      title: item.title,
      category: item.category,
      image: item.image
    });
  };

  const handleSaveEditedGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem) return;
    if (!galleryForm.title.trim()) {
      alert('Please enter a photo title.');
      return;
    }
    if (!galleryForm.image.trim()) {
      alert('Please upload a photo or provide an image URL.');
      return;
    }

    const updatedPayload = {
      id: editingGalleryItem.id,
      title: galleryForm.title.trim(),
      category: galleryForm.category,
      image: galleryForm.image.trim()
    };

    try {
      await saveGalleryItemToFirestore(updatedPayload);
    } catch (err) {
      console.warn('Firestore gallery update warning:', err);
    }

    setGallery(prev => prev.map(g => {
      if (g.id === editingGalleryItem.id) {
        return {
          ...g,
          title: galleryForm.title.trim(),
          category: galleryForm.category,
          image: galleryForm.image.trim()
        };
      }
      return g;
    }));

    resetGalleryForm();
    alert('✨ Portfolio photo updated successfully!');
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo from the portfolio gallery? It will be permanently removed from the database.')) {
      try {
        await deleteGalleryItemFromFirestore(id);
      } catch (err) {
        console.warn('Firestore gallery deletion warning:', err);
      }
      setGallery(prev => prev.filter(g => g.id !== id));
    }
  };

  // Site Pictures modification states
  const [siteImagesForm, setSiteImagesForm] = useState<SiteImages>({
    heroImage: siteImages.heroImage || '',
    heroBadgeText: siteImages.heroBadgeText || 'Master Artisan Showcase',
    artistPortrait: siteImages.artistPortrait || '',
    academyBanner: siteImages.academyBanner || '',
    testimonialBanner: siteImages.testimonialBanner || ''
  });
  const [isSavingSiteImages, setIsSavingSiteImages] = useState(false);
  const [isLoadingSiteImages, setIsLoadingSiteImages] = useState(false);

  // Testimonials management states
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isUploadingTestimonialPic, setIsUploadingTestimonialPic] = useState(false);
  const [isUploadingVideoThumb, setIsUploadingVideoThumb] = useState(false);
  const [isUploadingVideoFile, setIsUploadingVideoFile] = useState(false);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false);

  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    stars: 5,
    text: '',
    image: '',
    isVideo: false,
    videoThumbnail: '',
    videoUrl: ''
  });

  useEffect(() => {
    setSiteImagesForm({
      heroImage: siteImages.heroImage || '',
      heroBadgeText: siteImages.heroBadgeText || 'Master Artisan Showcase',
      artistPortrait: siteImages.artistPortrait || '',
      academyBanner: siteImages.academyBanner || '',
      testimonialBanner: siteImages.testimonialBanner || ''
    });
  }, [siteImages]);

  const loadSiteImagesFromFirestore = async () => {
    setIsLoadingSiteImages(true);
    try {
      const fetched = await fetchSiteImagesFromFirestore();
      if (fetched && fetched.heroImage) {
        setSiteImages(fetched);
        setSiteImagesForm(fetched);
      }
    } catch (e) {
      console.error('Error fetching site images:', e);
    } finally {
      setIsLoadingSiteImages(false);
    }
  };

  const handleFileUploadForSitePicture = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SiteImages
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedData = await compressImage(file, 1200, 1200, 0.8);
      setSiteImagesForm(prev => ({ ...prev, [field]: compressedData }));
    } catch (err) {
      console.error('Error processing site image:', err);
      alert('Failed to process image file.');
    }
  };

  const handleSaveSiteImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSiteImages(true);
    try {
      await saveSiteImagesToFirestore(siteImagesForm);
      setSiteImages(siteImagesForm);
      alert('✨ Website pictures updated successfully! Changes are now live on the website across the hero, about, academy, and testimonial sections.');
    } catch (err) {
      console.warn('Firestore save site images warning:', err);
    } finally {
      setIsSavingSiteImages(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminPassword = getStoredAdminPassword();
    if (password.trim() === currentAdminPassword.trim()) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect Admin Credentials. Please try again.');
    }
  };

  // Promo operations
  const handleUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePromoBannerToFirestore(promoBanner);
    alert('Promo Banner updated successfully in database!');
  };

  // Service price edit operations
  const handleEditServicePrice = (serviceId: string, currentPrice: string) => {
    setEditingServiceId(serviceId);
    setServicePriceInput(currentPrice);
  };

  const handleSaveServicePrice = async (serviceId: string) => {
    if (!servicePriceInput.trim()) return;
    const updatedServices = services.map(s => {
      if (s.id === serviceId) {
        return { ...s, pricingInfo: servicePriceInput };
      }
      return s;
    });
    setServices(updatedServices);
    await saveServicesToFirestore(updatedServices);
    setEditingServiceId(null);
  };

  // Product operations with Firestore active synchronization
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please fill out Name and Price');
      return;
    }

    const priceNum = parseFloat(productForm.price.replace(/[^\d.]/g, ''));
    if (isNaN(priceNum)) {
      alert('Invalid price amount');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1605493743455-c5d45230985f?auto=format&fit=crop&q=80&w=800';
    const finalImage = productForm.image || defaultImg;

    const newProdPayload = {
      name: productForm.name,
      price: priceNum,
      category: productForm.category,
      image: finalImage,
      description: productForm.description || 'Exclusive Gele styling & fabric asset',
      inStock: productForm.inStock
    };

    try {
      // Actively save to Firestore database
      const docId = await saveProductToFirestore(newProdPayload);
      const createdProd: Product = {
        id: docId,
        ...newProdPayload
      };
      setProducts(prev => [createdProd, ...prev.filter(p => p.id !== docId)]);
      alert('✨ Product successfully created and saved live to database!');
    } catch (err) {
      console.warn('Firestore product creation warning:', err);
      // Local fallback
      const fallbackProd: Product = {
        id: 'p_custom_' + Date.now(),
        ...newProdPayload
      };
      setProducts(prev => [fallbackProd, ...prev]);
      alert('Product saved locally. Check connection for live database sync.');
    }

    setIsAddingProduct(false);
    resetProductForm();
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price.toString(),
      category: prod.category,
      image: prod.image,
      description: prod.description,
      inStock: prod.inStock
    });
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(productForm.price.replace(/[^\d.]/g, ''));
    if (isNaN(priceNum)) {
      alert('Invalid price amount');
      return;
    }

    const updatedPayload = {
      id: editingProduct.id,
      name: productForm.name,
      price: priceNum,
      category: productForm.category,
      image: productForm.image,
      description: productForm.description,
      inStock: productForm.inStock
    };

    try {
      // Actively save update to Firestore database
      await saveProductToFirestore(updatedPayload);
      alert('✨ Product updated live in database!');
    } catch (err) {
      console.warn('Firestore product update warning:', err);
    }

    setProducts(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: productForm.name,
          price: priceNum,
          category: productForm.category,
          image: productForm.image,
          description: productForm.description,
          inStock: productForm.inStock
        };
      }
      return p;
    }));

    setEditingProduct(null);
    resetProductForm();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? It will be removed permanently from the Firestore live database.')) {
      try {
        await deleteProductFromFirestore(id);
        alert('✨ Product deleted from database!');
      } catch (err) {
        console.warn('Firestore product deletion warning:', err);
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      category: 'Auto Gele',
      image: '',
      description: '',
      inStock: true
    });
  };

  // Article CRUD handlers

  const loadArticlesFromFirestore = async () => {
    setIsLoadingArticles(true);
    try {
      const fetched = await fetchArticlesFromFirestore();
      if (fetched && fetched.length > 0) {
        setArticles(fetched.map(a => ({
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
      }
    } catch (e) {
      console.error('Error fetching articles from Firestore:', e);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const handleArticleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingArticleImage(true);
    try {
      const compressedData = await compressImage(file, 1000, 1000, 0.8);
      setArticleForm(prev => ({ ...prev, image: compressedData }));
    } catch (err) {
      console.error('Error processing article image:', err);
      alert('Failed to process image file.');
    } finally {
      setIsUploadingArticleImage(false);
    }
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: '',
      category: 'Bridal Guide',
      excerpt: '',
      content: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '4 min read',
      image: '',
      author: 'Oluwapelumi - Lead Artist'
    });
    setEditingArticle(null);
    setIsAddingArticle(false);
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      alert('Please fill out Article Title and Full Content');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800';
    const finalImage = articleForm.image || defaultImg;

    const newArticlePayload = {
      title: articleForm.title,
      category: articleForm.category,
      excerpt: articleForm.excerpt || articleForm.content.slice(0, 120) + '...',
      content: articleForm.content,
      date: articleForm.date || 'Recent',
      readTime: articleForm.readTime || '4 min read',
      image: finalImage,
      author: articleForm.author || 'Oluwapelumi - Lead Artist'
    };

    try {
      const docId = await saveArticleToFirestore(newArticlePayload);
      const createdArticle: BlogPost = {
        id: docId,
        ...newArticlePayload
      };
      setArticles(prev => [createdArticle, ...prev]);
    } catch (err) {
      console.warn('Firestore article creation warning:', err);
      const fallbackArticle: BlogPost = {
        id: 'b_custom_' + Date.now(),
        ...newArticlePayload
      };
      setArticles(prev => [fallbackArticle, ...prev]);
    }

    resetArticleForm();
  };

  const handleStartEditArticle = (article: BlogPost) => {
    setEditingArticle(article);
    setIsAddingArticle(false);
    setArticleForm({
      title: article.title,
      category: article.category || 'Bridal Guide',
      excerpt: article.excerpt,
      content: article.content,
      date: article.date,
      readTime: article.readTime,
      image: article.image,
      author: article.author || 'Oluwapelumi - Lead Artist'
    });
  };

  const handleSaveEditedArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    const updatedPayload = {
      id: editingArticle.id,
      title: articleForm.title,
      category: articleForm.category,
      excerpt: articleForm.excerpt,
      content: articleForm.content,
      date: articleForm.date,
      readTime: articleForm.readTime,
      image: articleForm.image,
      author: articleForm.author
    };

    try {
      await saveArticleToFirestore(updatedPayload);
    } catch (err) {
      console.warn('Firestore article update warning:', err);
    }

    setArticles(prev => prev.map(a => a.id === editingArticle.id ? { ...a, ...updatedPayload } : a));
    resetArticleForm();
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article? It will be removed from Firestore database.')) {
      try {
        await deleteArticleFromFirestore(id);
      } catch (err) {
        console.warn('Firestore article deletion warning:', err);
      }
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  };

  const loadTestimonialsFromFirestore = async () => {
    setIsLoadingTestimonials(true);
    try {
      const fetched = await fetchTestimonialsFromFirestore();
      if (fetched && fetched.length > 0) {
        setTestimonials(fetched.slice(0, 3));
      }
    } catch (e) {
      console.error('Error fetching testimonials from Firestore:', e);
    } finally {
      setIsLoadingTestimonials(false);
    }
  };

  const handleTestimonialProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingTestimonialPic(true);
    try {
      const compressedData = await compressImage(file, 800, 800, 0.8);
      setTestimonialForm(prev => ({ ...prev, image: compressedData }));
    } catch (err) {
      console.error('Error processing profile photo:', err);
      alert('Failed to process profile photo file.');
    } finally {
      setIsUploadingTestimonialPic(false);
    }
  };

  const handleTestimonialVideoThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideoThumb(true);
    try {
      const compressedData = await compressImage(file, 1000, 1000, 0.8);
      setTestimonialForm(prev => ({ ...prev, videoThumbnail: compressedData }));
    } catch (err) {
      console.error('Error processing video thumbnail:', err);
      alert('Failed to process thumbnail photo file.');
    } finally {
      setIsUploadingVideoThumb(false);
    }
  };

  const handleTestimonialVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("Video file is larger than 25MB. For very large video files, pasting a YouTube, Vimeo, or Drive link is recommended for fastest performance.");
    }

    setIsUploadingVideoFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const videoDataUrl = event.target?.result as string;
      setTestimonialForm(prev => ({ ...prev, videoUrl: videoDataUrl }));

      // Try auto-capturing a poster thumbnail from the uploaded video
      try {
        const videoElem = document.createElement('video');
        videoElem.src = videoDataUrl;
        videoElem.crossOrigin = 'anonymous';
        videoElem.currentTime = 1;
        videoElem.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = videoElem.videoWidth || 640;
          canvas.height = videoElem.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg', 0.8);
            setTestimonialForm(prev => ({
              ...prev,
              videoThumbnail: prev.videoThumbnail || thumbUrl
            }));
          }
          setIsUploadingVideoFile(false);
        };
        videoElem.onerror = () => {
          setIsUploadingVideoFile(false);
        };
      } catch (err) {
        console.error('Error generating video thumbnail frame:', err);
        setIsUploadingVideoFile(false);
      }
    };
    reader.onerror = () => {
      setIsUploadingVideoFile(false);
      alert("Failed to read video file.");
    };
    reader.readAsDataURL(file);
  };

  const resetTestimonialForm = () => {
    setTestimonialForm({
      name: '',
      role: '',
      stars: 5,
      text: '',
      image: '',
      isVideo: false,
      videoThumbnail: '',
      videoUrl: ''
    });
    setEditingTestimonial(null);
    setIsAddingTestimonial(false);
  };

  const handleStartEditTestimonial = (t: Testimonial) => {
    setEditingTestimonial(t);
    setTestimonialForm({
      name: t.name || '',
      role: t.role || '',
      stars: t.stars || 5,
      text: t.text || '',
      image: t.image || '',
      isVideo: Boolean(t.isVideo),
      videoThumbnail: t.videoThumbnail || '',
      videoUrl: t.videoUrl || ''
    });
    setIsAddingTestimonial(true);
  };

  const handleStartAddTestimonial = () => {
    if (testimonials.length >= 3) {
      alert('⚠️ Maximum limit reached! You can display a maximum of 3 featured testimonials on your website. Please edit or delete an existing testimonial to add a new one.');
      return;
    }
    resetTestimonialForm();
    setIsAddingTestimonial(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name.trim()) {
      alert('Please enter the name of the testifier.');
      return;
    }

    if (!editingTestimonial && testimonials.length >= 3) {
      alert('⚠️ Maximum limit reached! You can display a maximum of 3 featured testimonials on your website. Please edit or delete an existing testimonial first.');
      return;
    }

    const docId = editingTestimonial ? editingTestimonial.id : 't_' + Date.now();
    const payload: Testimonial = {
      id: docId,
      name: testimonialForm.name.trim(),
      role: testimonialForm.role.trim() || 'Valued Client',
      stars: Number(testimonialForm.stars) || 5,
      text: testimonialForm.text.trim(),
      image: testimonialForm.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150',
      isVideo: Boolean(testimonialForm.isVideo),
      videoThumbnail: testimonialForm.videoThumbnail || '',
      videoUrl: testimonialForm.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
    };

    try {
      await saveTestimonialToFirestore(payload);
      if (editingTestimonial) {
        setTestimonials(prev => prev.map(t => t.id === docId ? payload : t));
        alert('✨ Testimonial successfully updated and saved live to database!');
      } else {
        setTestimonials(prev => [payload, ...prev].slice(0, 3));
        alert('✨ Testimonial successfully created and saved live to database!');
      }
    } catch (err) {
      console.warn('Firestore testimonial save warning:', err);
      if (editingTestimonial) {
        setTestimonials(prev => prev.map(t => t.id === docId ? payload : t));
      } else {
        setTestimonials(prev => [payload, ...prev].slice(0, 3));
      }
      alert('Testimonial saved locally. Check connection for live database sync.');
    }

    resetTestimonialForm();
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial? It will be removed permanently from the Firestore live database.')) {
      try {
        await deleteTestimonialFromFirestore(id);
        setTestimonials(prev => prev.filter(t => t.id !== id));
        alert('✨ Testimonial deleted from database!');
      } catch (err) {
        console.warn('Firestore testimonial deletion warning:', err);
        setTestimonials(prev => prev.filter(t => t.id !== id));
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-brand-dark/80 backdrop-blur-md overflow-y-auto">
      {/* Outer Click Guard */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Admin Card */}
      <div className="relative bg-zinc-50 rounded-2xl max-w-4xl w-full h-[92vh] sm:h-[88vh] max-h-[96vh] flex flex-col shadow-2xl z-10 overflow-hidden border border-zinc-200 min-h-0 my-auto">
        
        {/* Auth Page Gate */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 text-center bg-white overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-3 text-zinc-800">
              <Shield size={26} />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 mb-1">Administrative Office</h3>
            <p className="text-xs text-zinc-500 mb-6">Enter password to manage products, pricing, and analytics</p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-1.5 justify-center">
                  <AlertCircle size={14} />
                  <span>{authError}</span>
                </div>
              )}
              
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-zinc-400">
                  <Key size={18} />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrator secret key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-zinc-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-900 text-white font-semibold text-sm rounded-xl hover:bg-zinc-800 transition-colors shadow-md cursor-pointer"
              >
                Access Control Console
              </button>
            </form>

            <button
              onClick={onClose}
              className="mt-6 text-xs text-zinc-500 hover:text-zinc-800 font-semibold underline cursor-pointer"
            >
              Exit & Return to Site
            </button>
          </div>
        ) : (
          
          /* AUTHENTICATED DASHBOARD VIEW */
          <>
            {/* Dashboard Header */}
            <div className="bg-zinc-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 font-bold text-sm">
                  👑
                </div>
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-white leading-tight">
                    Fabulous Gele Artistry
                  </h4>
                  <span className="text-[10px] text-amber-400 font-semibold tracking-wide block">
                    Website Admin Control Panel
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickGuide(!showQuickGuide)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    showQuickGuide 
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-md' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30'
                  }`}
                  title="Toggle Admin Easy Guide"
                >
                  <HelpCircle size={15} />
                  <span className="hidden sm:inline">Admin Help Guide</span>
                  <span className="sm:hidden">Help</span>
                  {showQuickGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                  onClick={handleLogout}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold"
                >
                  Lock Panel
                </button>
                <button 
                  onClick={onClose} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                  title="Close dashboard & return to website"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* QUICK ADMIN INSTRUCTION GUIDE COLLAPSIBLE BOX */}
            {showQuickGuide && (
              <div className="bg-amber-900 text-amber-50 p-4 sm:p-5 border-b border-amber-800 animate-fadeIn space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={16} />
                    <span>Quick Easy Instructions for Admin</span>
                  </div>
                  <button 
                    onClick={() => setShowQuickGuide(false)}
                    className="text-amber-300 hover:text-white text-xs underline font-semibold cursor-pointer"
                  >
                    Close Guide ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/50">
                    <span className="font-bold text-amber-300 block mb-1">🏷️ Service Prices</span>
                    <p className="text-[11px] text-amber-100/90 leading-snug">
                      Tap "Service Prices" on the left. Click "✏️ Edit Price" next to any service, type the new price in Naira (₦), and click "Save".
                    </p>
                  </div>

                  <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/50">
                    <span className="font-bold text-amber-300 block mb-1">🛍️ Shop Products</span>
                    <p className="text-[11px] text-amber-100/90 leading-snug">
                      Tap "Shop Catalog". Click "+ Add New Product" to pick photos from your phone gallery or laptop, type prices, and save live to the store.
                    </p>
                  </div>

                  <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/50">
                    <span className="font-bold text-amber-300 block mb-1">🖼️ Website Pictures</span>
                    <p className="text-[11px] text-amber-100/90 leading-snug">
                      Tap "Website Pictures". You can upload new photos for your front Hero banner, About story, or Academy flyer directly from your device!
                    </p>
                  </div>

                  <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/50">
                    <span className="font-bold text-amber-300 block mb-1">⭐ Client Reviews</span>
                    <p className="text-[11px] text-amber-100/90 leading-snug">
                      Tap "Client Reviews". You can manage up to 3 featured client reviews or video testimonials that appear live on your homepage.
                    </p>
                  </div>

                  <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/50">
                    <span className="font-bold text-amber-300 block mb-1">📋 Customer Orders</span>
                    <p className="text-[11px] text-amber-100/90 leading-snug">
                      Tap "Customer Enquiries". See every booking or product request sent by clients. Click "💬 Chat on WhatsApp" to contact them in 1 click!
                    </p>
                  </div>

                  <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/50 flex flex-col justify-center items-center text-center">
                    <span className="font-bold text-amber-200 block">🟢 Everything is Live</span>
                    <p className="text-[10px] text-amber-200/80 mt-0.5">
                      Any change you save here updates your website immediately for all visitors!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Sub-Alert Banner */}
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-emerald-900 font-medium shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">
                  Connected Live to <strong>Website Database</strong>. All updates apply automatically in real-time.
                </span>
              </div>
              <button
                onClick={() => setShowQuickGuide(true)}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
              >
                <HelpCircle size={13} />
                <span>Need help? Click for Admin Guide</span>
              </button>
            </div>

            {/* Side + Main Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              
              {/* Sidebar Tabs (Horizontal Scroll on Mobile, Vertical Sidebar on Desktop) */}
              <div className="w-full md:w-56 bg-zinc-100 border-b md:border-b-0 md:border-r border-zinc-200 p-2 md:py-4 flex md:flex-col overflow-x-auto md:overflow-y-auto gap-1 shrink-0 scrollbar-none">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'overview'
                      ? 'bg-white border-zinc-900 text-zinc-900 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <LayoutDashboard size={16} className="text-zinc-700" />
                  <div className="text-left">
                    <span className="block leading-tight">Sales & Traffic</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Website statistics</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'services'
                      ? 'bg-white border-amber-600 text-amber-950 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <DollarSign size={16} className="text-amber-600" />
                  <div className="text-left">
                    <span className="block leading-tight">Service Prices</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Bridal & Gele fees</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'products'
                      ? 'bg-white border-amber-600 text-amber-950 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <ShoppingBag size={16} className="text-amber-600" />
                  <div className="text-left">
                    <span className="block leading-tight">Shop Catalog</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Auto Gele & Fabrics</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('site_pictures')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'site_pictures'
                      ? 'bg-white border-amber-600 text-amber-950 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Upload size={16} className="text-amber-600" />
                  <div className="text-left">
                    <span className="block leading-tight">Website Pictures</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Hero & Masterclass photos</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('testimonials')}
                  className={`flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'testimonials'
                      ? 'bg-white border-amber-600 text-amber-950 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Quote size={16} className="text-amber-600" />
                    <div className="text-left">
                      <span className="block leading-tight">Client Reviews</span>
                      <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Featured 3 reviews</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    testimonials.length >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {testimonials.length}/3
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'orders'
                      ? 'bg-white border-amber-600 text-amber-950 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database size={16} className="text-amber-600" />
                    <div className="text-left">
                      <span className="block leading-tight">Customer Orders</span>
                      <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Incoming enquiries</span>
                    </div>
                  </div>
                  {firestoreOrders.length > 0 && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      {firestoreOrders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('promo')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'promo'
                      ? 'bg-white border-zinc-900 text-zinc-900 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Megaphone size={16} className="text-zinc-700" />
                  <div className="text-left">
                    <span className="block leading-tight">Top Sale Banner</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Gold header strip</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'gallery'
                      ? 'bg-white border-zinc-900 text-zinc-900 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <ImageIcon size={16} className="text-zinc-700" />
                  <div className="text-left">
                    <span className="block leading-tight">Lookbook Gallery</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Portfolio photos</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('articles')}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 border-b-2 md:border-b-0 md:border-l-4 rounded-xl md:rounded-none ${
                    activeTab === 'articles'
                      ? 'bg-white border-zinc-900 text-zinc-900 shadow-xs'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <BookOpen size={16} className="text-zinc-700" />
                  <div className="text-left">
                    <span className="block leading-tight">Blog Articles</span>
                    <span className="text-[9px] text-zinc-400 font-normal hidden md:block">Style guides & news</span>
                  </div>
                </button>
              </div>

              {/* Tab Workspace content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50 min-h-0">

                {/* TAB 1: OVERVIEW & BUSINESS HEALTH */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-amber-950 text-white p-6 rounded-2xl shadow-md border border-amber-900/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold mb-2 border border-amber-500/30">
                            <Sparkles size={13} />
                            <span>Fabulous Gele Artistry Admin Hub</span>
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-white">Welcome, Admin! 👋</h3>
                          <p className="text-xs text-amber-100/80 mt-1 max-w-xl leading-relaxed">
                            Here is a quick snapshot of your website activity. Use the quick buttons below or the left sidebar to manage your service prices, shop items, pictures, and customer messages.
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab('orders')}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-2"
                        >
                          <Database size={15} />
                          <span>View Recent Enquiries ({firestoreOrders.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Task Shortcuts for Non-Tech Admin */}
                    <div>
                      <h4 className="font-serif font-bold text-base text-zinc-900 mb-3 flex items-center gap-2">
                        <span>⚡ Quick Admin Actions</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                            💬
                          </div>
                          <div className="font-bold text-sm text-zinc-900">View Client Enquiries</div>
                          <p className="text-xs text-zinc-500 mt-0.5">Contact clients directly on WhatsApp</p>
                          <div className="text-[11px] font-bold text-amber-700 mt-3 flex items-center gap-1">
                            <span>Open Client List</span>
                            <span>→</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('services')}
                          className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                            👑
                          </div>
                          <div className="font-bold text-sm text-zinc-900">Edit Service Prices</div>
                          <p className="text-xs text-zinc-500 mt-0.5">Change Bridal Gele & Masterclass fees</p>
                          <div className="text-[11px] font-bold text-amber-700 mt-3 flex items-center gap-1">
                            <span>Change Prices</span>
                            <span>→</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('products')}
                          className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                            🛍️
                          </div>
                          <div className="font-bold text-sm text-zinc-900">Add Shop Products</div>
                          <p className="text-xs text-zinc-500 mt-0.5">Upload photos & prices for Auto Geles</p>
                          <div className="text-[11px] font-bold text-amber-700 mt-3 flex items-center gap-1">
                            <span>Manage Shop</span>
                            <span>→</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('site_pictures')}
                          className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                            🖼️
                          </div>
                          <div className="font-bold text-sm text-zinc-900">Update Website Pictures</div>
                          <p className="text-xs text-zinc-500 mt-0.5">Change Hero Banner & Portrait photos</p>
                          <div className="text-[11px] font-bold text-amber-700 mt-3 flex items-center gap-1">
                            <span>Upload Photos</span>
                            <span>→</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Counter Card */}
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Total Customer Requests</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <Database size={11} className="text-amber-600" />
                              <span>Cloud Database Active</span>
                            </span>
                          </div>
                          <h4 className="text-3xl font-serif font-bold text-zinc-900 mt-2">
                            {Math.max(ordersInitiated, firestoreOrders.length)}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            Total client bookings & orders saved live in your cloud database across mobile and desktop devices.
                          </p>
                        </div>
                      </div>

                      {/* Reminder Block */}
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Email Notification Active</span>
                          <h4 className="text-lg font-serif font-bold text-zinc-900 mt-1.5">Direct Client Email Alerts</h4>
                          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                            Whenever a client fills out a booking or purchase form on your website, an alert is also sent straight to your email.
                          </p>
                        </div>
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs p-3 rounded-xl leading-relaxed font-sans">
                          <span className="font-bold">💡 Tip:</span> Check your email inbox daily for instant alerts when new clients submit bookings!
                        </div>
                      </div>
                    </div>

                    {/* RECHARTS: 30-DAY CONVERSION & ORDERS TREND CHART */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="text-amber-600" size={18} />
                            <h4 className="font-serif font-bold text-base text-zinc-900">30-Day Orders & Conversion Trend</h4>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Daily visualization of client bookings, product sales, and academy registrations over the last 30 days
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setChartType('area')}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                chartType === 'area' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                              }`}
                            >
                              Area Gradient
                            </button>
                            <button
                              type="button"
                              onClick={() => setChartType('bar')}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                chartType === 'bar' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                              }`}
                            >
                              Bar Stack
                            </button>
                          </div>

                          <button
                            onClick={loadOrders}
                            disabled={isLoadingOrders}
                            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors cursor-pointer"
                            title="Refresh Firestore Chart Data"
                          >
                            <RefreshCw size={14} className={isLoadingOrders ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Metrics & Chart Render */}
                      {(() => {
                        const trendData = get30DaysTrendData(firestoreOrders);
                        const total30Days = trendData.reduce((acc, curr) => acc + curr.total, 0);
                        const totalBookings = trendData.reduce((acc, curr) => acc + curr.booking, 0);
                        const totalProducts = trendData.reduce((acc, curr) => acc + curr.product, 0);
                        const totalAcademy = trendData.reduce((acc, curr) => acc + curr.academy, 0);
                        const peakDay = trendData.reduce((max, curr) => curr.total > max.total ? curr : max, trendData[0]);

                        return (
                          <div className="space-y-5">
                            {/* Key Stats Chips */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">30-Day Orders</span>
                                <span className="text-2xl font-black font-serif text-amber-900">{total30Days}</span>
                              </div>
                              <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Gele Bookings</span>
                                <span className="text-2xl font-black font-serif text-purple-900">{totalBookings}</span>
                              </div>
                              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Academy Registrations</span>
                                <span className="text-2xl font-black font-serif text-emerald-900">{totalAcademy}</span>
                              </div>
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Peak Day Volume</span>
                                <span className="text-sm font-bold text-zinc-900 block truncate">{peakDay?.label || 'N/A'}</span>
                                <span className="text-[10px] text-zinc-500 font-medium">{peakDay?.total || 0} conversion(s)</span>
                              </div>
                            </div>

                            {/* Chart Canvas */}
                            <div className="h-72 w-full pt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'area' ? (
                                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.05}/>
                                      </linearGradient>
                                      <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.05}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                    <Area type="monotone" dataKey="total" name="Total Orders" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                                    <Area type="monotone" dataKey="booking" name="Gele Bookings" stroke="#9333ea" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBooking)" />
                                  </AreaChart>
                                ) : (
                                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                    <Bar dataKey="booking" name="Gele Bookings" stackId="a" fill="#9333ea" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="product" name="Products" stackId="a" fill="#d97706" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="academy" name="Academy" stackId="a" fill="#059669" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                )}
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB 2: EDIT SERVICES */}
                {activeTab === 'services' && (
                  <div className="space-y-5">
                    <div className="border-b border-zinc-200 pb-3 bg-white p-6 rounded-2xl">
                      <h3 className="text-xl font-serif font-bold text-zinc-900">Manage Service Prices</h3>
                      <p className="text-xs text-zinc-500 mt-1">Change pricing for Bridal Gele, Engagement styling, and Masterclass training fees</p>
                    </div>

                    {/* Non-Tech Tip Banner */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 text-base">
                        💡
                      </div>
                      <div className="text-xs text-amber-950 space-y-1">
                        <p className="font-bold text-sm">How to Change a Price</p>
                        <p className="text-amber-900 leading-relaxed">
                          Click the <strong>"✏️ Edit Price"</strong> button next to any service below, type the new fee (e.g. <code>₦35,000</code>), then click <strong>"✓ Save Price"</strong>. The new price will be published live on your website immediately!
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-xs">
                      {services.map((service) => (
                        <div key={service.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                          <div className="space-y-1">
                            <h5 className="font-serif font-bold text-base text-zinc-950">{service.name}</h5>
                            <p className="text-xs text-zinc-500 max-w-xl">{service.description}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {editingServiceId === service.id ? (
                              <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-xl border border-amber-300">
                                <span className="text-xs font-bold text-zinc-600">New Price:</span>
                                <input
                                  type="text"
                                  value={servicePriceInput}
                                  onChange={(e) => setServicePriceInput(e.target.value)}
                                  placeholder="e.g. ₦35,000"
                                  className="border border-zinc-300 rounded-lg px-3 py-1.5 text-xs text-zinc-900 font-mono font-bold focus:outline-none focus:border-amber-600 bg-white"
                                />
                                <button
                                  onClick={() => handleSaveServicePrice(service.id)}
                                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                  title="Save price to website"
                                >
                                  <Check size={14} />
                                  <span>Save Price</span>
                                </button>
                                <button
                                  onClick={() => setEditingServiceId(null)}
                                  className="px-3 py-1.5 bg-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-300 rounded-lg transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-mono text-sm font-black text-amber-950 bg-amber-100/80 border border-amber-200 px-3 py-1.5 rounded-xl">
                                  {service.pricingInfo}
                                </span>
                                <button
                                  onClick={() => handleEditServicePrice(service.id, service.pricingInfo)}
                                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                  title="Edit price"
                                >
                                  <Edit2 size={13} />
                                  <span>Edit Price</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: MANAGE PRODUCTS (CRUD) */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                          <ShoppingBag size={15} />
                          <span>Shop Product Catalog</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-zinc-900">Manage Store Products & Headties</h3>
                        <p className="text-xs text-zinc-500 mt-1">Add new Auto Geles, Aso-Oke fabrics, and accessories or update existing stock</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadProductsFromFirestore}
                          disabled={isLoadingProducts}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          title="Sync catalog with Firebase Firestore"
                        >
                          <RefreshCw size={13} className={isLoadingProducts ? "animate-spin" : ""} />
                          <span>Refresh Store</span>
                        </button>

                        {!isAddingProduct && !editingProduct && (
                          <button
                            onClick={() => {
                              resetProductForm();
                              setIsAddingProduct(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 shadow-md"
                          >
                            <Plus size={16} />
                            <span>+ Add New Product</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Non-Tech Admin Tip Box */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 text-base">
                        💡
                      </div>
                      <div className="text-xs text-amber-950 space-y-1">
                        <p className="font-bold text-sm">How to Add or Edit Products</p>
                        <p className="text-amber-900 leading-relaxed">
                          Click <strong>"+ Add New Product"</strong> above. Click <strong>"Upload Photo from Device"</strong> to pick a photo from your phone or computer, enter the title and price in Naira (₦), and click <strong>"Save Product to Database"</strong>!
                        </p>
                      </div>
                    </div>

                    {/* Product CRUD Form */}
                    {(isAddingProduct || editingProduct) && (
                      <form 
                        onSubmit={editingProduct ? handleSaveEditedProduct : handleAddProduct}
                        className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                          <h4 className="font-serif font-bold text-sm text-zinc-950">
                            {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create Brand-New Product'}
                          </h4>
                          <button 
                            type="button" 
                            onClick={() => {
                              setIsAddingProduct(false);
                              setEditingProduct(null);
                            }}
                            className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Photo Upload and Preview Section */}
                        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                              <ImageIcon size={14} className="text-amber-600" />
                              <span>Product Photo</span>
                            </label>
                            {productForm.image && (
                              <button
                                type="button"
                                onClick={() => setProductForm(prev => ({ ...prev, image: '' }))}
                                className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                              >
                                Clear Photo
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Photo Thumbnail Preview */}
                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-zinc-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative">
                              {productForm.image ? (
                                <img 
                                  src={productForm.image} 
                                  alt="Product Preview" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <ImageIcon size={24} className="text-zinc-300 mx-auto mb-1" />
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase block">No Photo</span>
                                </div>
                              )}
                              {isUploadingImage && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                  <RefreshCw size={18} className="animate-spin text-amber-600" />
                                </div>
                              )}
                            </div>

                            {/* Upload Controls */}
                            <div className="flex-1 space-y-2.5 w-full">
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs">
                                  <Upload size={14} />
                                  <span>{isUploadingImage ? 'Processing...' : 'Upload Photo from Device'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageFileChange} 
                                    className="hidden" 
                                  />
                                </label>
                                <span className="text-[11px] text-zinc-400">or enter image link below</span>
                              </div>

                              <input 
                                type="text"
                                value={productForm.image}
                                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                placeholder="https://images.unsplash.com/photo-... or Data URL"
                                className="w-full border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-zinc-500 bg-white text-zinc-900"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Product Name</label>
                            <input 
                              type="text"
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              placeholder="e.g. Lavender Premium Auto Gele"
                              className="w-full border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50 text-zinc-900"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Price (₦)</label>
                            <input 
                              type="text"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="e.g. 15000"
                              className="w-full border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50 text-zinc-900"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              className="w-full border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50 text-zinc-900"
                            >
                              <option value="Auto Gele">Auto Gele</option>
                              <option value="Fabrics">Fabrics</option>
                              <option value="Senator Caps">Senator Caps</option>
                              <option value="Accessories">Accessories</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Short Description</label>
                          <textarea
                            rows={2}
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Describe fabrics, design style or adjustable fastness details..."
                            className="w-full border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50 text-zinc-900"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="inStockCheck"
                            checked={productForm.inStock}
                            onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                            className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-0 focus:outline-none"
                          />
                          <label htmlFor="inStockCheck" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                            Mark in stock and ready for purchase immediately
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingProduct(false);
                              setEditingProduct(null);
                            }}
                            className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-850 transition-colors cursor-pointer shadow-xs"
                          >
                            {editingProduct ? 'Save Changes to Database' : 'Create Product in Database'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Catalog Listing Table */}
                    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left text-xs text-zinc-500">
                          <thead className="bg-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200">
                            <tr>
                              <th className="p-3">Item</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Price</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {products.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-400 italic">
                                  No products registered in local catalog.
                                </td>
                              </tr>
                            ) : (
                              products.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-50">
                                  <td className="p-3 flex items-center gap-2.5">
                                    <img 
                                      src={p.image} 
                                      alt={p.name} 
                                      className="w-10 h-10 object-cover rounded-lg border border-zinc-200 shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <span className="font-semibold text-zinc-900 block">{p.name}</span>
                                      <span className="text-[10px] text-zinc-400 line-clamp-1">{p.description}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 font-medium">{p.category}</td>
                                  <td className="p-3 font-mono font-bold text-zinc-900">₦{p.price.toLocaleString()}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.inStock 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                        : 'bg-zinc-100 text-zinc-500'
                                    }`}>
                                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right space-x-1.5">
                                    <button
                                      onClick={() => handleEditProductClick(p)}
                                      className="text-zinc-500 hover:text-zinc-950 p-1 rounded hover:bg-zinc-100 transition-colors inline-block cursor-pointer"
                                      title="Edit product info"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors inline-block cursor-pointer"
                                      title="Delete product"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: PROMO STRIP EDITOR */}
                {activeTab === 'promo' && (
                  <form onSubmit={handleUpdatePromo} className="space-y-6">
                    <div className="border-b border-zinc-200 pb-3">
                      <h3 className="text-xl font-serif font-bold text-zinc-900">Promo Banner Strip Controller</h3>
                      <p className="text-xs text-zinc-500">Edit notifications shown to all homepage visitors instantly</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-4 shadow-xs">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="promoIsActive"
                          checked={promoBanner.isActive}
                          onChange={(e) => setPromoBanner({ ...promoBanner, isActive: e.target.checked })}
                          className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-0 focus:outline-none"
                        />
                        <label htmlFor="promoIsActive" className="text-xs font-bold text-zinc-700 uppercase tracking-wider cursor-pointer">
                          Activate Promo Ribbon
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ribbon Message Content</label>
                        <input
                          type="text"
                          value={promoBanner.text}
                          onChange={(e) => setPromoBanner({ ...promoBanner, text: e.target.value })}
                          placeholder="e.g. New Beginners Masterclass starting next Monday in Ibadan! Save 10% on deposits."
                          className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50 text-zinc-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">CTA Link Text (Optional)</label>
                        <input
                          type="text"
                          value={promoBanner.linkText || ''}
                          onChange={(e) => setPromoBanner({ ...promoBanner, linkText: e.target.value })}
                          placeholder="e.g. Register Now"
                          className="w-full border border-zinc-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50 text-zinc-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-zinc-900 text-white font-bold text-xs rounded-xl shadow hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Save & Publish Announcement
                    </button>
                  </form>
                )}

                {/* -------------------- TAB: ARTICLES & NEWS -------------------- */}
                {activeTab === 'articles' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Content Management System</span>
                        <h3 className="text-xl font-serif font-bold text-zinc-900">Manage Artistry Articles & Guides</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Publish blog posts, styling tips, and bridal guides directly to the website and Firestore database.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadArticlesFromFirestore}
                          disabled={isLoadingArticles}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0"
                        >
                          <RefreshCw size={14} className={isLoadingArticles ? "animate-spin" : ""} />
                          <span>Sync Firestore</span>
                        </button>

                        <button
                          onClick={() => {
                            resetArticleForm();
                            setIsAddingArticle(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs transition-colors shadow-md cursor-pointer shrink-0"
                        >
                          <Plus size={16} />
                          <span>Write New Article</span>
                        </button>
                      </div>
                    </div>

                    {/* ADD / EDIT ARTICLE FORM */}
                    {(isAddingArticle || editingArticle) && (
                      <div className="bg-white p-6 rounded-2xl border-2 border-zinc-900 shadow-xl space-y-5 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <h4 className="font-serif font-bold text-base text-zinc-900 flex items-center gap-2">
                            <FileText size={18} className="text-zinc-700" />
                            <span>{editingArticle ? 'Edit Article Post' : 'Compose New Article'}</span>
                          </h4>
                          <button 
                            type="button" 
                            onClick={resetArticleForm}
                            className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={editingArticle ? handleSaveEditedArticle : handleAddArticle} className="space-y-4 font-sans text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-zinc-700 font-bold mb-1">Article Title *</label>
                              <input 
                                type="text"
                                required
                                value={articleForm.title}
                                onChange={e => setArticleForm({...articleForm, title: e.target.value})}
                                placeholder="e.g., 5 Secrets to Making Your Gele Last 24 Hours"
                                className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-zinc-700 font-bold mb-1">Category</label>
                              <select
                                value={articleForm.category}
                                onChange={e => setArticleForm({...articleForm, category: e.target.value})}
                                className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                              >
                                <option value="Bridal Guide">Bridal Guide</option>
                                <option value="Gele Care & Tips">Gele Care & Tips</option>
                                <option value="Academy Masterclass">Academy Masterclass</option>
                                <option value="Owambe Fashion">Owambe Fashion</option>
                                <option value="Business Advice">Business Advice</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-zinc-700 font-bold mb-1">Author Name</label>
                              <input 
                                type="text"
                                value={articleForm.author}
                                onChange={e => setArticleForm({...articleForm, author: e.target.value})}
                                placeholder="e.g., Oluwapelumi - Lead Artist"
                                className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-zinc-700 font-bold mb-1">Date / Month</label>
                              <input 
                                type="text"
                                value={articleForm.date}
                                onChange={e => setArticleForm({...articleForm, date: e.target.value})}
                                placeholder="e.g., July 2026"
                                className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-zinc-700 font-bold mb-1">Estimated Read Time</label>
                              <input 
                                type="text"
                                value={articleForm.readTime}
                                onChange={e => setArticleForm({...articleForm, readTime: e.target.value})}
                                placeholder="e.g., 4 min read"
                                className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                              />
                            </div>
                          </div>

                          {/* Cover Photo Upload or URL */}
                          <div className="space-y-2 border-t border-zinc-100 pt-3">
                            <label className="block text-zinc-700 font-bold">Article Cover Image</label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              <div className="sm:col-span-8">
                                <input 
                                  type="text"
                                  value={articleForm.image}
                                  onChange={e => setArticleForm({...articleForm, image: e.target.value})}
                                  placeholder="Paste Image URL (or upload photo from device below)"
                                  className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                                />
                              </div>

                              <div className="sm:col-span-4 flex items-center">
                                <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs cursor-pointer border border-zinc-300 transition-colors">
                                  <Upload size={14} />
                                  <span>{isUploadingArticleImage ? 'Uploading...' : 'Upload Device Photo'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleArticleImageFileChange}
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                            </div>

                            {articleForm.image && (
                              <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-300 bg-zinc-100">
                                <img src={articleForm.image} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          {/* Excerpt */}
                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">Short Summary / Excerpt</label>
                            <input 
                              type="text"
                              value={articleForm.excerpt}
                              onChange={e => setArticleForm({...articleForm, excerpt: e.target.value})}
                              placeholder="Brief 1-2 sentence preview for article cards"
                              className="w-full border border-zinc-200 rounded-xl p-2.5 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs"
                            />
                          </div>

                          {/* Full Body Content */}
                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">Full Article Content *</label>
                            <textarea
                              required
                              rows={6}
                              value={articleForm.content}
                              onChange={e => setArticleForm({...articleForm, content: e.target.value})}
                              placeholder="Write your article paragraphs here. Supports plain text with spacing and bullet points."
                              className="w-full border border-zinc-200 rounded-xl p-3 bg-zinc-50 text-zinc-900 focus:outline-none focus:border-zinc-500 text-xs leading-relaxed font-sans"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                            <button
                              type="button"
                              onClick={resetArticleForm}
                              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-bold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                            >
                              {editingArticle ? 'Save Article Changes' : 'Publish Article to Site'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* ARTICLES LIST */}
                    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
                      <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-sans">Published Site Articles ({articles.length})</span>
                      </div>

                      {articles.length === 0 ? (
                        <div className="p-12 text-center">
                          <BookOpen size={32} className="text-zinc-300 mx-auto mb-3" />
                          <h4 className="font-bold text-sm text-zinc-800">No Articles Written Yet</h4>
                          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                            Click "Write New Article" above to publish your first bridal guide or gele styling article.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-100">
                          {articles.map((art) => (
                            <div key={art.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-200">
                                  <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1 text-left min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                      {art.category || 'Artistry Insights'}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono">{art.date} • {art.readTime}</span>
                                  </div>
                                  <h4 className="font-serif font-bold text-zinc-900 text-sm sm:text-base leading-snug truncate">{art.title}</h4>
                                  <p className="text-xs text-zinc-500 line-clamp-1 font-sans">{art.excerpt}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  onClick={() => handleStartEditArticle(art)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Edit2 size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: PORTFOLIO GALLERY */}
                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    {/* Top Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-zinc-900 flex items-center gap-2">
                          <ImageIcon size={20} className="text-amber-600" />
                          <span>Portfolio Gallery & Lookbook Management</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Upload and manage photos in your crowning glory lookbook gallery. All uploads save instantly to Firestore.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={loadGalleryFromFirestore}
                          disabled={isLoadingGallery}
                          className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                          title="Reload gallery from database"
                        >
                          <RefreshCw size={14} className={isLoadingGallery ? 'animate-spin' : ''} />
                          <span className="hidden sm:inline">Refresh Sync</span>
                        </button>

                        {!isAddingGalleryItem && !editingGalleryItem && (
                          <button
                            onClick={() => {
                              resetGalleryForm();
                              setIsAddingGalleryItem(true);
                            }}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Plus size={16} />
                            <span>Add New Gallery Photo</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ADD OR EDIT GALLERY PHOTO FORM */}
                    {(isAddingGalleryItem || editingGalleryItem) && (
                      <div className="bg-white p-6 rounded-2xl border-2 border-amber-500/40 shadow-lg space-y-5 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                          <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                            <Plus size={16} className="text-amber-600" />
                            <span>{editingGalleryItem ? 'Edit Gallery Photo' : 'Add New Photo to Portfolio Gallery'}</span>
                          </h4>
                          <button
                            onClick={resetGalleryForm}
                            className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={editingGalleryItem ? handleSaveEditedGalleryItem : handleAddGalleryItem} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title / Description */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-zinc-700 block">
                                Photo Title / Description <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Royal Emerald Bridal Gele with Crystal Pin"
                                value={galleryForm.title}
                                onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500"
                                required
                              />
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-zinc-700 block">
                                Lookbook Category <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={galleryForm.category}
                                onChange={(e) => setGalleryForm(prev => ({ ...prev, category: e.target.value as any }))}
                                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500"
                              >
                                <option value="bridal">Bridal Luxury</option>
                                <option value="owambe">Owambe Glam</option>
                                <option value="asoebi">Aso Ebi Ladies</option>
                                <option value="before_after">Before & After Transformation</option>
                                <option value="bts">Behind The Scenes</option>
                                <option value="training">Training & Student Work</option>
                              </select>
                            </div>
                          </div>

                          {/* Image Upload and Direct URL Section */}
                          <div className="space-y-2 border-t border-zinc-100 pt-3">
                            <label className="text-xs font-bold text-zinc-700 block">
                              Photo Source <span className="text-red-500">*</span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Device Photo Upload Picker */}
                              <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                                    <Upload size={14} className="text-amber-700" />
                                    <span>Upload Picture from Device</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">
                                    Select a photo file from your phone or computer.
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleGalleryImageFileChange}
                                  className="text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                                />
                                {isUploadingGalleryImage && (
                                  <p className="text-[10px] text-amber-700 font-bold mt-1.5 animate-pulse">Processing image file...</p>
                                )}
                              </div>

                              {/* Direct Image Web URL Input */}
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-zinc-800 flex items-center gap-1 mb-1">
                                    <ImageIcon size={14} className="text-zinc-600" />
                                    <span>Or Paste Image Link (URL)</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">
                                    Paste an HTTPS link to an existing web image.
                                  </p>
                                </div>
                                <input
                                  type="url"
                                  placeholder="https://images.unsplash.com/photo-..."
                                  value={galleryForm.image}
                                  onChange={(e) => setGalleryForm(prev => ({ ...prev, image: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Live Image Preview */}
                          {galleryForm.image && (
                            <div className="p-3 bg-zinc-900 rounded-xl flex items-center gap-4">
                              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800">
                                <img
                                  src={galleryForm.image}
                                  alt="Live preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300';
                                  }}
                                />
                              </div>
                              <div className="text-white text-xs space-y-1 overflow-hidden">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded">
                                  Live Preview
                                </span>
                                <p className="font-bold truncate">{galleryForm.title || 'Untitled Photo'}</p>
                                <p className="text-[10px] text-zinc-400 capitalize">Category: {galleryForm.category.replace('_', ' ')}</p>
                              </div>
                            </div>
                          )}

                          {/* Form Submit & Cancel Actions */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                            <button
                              type="button"
                              onClick={resetGalleryForm}
                              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check size={16} />
                              <span>{editingGalleryItem ? 'Save Changes' : 'Publish to Gallery'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Gallery Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-zinc-200">
                      <span className="text-xs font-bold text-zinc-500 mr-2">Filter View:</span>
                      {[
                        { id: 'all', label: 'All Photos' },
                        { id: 'bridal', label: 'Bridal' },
                        { id: 'owambe', label: 'Owambe' },
                        { id: 'asoebi', label: 'Aso Ebi' },
                        { id: 'before_after', label: 'Before & After' },
                        { id: 'bts', label: 'BTS' },
                        { id: 'training', label: 'Training' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setGalleryFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            galleryFilter === f.id
                              ? 'bg-zinc-900 text-white shadow-xs'
                              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                      <span className="ml-auto text-xs text-zinc-400 font-mono">
                        Showing {gallery.filter(g => galleryFilter === 'all' || g.category === galleryFilter).length} photos
                      </span>
                    </div>

                    {/* GALLERY GRID */}
                    {isLoadingGallery ? (
                      <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200">
                        <RefreshCw size={24} className="animate-spin text-amber-600 mx-auto mb-3" />
                        <p className="text-xs font-bold text-zinc-600">Fetching lookbook photos from Firestore...</p>
                      </div>
                    ) : gallery.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200">
                        <ImageIcon size={32} className="text-zinc-300 mx-auto mb-3" />
                        <h4 className="font-bold text-sm text-zinc-800">No Gallery Photos Found</h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                          Click "Add New Gallery Photo" above to upload photos to your lookbook.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {gallery
                          .filter(g => galleryFilter === 'all' || g.category === galleryFilter)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                            >
                              <div className="aspect-square relative overflow-hidden bg-zinc-900">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                                <span className="absolute top-2.5 left-2.5 bg-zinc-900/90 backdrop-blur-xs text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                                  {item.category.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <p className="font-serif font-bold text-zinc-900 text-xs leading-snug line-clamp-2">
                                  {item.title}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                                  <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[100px]">
                                    ID: {item.id}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleStartEditGalleryItem(item)}
                                      className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Photo"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGalleryItem(item.id)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Photo"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: WEBSITE PICTURES & BANNERS MODIFICATION TAB */}
                {activeTab === 'site_pictures' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-zinc-900 flex items-center gap-2">
                          <Upload size={20} className="text-amber-600" />
                          <span>Website Showcase & Banner Pictures</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Upload custom photos from your phone or computer to replace main website images.
                        </p>
                      </div>

                      <button
                        onClick={loadSiteImagesFromFirestore}
                        disabled={isLoadingSiteImages}
                        className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shrink-0"
                        title="Reload pictures from Firestore"
                      >
                        <RefreshCw size={14} className={isLoadingSiteImages ? 'animate-spin' : ''} />
                        <span>Refresh Sync</span>
                      </button>
                    </div>

                    {/* Non-Tech Admin Tip Box */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 text-base">
                        💡
                      </div>
                      <div className="text-xs text-amber-950 space-y-1">
                        <p className="font-bold text-sm">How to Replace Main Website Photos</p>
                        <p className="text-amber-900 leading-relaxed">
                          Under any section below (Hero Banner, Artist Photo, or Academy Picture), click <strong>"Choose File"</strong> to pick a photo from your phone or laptop. Then click <strong>"Save All Pictures Live"</strong> at the bottom of the page!
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveSiteImages} className="space-y-6">
                      
                      {/* SECTION 1: HERO SECTION MAIN IMAGE & BADGE */}
                      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">1</span>
                            <h4 className="font-bold text-sm text-zinc-900">Hero Section Main Showcase Picture</h4>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Homepage Hero Frame
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Live Preview Frame */}
                          <div className="md:col-span-4">
                            <label className="text-xs font-bold text-zinc-700 block mb-2">Live Preview Frame</label>
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-200 shadow-md relative bg-zinc-900 group">
                              <img
                                src={siteImagesForm.heroImage || '/src/assets/images/gele_by_him_1784695959540.jpg'}
                                alt="Hero live preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-left">
                                <span className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full w-fit mb-1">
                                  {siteImagesForm.heroBadgeText || 'Master Artisan Showcase'}
                                </span>
                                <p className="text-white font-bold text-sm">Fabulous Gele Artistry</p>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="md:col-span-8 space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-zinc-700 block">
                                Hero Image Overlay Badge Text
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Master Artisan Showcase / New 2026 Collection"
                                value={siteImagesForm.heroBadgeText || ''}
                                onChange={(e) => setSiteImagesForm(prev => ({ ...prev, heroBadgeText: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {/* File Upload */}
                              <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                                    <Upload size={14} className="text-amber-700" />
                                    <span>Upload New Hero Photo</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">Pick a high-res photo from your phone/laptop.</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUploadForSitePicture(e, 'heroImage')}
                                  className="text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                                />
                              </div>

                              {/* URL Link */}
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-zinc-800 flex items-center gap-1 mb-1">
                                    <ImageIcon size={14} className="text-zinc-600" />
                                    <span>Or Paste Hero Image Link</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">Paste web image URL directly.</p>
                                </div>
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={siteImagesForm.heroImage || ''}
                                  onChange={(e) => setSiteImagesForm(prev => ({ ...prev, heroImage: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: ABOUT STORY / LEAD ARTIST PORTRAIT */}
                      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">2</span>
                            <h4 className="font-bold text-sm text-zinc-900">About Story / Lead Artist Headshot Portrait</h4>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            About Story & Lead Headshot
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Live Preview Frame */}
                          <div className="md:col-span-4">
                            <label className="text-xs font-bold text-zinc-700 block mb-2">Portrait Live Preview</label>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-200 shadow-md relative bg-zinc-900">
                              <img
                                src={siteImagesForm.artistPortrait || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'}
                                alt="Artist portrait preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-left">
                                <p className="text-white font-bold text-xs">Adeniji Oluwapelumi</p>
                                <p className="text-amber-400 text-[10px]">Lead Gele Stylist & Tutor</p>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="md:col-span-8 space-y-4">
                            <p className="text-xs text-zinc-600">
                              This photo is rendered in the <strong>About Story</strong> section on the homepage and the full About page.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {/* File Upload */}
                              <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                                    <Upload size={14} className="text-amber-700" />
                                    <span>Upload New Artist Portrait</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">Select photo file from device.</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUploadForSitePicture(e, 'artistPortrait')}
                                  className="text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                                />
                              </div>

                              {/* URL Link */}
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-zinc-800 flex items-center gap-1 mb-1">
                                    <ImageIcon size={14} className="text-zinc-600" />
                                    <span>Or Paste Portrait Link</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">Paste web image URL directly.</p>
                                </div>
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={siteImagesForm.artistPortrait || ''}
                                  onChange={(e) => setSiteImagesForm(prev => ({ ...prev, artistPortrait: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: ACADEMY / MASTERCLASS BANNER */}
                      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">3</span>
                            <h4 className="font-bold text-sm text-zinc-900">Academy & Masterclass Feature Banner</h4>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Academy Training Section
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Live Preview Frame */}
                          <div className="md:col-span-4">
                            <label className="text-xs font-bold text-zinc-700 block mb-2">Academy Banner Preview</label>
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 shadow-md relative bg-zinc-900">
                              <img
                                src={siteImagesForm.academyBanner || '/src/assets/images/tutor_and_models_1784637118947.jpg'}
                                alt="Academy banner preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-left">
                                <p className="text-white font-bold text-xs">Gele Masterclass Cohort</p>
                                <p className="text-amber-400 text-[10px]">Students Training Session</p>
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="md:col-span-8 space-y-4">
                            <p className="text-xs text-zinc-600">
                              Upload or update the banner image displayed for the <strong>Academy & Masterclass Training</strong> subpage.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {/* File Upload */}
                              <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                                    <Upload size={14} className="text-amber-700" />
                                    <span>Upload New Academy Picture</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">Select flyer or photo file.</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUploadForSitePicture(e, 'academyBanner')}
                                  className="text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                                />
                              </div>

                              {/* URL Link */}
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-zinc-800 flex items-center gap-1 mb-1">
                                    <ImageIcon size={14} className="text-zinc-600" />
                                    <span>Or Paste Banner Link</span>
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mb-2">Paste image URL directly.</p>
                                </div>
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={siteImagesForm.academyBanner || ''}
                                  onChange={(e) => setSiteImagesForm(prev => ({ ...prev, academyBanner: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SAVE ALL CHANGES BAR */}
                      <div className="sticky bottom-4 bg-zinc-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-zinc-800 z-30">
                        <div className="flex items-center gap-2">
                          <Check className="text-emerald-400" size={18} />
                          <span className="text-xs font-bold">Ready to publish website picture updates?</span>
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingSiteImages}
                          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <RefreshCw size={14} className={isSavingSiteImages ? 'animate-spin' : ''} />
                          <span>{isSavingSiteImages ? 'Saving to Database...' : 'Save All Pictures Live'}</span>
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                {/* TAB: TESTIMONIALS & VIDEO REVIEWS */}
                {activeTab === 'testimonials' && (
                  <div className="space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200">
                      <div>
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                          <Quote size={15} />
                          <span>Featured Reviews ({testimonials.length}/3 Maximum Allowed)</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-zinc-900">Client Reviews & Video Testimonials</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Manage the 3 featured client testifiers or video reviews that appear on your homepage.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadTestimonialsFromFirestore}
                          disabled={isLoadingTestimonials}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          <RefreshCw size={14} className={isLoadingTestimonials ? 'animate-spin' : ''} />
                          <span>Refresh Reviews</span>
                        </button>

                        <button
                          onClick={handleStartAddTestimonial}
                          disabled={testimonials.length >= 3 && !isAddingTestimonial}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                            testimonials.length >= 3 && !isAddingTestimonial
                              ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                          }`}
                          title={testimonials.length >= 3 ? 'Maximum limit of 3 testimonials reached. Edit or delete an existing testimonial to add a new one.' : 'Add new testimonial'}
                        >
                          <Plus size={16} />
                          <span>+ Add Testimonial ({testimonials.length}/3)</span>
                        </button>
                      </div>
                    </div>

                    {/* Non-Tech Admin Tip Box */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 text-base">
                        💡
                      </div>
                      <div className="text-xs text-amber-950 space-y-1">
                        <p className="font-bold text-sm">How to Manage Featured Reviews</p>
                        <p className="text-amber-900 leading-relaxed">
                          To keep your homepage looking gorgeous, a maximum of 3 reviews are featured at a time. Click <strong>"+ Add Testimonial"</strong> or click the pencil icon <strong>"✏️"</strong> on any review card below to upload a client headshot, edit their review quote, or attach a video review!
                        </p>
                      </div>
                    </div>

                    {/* Max 3 Limit Notice Banner */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={18} />
                      <div className="text-xs text-amber-900">
                        <p className="font-bold">Maximum 3 Testimonials Rule</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          To maintain high page performance and elegant aesthetics, a maximum of 3 testimonials can be featured at once. You can update profile photos, add video links, or replace existing testimonials anytime!
                        </p>
                      </div>
                    </div>

                    {/* Form Modal / Panel */}
                    {isAddingTestimonial && (
                      <div className="bg-white p-6 rounded-2xl border border-amber-300 shadow-md space-y-5 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                          <h4 className="font-serif font-bold text-base text-zinc-900 flex items-center gap-2">
                            {editingTestimonial ? <Edit2 size={16} className="text-amber-600" /> : <Plus size={16} className="text-amber-600" />}
                            {editingTestimonial ? 'Edit Featured Testimonial' : 'Create New Featured Testimonial'}
                          </h4>
                          <button
                            onClick={resetTestimonialForm}
                            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={handleSaveTestimonial} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">Testifier Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Chief Dr. Folake Ademola"
                                value={testimonialForm.name}
                                onChange={(e) => setTestimonialForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">Role / Location / Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Elegant Bride (Ibadan, Nigeria)"
                                value={testimonialForm.role}
                                onChange={(e) => setTestimonialForm(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">Star Rating (1 to 5 Stars)</label>
                              <select
                                value={testimonialForm.stars}
                                onChange={(e) => setTestimonialForm(prev => ({ ...prev, stars: Number(e.target.value) }))}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-amber-500"
                              >
                                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">Format Type</label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setTestimonialForm(prev => ({ ...prev, isVideo: false }))}
                                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                                    !testimonialForm.isVideo
                                      ? 'bg-amber-600 text-white border-amber-600'
                                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  <Quote size={14} />
                                  <span>Text Review</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTestimonialForm(prev => ({ ...prev, isVideo: true }))}
                                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                                    testimonialForm.isVideo
                                      ? 'bg-amber-600 text-white border-amber-600'
                                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  <Video size={14} />
                                  <span>Video Review</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Profile Picture Upload */}
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              Profile Picture (Testifier Headshot)
                            </label>
                            <div className="flex items-center gap-3">
                              {testimonialForm.image ? (
                                <img
                                  src={testimonialForm.image}
                                  alt="Preview"
                                  className="w-12 h-12 rounded-full object-cover border border-zinc-300 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                                  <ImageIcon size={20} />
                                </div>
                              )}
                              <div className="flex-1 space-y-1.5">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleTestimonialProfilePicUpload}
                                  className="block w-full text-xs text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                                />
                                <input
                                  type="url"
                                  placeholder="...or paste image URL link"
                                  value={testimonialForm.image}
                                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, image: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Text review quote textarea */}
                          {!testimonialForm.isVideo && (
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">Written Review Quote *</label>
                              <textarea
                                rows={3}
                                required={!testimonialForm.isVideo}
                                placeholder="Enter the full review quote written by the client..."
                                value={testimonialForm.text}
                                onChange={(e) => setTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          )}

                          {/* Video Review Extra Fields */}
                          {testimonialForm.isVideo && (
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                <Video size={14} /> Video Review File & Configuration
                              </span>

                              <div>
                                <label className="block text-xs font-bold text-zinc-700 mb-1">
                                  Select Video File from Phone / Laptop Gallery (.mp4, .mov, .webm)
                                </label>
                                <div className="space-y-1.5">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleTestimonialVideoFileUpload}
                                    className="block w-full text-xs text-zinc-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                                  />
                                  {isUploadingVideoFile && (
                                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold animate-pulse">
                                      <RefreshCw size={13} className="animate-spin" />
                                      <span>Processing video & auto-capturing cover thumbnail...</span>
                                    </div>
                                  )}
                                  <div className="text-[10px] text-zinc-500 font-medium">
                                    Or paste a video link directly if hosted on YouTube, Google Drive, or external URL:
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="e.g. https://.../client_review.mp4"
                                    value={testimonialForm.videoUrl}
                                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-zinc-700 mb-1">Video Cover Poster Thumbnail</label>
                                <div className="flex items-center gap-3">
                                  {testimonialForm.videoThumbnail ? (
                                    <img
                                      src={testimonialForm.videoThumbnail}
                                      alt="Thumbnail"
                                      className="w-16 h-20 rounded-lg object-cover border border-zinc-300 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-16 h-20 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                                      <Play size={20} />
                                    </div>
                                  )}
                                  <div className="flex-1 space-y-1.5">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleTestimonialVideoThumbUpload}
                                      className="block w-full text-xs text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                                    />
                                    <input
                                      type="url"
                                      placeholder="...or paste thumbnail image URL"
                                      value={testimonialForm.videoThumbnail}
                                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, videoThumbnail: e.target.value }))}
                                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-amber-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                            <button
                              type="button"
                              onClick={resetTestimonialForm}
                              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isUploadingTestimonialPic || isUploadingVideoThumb}
                              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check size={14} />
                              <span>{editingTestimonial ? 'Update Testimonial' : 'Save Testimonial Live'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Testimonials List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {testimonials.map((t, index) => (
                        <div
                          key={t.id || index}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-amber-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex text-amber-500 gap-0.5">
                                {Array.from({ length: t.stars || 5 }).map((_, i) => (
                                  <Star key={i} size={12} className="fill-amber-400 stroke-amber-400" />
                                ))}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                t.isVideo ? 'bg-purple-100 text-purple-800' : 'bg-zinc-100 text-zinc-700'
                              }`}>
                                {t.isVideo ? 'Video Review' : 'Text Review'}
                              </span>
                            </div>

                            {t.isVideo && t.videoThumbnail && (
                              <div className="aspect-video relative rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-zinc-200">
                                <img
                                  src={t.videoThumbnail}
                                  alt={t.name}
                                  className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                                    <Play size={14} className="fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-zinc-700 italic line-clamp-4 leading-relaxed mb-4">
                              "{t.text || 'Video testimonial review'}"
                            </p>
                          </div>

                          <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 truncate">
                              <img
                                src={t.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150'}
                                alt={t.name}
                                className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                              />
                              <div className="truncate">
                                <h5 className="font-bold text-xs text-zinc-900 truncate">{t.name}</h5>
                                <p className="text-[10px] text-zinc-500 truncate">{t.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleStartEditTestimonial(t)}
                                className="p-1.5 text-zinc-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit testimonial"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete testimonial"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: CUSTOMER ORDERS & ENQUIRIES */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200">
                      <div>
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                          <Database size={15} />
                          <span>Customer Enquiries & Bookings</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-zinc-900">Live Client Requests & Orders</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Every time a client submits a Gele booking, orders from your shop, or registers for your academy, their details appear here in real-time.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = firestoreOrders.filter(ord => orderFilter === 'all' || ord.itemType === orderFilter);
                            const label = orderFilter === 'all' ? 'All_Registrations' : orderFilter === 'academy' ? 'Academy_Roster' : orderFilter === 'booking' ? 'Gele_Bookings' : 'Shop_Purchases';
                            exportOrdersToCSV(filtered, label);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
                          title="Download table data as a formatted Excel / CSV spreadsheet"
                        >
                          <Download size={14} />
                          <span>Export to Excel (.csv)</span>
                        </button>

                        <button
                          onClick={loadOrders}
                          disabled={isLoadingOrders}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <RefreshCw size={14} className={isLoadingOrders ? "animate-spin" : ""} />
                          <span>Refresh Enquiries</span>
                        </button>
                      </div>
                    </div>

                    {/* Non-Tech Admin Tip Box */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-base">
                        💡
                      </div>
                      <div className="text-xs text-emerald-950 space-y-1">
                        <p className="font-bold text-sm">How to Contact Clients Easily</p>
                        <p className="text-emerald-800 leading-relaxed">
                          Click the green <strong>"💬 WhatsApp"</strong> button next to any customer to open a chat with them directly on your phone or laptop! You can also click <strong>"📞 Call"</strong> to phone them immediately.
                        </p>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-zinc-600 mr-2">Filter Requests:</span>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === 'all'
                            ? 'bg-zinc-900 text-white shadow-xs'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        All Requests ({firestoreOrders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('booking')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === 'booking'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        👑 Gele Bookings ({firestoreOrders.filter(o => o.itemType === 'booking').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('product')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === 'product'
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        🛍️ Shop Purchases ({firestoreOrders.filter(o => o.itemType === 'product').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('academy')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === 'academy'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        🎓 Academy Students ({firestoreOrders.filter(o => o.itemType === 'academy').length})
                      </button>
                    </div>

                    {isLoadingOrders ? (
                      <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200 shadow-xs">
                        <RefreshCw size={24} className="animate-spin text-amber-600 mx-auto mb-3" />
                        <p className="text-xs font-bold text-zinc-700">Loading your customer list from database...</p>
                      </div>
                    ) : firestoreOrders.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-2xl border border-zinc-200 shadow-xs">
                        <Database size={36} className="text-zinc-300 mx-auto mb-3" />
                        <h4 className="font-bold text-base text-zinc-800">No Customer Enquiries Yet</h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                          When a client submits a booking form or orders a headtie on your website, their contact details will show up right here.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-100 text-[11px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-200">
                              <tr>
                                <th className="p-4">Customer Details</th>
                                <th className="p-4">Requested Item / Service</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price / Fee</th>
                                <th className="p-4">Event Date / Notes</th>
                                <th className="p-4 text-right">Quick Contact Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 font-sans">
                              {firestoreOrders
                                .filter(ord => orderFilter === 'all' || ord.itemType === orderFilter)
                                .map((ord, idx) => {
                                  const cleanPhone = ord.clientPhone ? ord.clientPhone.replace(/[^0-9]/g, '') : '';
                                  const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}` : null;
                                  
                                  return (
                                    <tr key={ord.id || idx} className="hover:bg-amber-50/40 transition-colors">
                                      <td className="p-4 text-zinc-800">
                                        <div className="font-bold text-sm text-zinc-900">{ord.clientName || 'Valued Client'}</div>
                                        {ord.registrationId && (
                                          <div className="inline-block mt-1 font-mono text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                                            ID: {ord.registrationId}
                                          </div>
                                        )}
                                        {ord.clientPhone && (
                                          <div className="flex items-center gap-1.5 text-xs text-zinc-700 font-semibold mt-1">
                                            <Phone size={12} className="text-zinc-500" />
                                            <span>{ord.clientPhone}</span>
                                          </div>
                                        )}
                                        {ord.clientEmail && (
                                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                                            <Mail size={11} />
                                            <span>{ord.clientEmail}</span>
                                          </div>
                                        )}
                                      </td>

                                      <td className="p-4 font-bold text-zinc-900 text-xs">
                                        <div className="max-w-xs">{ord.itemTitle}</div>
                                        {ord.seatNumber && ord.seatNumber !== 'N/A' && (
                                          <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                                            <span>🪑 {ord.seatNumber}</span>
                                          </div>
                                        )}
                                      </td>

                                      <td className="p-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                          ord.itemType === 'booking' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                                          ord.itemType === 'academy' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                                          'bg-amber-100 text-amber-900 border border-amber-200'
                                        }`}>
                                          {ord.itemType === 'booking' ? '👑 Gele Booking' :
                                           ord.itemType === 'academy' ? '🎓 Academy Student' :
                                           '🛍️ Shop Product'}
                                        </span>
                                      </td>

                                      <td className="p-4 font-mono font-bold text-sm text-zinc-900">
                                        {ord.amount ? `₦${ord.amount.toLocaleString()}` : 'Custom Quote'}
                                      </td>

                                      <td className="p-4 text-zinc-600 max-w-xs">
                                        {ord.date && <div className="font-bold text-zinc-900 text-xs">{ord.date}</div>}
                                        {ord.location && <div className="text-[11px] text-zinc-500">{ord.location}</div>}
                                        {ord.notes && <div className="text-[11px] text-zinc-500 italic mt-0.5 line-clamp-2">"{ord.notes}"</div>}
                                      </td>

                                      <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          {waLink && (
                                            <a
                                              href={waLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                                              title="Open WhatsApp chat with client"
                                            >
                                              <MessageSquare size={13} />
                                              <span>WhatsApp</span>
                                            </a>
                                          )}

                                          {ord.clientPhone && (
                                            <a
                                              href={`tel:${ord.clientPhone}`}
                                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-colors"
                                              title="Call client phone number"
                                            >
                                              <PhoneCall size={13} />
                                              <span>Call</span>
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
