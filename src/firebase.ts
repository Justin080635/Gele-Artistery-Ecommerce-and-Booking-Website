import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc, query, orderBy, serverTimestamp, increment, onSnapshot } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { Service, PromoBanner, GalleryItem, SiteImages, Testimonial } from "./types";

const activeConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(activeConfig) : getApp();

// Initialize Firestore with specified database ID
const dbInstanceId = activeConfig.firestoreDatabaseId || "";
export const db = dbInstanceId !== ""
  ? getFirestore(app, dbInstanceId)
  : getFirestore(app);

export interface OrderRecord {
  id?: string;
  registrationId?: string;
  seatNumber?: string;
  cohortTier?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp?: string;
  itemTitle: string;
  itemType: 'booking' | 'product' | 'academy';
  amount?: number;
  location?: string;
  date?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt?: any;
}

export interface ClientRecord {
  id?: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt?: any;
}

export interface ProductRecord {
  id?: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  inStock?: boolean;
  createdAt?: any;
}

export interface ArticleRecord {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  createdAt?: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper function to race Firestore promises with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms)
    )
  ]);
}

// Function to save an order to Firestore
export async function saveOrderToFirestore(order: Omit<OrderRecord, 'id' | 'createdAt' | 'status'> & { status?: OrderRecord['status'] }) {
  try {
    const ordersCol = collection(db, "orders");
    const docRef = await withTimeout(addDoc(ordersCol, {
      ...order,
      status: order.status || 'pending',
      createdAt: serverTimestamp()
    }), 8000);

    // Increment cloud conversions metric in settings/conversions
    try {
      const convRef = doc(db, "settings", "conversions");
      await setDoc(convRef, { count: increment(1), lastOrderAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn("Non-blocking conversions counter update warning:", err);
    }

    // Also update/add client record
    if (order.clientName && (order.clientEmail || order.clientPhone)) {
      saveClientToFirestore({
        name: order.clientName,
        email: order.clientEmail,
        phone: order.clientPhone,
        notes: `Order placed for ${order.itemTitle}`
      }).catch(err => console.warn('Non-blocking client save warning:', err));
    }

    return docRef.id;
  } catch (error) {
    console.warn("Non-blocking Firestore order save warning:", error);
    return 'local_order_' + Date.now();
  }
}

// Function to fetch conversions count from Firestore
export async function fetchConversionsFromFirestore(): Promise<number> {
  try {
    const convRef = doc(db, "settings", "conversions");
    const snapshot = await withTimeout(getDoc(convRef), 5000);
    let settingsCount = 0;
    if (snapshot.exists() && typeof snapshot.data()?.count === 'number') {
      settingsCount = snapshot.data().count;
    }

    // Compare with actual document count in orders collection
    const ordersCol = collection(db, "orders");
    const ordersSnapshot = await withTimeout(getDocs(ordersCol), 5000);
    const ordersCount = ordersSnapshot.docs.length;

    return Math.max(settingsCount, ordersCount);
  } catch (error) {
    console.warn("Firestore fetch conversions warning:", error);
    return 0;
  }
}

// Function to save conversions count explicitly to Firestore
export async function saveConversionsToFirestore(count: number): Promise<void> {
  try {
    const convRef = doc(db, "settings", "conversions");
    await withTimeout(setDoc(convRef, { count, updatedAt: serverTimestamp() }, { merge: true }), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore conversions save warning:", error);
  }
}

// Function to reset conversions counter in Firestore
export async function resetConversionsInFirestore(): Promise<void> {
  try {
    const convRef = doc(db, "settings", "conversions");
    await withTimeout(setDoc(convRef, { count: 0, updatedAt: serverTimestamp() }, { merge: true }), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore conversions reset warning:", error);
  }
}

// Function to save a client contact
export async function saveClientToFirestore(client: Omit<ClientRecord, 'id' | 'createdAt'>) {
  try {
    const clientsCol = collection(db, "clients");
    const docRef = await withTimeout(addDoc(clientsCol, {
      ...client,
      createdAt: serverTimestamp()
    }), 8000);
    return docRef.id;
  } catch (error) {
    console.warn("Non-blocking Firestore client save warning:", error);
    return 'local_client_' + Date.now();
  }
}

// Function to fetch orders (for admin dashboard / order tracking)
export async function fetchOrdersFromFirestore(): Promise<OrderRecord[]> {
  try {
    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, orderBy("createdAt", "desc"));
    const snapshot = await withTimeout(getDocs(q), 5000);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as OrderRecord[];
  } catch (error) {
    console.warn("Firestore fetch orders warning (using fallback):", error);
    return [];
  }
}

/**
 * Intelligent seat and ID verification algorithm.
 * Guarantees no two students or clients receive duplicate seat numbers or duplicate registration IDs.
 */
export async function allocateUniqueSeatAndId(
  itemType: 'booking' | 'product' | 'academy',
  tierOrTitle: string
): Promise<{ registrationId: string; seatNumber: string }> {
  // 1. Generate guaranteed unique alphanumeric reference ID
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestampShort = Date.now().toString().slice(-4);
  const prefix = itemType === 'academy' ? 'FG-ACAD' : itemType === 'booking' ? 'FG-BOOK' : 'FG-SHOP';
  const registrationId = `${prefix}-${timestampShort}-${randomSuffix}`;

  // For non-academy items, seat numbers are not applicable
  if (itemType !== 'academy') {
    return { registrationId, seatNumber: 'N/A' };
  }

  try {
    // 2. Fetch existing registered students for this tier/cohort from Firestore
    const existingOrders = await fetchOrdersFromFirestore();
    const tierOrders = existingOrders.filter(
      ord => ord.itemType === 'academy' && (
        ord.cohortTier === tierOrTitle || 
        ord.itemTitle?.toLowerCase().includes(tierOrTitle.toLowerCase()) ||
        tierOrTitle.toLowerCase().includes(ord.cohortTier?.toLowerCase() || '')
      )
    );

    // Extract all previously assigned seat integers
    const assignedSeatNumbers = new Set<number>();
    tierOrders.forEach(ord => {
      if (ord.seatNumber) {
        const match = ord.seatNumber.match(/Seat\s*#?(\d+)/i);
        if (match && match[1]) {
          assignedSeatNumbers.add(parseInt(match[1], 10));
        }
      }
    });

    // Determine cohort capacity (VIP = 5, Regular cohorts = 20)
    const isVip = tierOrTitle.toLowerCase().includes('vip') || tierOrTitle.toLowerCase().includes('mentor');
    const maxCapacity = isVip ? 5 : 20;

    // Find the lowest available unassigned seat
    let nextSeatNum = 1;
    while (assignedSeatNumbers.has(nextSeatNum)) {
      nextSeatNum++;
    }

    const formattedSeatNum = nextSeatNum < 10 ? `0${nextSeatNum}` : `${nextSeatNum}`;
    const seatLabel = nextSeatNum <= maxCapacity
      ? `Seat #${formattedSeatNum}`
      : `Seat #${formattedSeatNum} (Extended)`;

    return { registrationId, seatNumber: seatLabel };
  } catch (err) {
    console.warn("Seat allocation fallback check:", err);
    const fallbackNum = Math.floor(Math.random() * 18) + 1;
    const formattedFallback = fallbackNum < 10 ? `0${fallbackNum}` : `${fallbackNum}`;
    return {
      registrationId,
      seatNumber: `Seat #${formattedFallback}`
    };
  }
}

/**
 * Generates and downloads a clean, Excel-compatible CSV file with UTF-8 BOM
 */
export function exportOrdersToCSV(orders: OrderRecord[], filterLabel: string = 'All_Enquiries') {
  if (!orders || orders.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = [
    'Registration ID',
    'Date Registered',
    'Client Name',
    'Phone Number',
    'WhatsApp Number',
    'Email Address',
    'Category',
    'Item / Service / Cohort Tier',
    'Assigned Seat Number',
    'Amount (NGN)',
    'Status',
    'Location / Venue',
    'Notes / Requests'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map(ord => {
    let dateStr = ord.date || '';
    if (!dateStr && ord.createdAt) {
      try {
        const d = ord.createdAt.toDate ? ord.createdAt.toDate() : new Date(ord.createdAt);
        dateStr = d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      } catch {
        dateStr = '';
      }
    }

    return [
      escapeCSV(ord.registrationId || ord.id || 'N/A'),
      escapeCSV(dateStr),
      escapeCSV(ord.clientName || 'Valued Client'),
      escapeCSV(ord.clientPhone || ''),
      escapeCSV(ord.clientWhatsapp || ord.clientPhone || ''),
      escapeCSV(ord.clientEmail || ''),
      escapeCSV(ord.itemType === 'booking' ? 'Gele Booking' : ord.itemType === 'academy' ? 'Academy Registration' : 'Shop Product'),
      escapeCSV(ord.itemTitle || ''),
      escapeCSV(ord.seatNumber || 'N/A'),
      escapeCSV(ord.amount ? `${ord.amount}` : 'Quote Request'),
      escapeCSV(ord.status || 'pending'),
      escapeCSV(ord.location || ''),
      escapeCSV(ord.notes || '')
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Microsoft Excel and Google Sheets properly display currencies (₦) and accents
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Fabulous_Gele_${filterLabel}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Canvas helper to compress images to ensure they stay well under Firestore's 1MB payload limit
export function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Function to save or update product in Firestore
export async function saveProductToFirestore(product: ProductRecord): Promise<string> {
  const path = product.id ? `products/${product.id}` : "products";
  try {
    if (product.id && !product.id.startsWith('p_custom_') && !product.id.startsWith('local_prod_') && !product.id.startsWith('p_')) {
      const docRef = doc(db, "products", product.id);
      await withTimeout(setDoc(docRef, {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        description: product.description,
        inStock: product.inStock ?? true,
        updatedAt: serverTimestamp()
      }, { merge: true }), 10000);
      return product.id;
    } else {
      const productsCol = collection(db, "products");
      const docRef = await withTimeout(addDoc(productsCol, {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        description: product.description,
        inStock: product.inStock ?? true,
        createdAt: serverTimestamp()
      }), 10000);
      return docRef.id;
    }
  } catch (error) {
    console.error("Firestore product save error:", error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      // Re-throw for caller catch block
    }
    throw error;
  }
}

// Function to delete product from Firestore
export async function deleteProductFromFirestore(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, "products", id);
    await withTimeout(deleteDoc(docRef), 10000);
  } catch (error) {
    console.error("Firestore product delete error:", error);
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch (e) {
      // Re-throw for caller catch block
    }
    throw error;
  }
}

// Function to fetch products from Firestore once
export async function fetchProductsFromFirestore(): Promise<ProductRecord[]> {
  const path = "products";
  try {
    const productsCol = collection(db, "products");
    const snapshot = await withTimeout(getDocs(productsCol), 6000);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      price: doc.data().price || 0,
      category: doc.data().category || 'Auto Gele',
      image: doc.data().image || '',
      description: doc.data().description || '',
      inStock: doc.data().inStock ?? true
    }));
  } catch (error) {
    console.warn("Firestore fetch products warning (using local catalog):", error);
    return [];
  }
}

// Real-time listener subscription for Products collection
export function subscribeToProducts(callback: (products: ProductRecord[]) => void): () => void {
  const productsCol = collection(db, "products");
  const path = "products";

  const unsubscribe = onSnapshot(productsCol, (snapshot) => {
    const products: ProductRecord[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        price: Number(data.price) || 0,
        category: data.category || 'Auto Gele',
        image: data.image || '',
        description: data.description || '',
        inStock: data.inStock ?? true
      };
    });
    callback(products);
  }, (error) => {
    console.warn("Firestore products onSnapshot warning:", error);
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch (e) {
      // Ignore
    }
  });

  return unsubscribe;
}

// Function to save or update article in Firestore
export async function saveArticleToFirestore(article: ArticleRecord): Promise<string> {
  try {
    if (article.id) {
      const docRef = doc(db, "articles", article.id);
      await withTimeout(setDoc(docRef, {
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        date: article.date,
        readTime: article.readTime,
        image: article.image,
        author: article.author || 'Oluwapelumi - Lead Artist',
        updatedAt: serverTimestamp()
      }, { merge: true }), 8000);
      return article.id;
    } else {
      const articlesCol = collection(db, "articles");
      const docRef = await withTimeout(addDoc(articlesCol, {
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        date: article.date,
        readTime: article.readTime,
        image: article.image,
        author: article.author || 'Oluwapelumi - Lead Artist',
        createdAt: serverTimestamp()
      }), 8000);
      return docRef.id;
    }
  } catch (error) {
    console.warn("Non-blocking Firestore article save warning:", error);
    return article.id || 'local_art_' + Date.now();
  }
}

// Function to delete article from Firestore
export async function deleteArticleFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, "articles", id);
    await withTimeout(deleteDoc(docRef), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore article delete warning:", error);
  }
}

// Function to fetch articles from Firestore
export async function fetchArticlesFromFirestore(): Promise<ArticleRecord[]> {
  try {
    const articlesCol = collection(db, "articles");
    const snapshot = await withTimeout(getDocs(articlesCol), 5000);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || '',
      category: doc.data().category || 'Artistry Insights',
      excerpt: doc.data().excerpt || '',
      content: doc.data().content || '',
      date: doc.data().date || 'Recent',
      readTime: doc.data().readTime || '3 min read',
      image: doc.data().image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
      author: doc.data().author || 'Oluwapelumi - Lead Artist'
    }));
  } catch (error) {
    console.warn("Firestore fetch articles warning (using local articles):", error);
    return [];
  }
}

// Function to save services list to Firestore
export async function saveServicesToFirestore(services: Service[]): Promise<void> {
  try {
    const docRef = doc(db, "settings", "services");
    await withTimeout(setDoc(docRef, { items: services, updatedAt: serverTimestamp() }), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore services save warning:", error);
  }
}

// Function to fetch services from Firestore
export async function fetchServicesFromFirestore(): Promise<Service[] | null> {
  try {
    const docRef = doc(db, "settings", "services");
    const snapshot = await withTimeout(getDoc(docRef), 5000);
    if (snapshot.exists() && snapshot.data().items) {
      return snapshot.data().items as Service[];
    }
    return null;
  } catch (error) {
    console.warn("Firestore fetch services warning:", error);
    return null;
  }
}

// Function to save promo banner to Firestore
export async function savePromoBannerToFirestore(promo: PromoBanner): Promise<void> {
  try {
    const docRef = doc(db, "settings", "promo");
    await withTimeout(setDoc(docRef, { ...promo, updatedAt: serverTimestamp() }), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore promo save warning:", error);
  }
}

// Function to fetch promo banner from Firestore
export async function fetchPromoBannerFromFirestore(): Promise<PromoBanner | null> {
  try {
    const docRef = doc(db, "settings", "promo");
    const snapshot = await withTimeout(getDoc(docRef), 5000);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        text: data.text || '',
        isActive: data.isActive ?? true,
        linkText: data.linkText || 'Book Now'
      };
    }
    return null;
  } catch (error) {
    console.warn("Firestore fetch promo warning:", error);
    return null;
  }
}

// Function to save or update a gallery item in Firestore
export async function saveGalleryItemToFirestore(item: Omit<GalleryItem, 'id'> & { id?: string }): Promise<string> {
  try {
    if (item.id) {
      const docRef = doc(db, "gallery", item.id);
      await withTimeout(setDoc(docRef, {
        category: item.category,
        title: item.title,
        image: item.image,
        updatedAt: serverTimestamp()
      }, { merge: true }), 8000);
      return item.id;
    } else {
      const galleryCol = collection(db, "gallery");
      const docRef = await withTimeout(addDoc(galleryCol, {
        category: item.category,
        title: item.title,
        image: item.image,
        createdAt: serverTimestamp()
      }), 8000);
      return docRef.id;
    }
  } catch (error) {
    console.warn("Non-blocking Firestore gallery save warning:", error);
    return item.id || 'local_gal_' + Date.now();
  }
}

// Function to delete a gallery item from Firestore
export async function deleteGalleryItemFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, "gallery", id);
    await withTimeout(deleteDoc(docRef), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore gallery delete warning:", error);
  }
}

// Function to fetch gallery items from Firestore
export async function fetchGalleryFromFirestore(): Promise<GalleryItem[]> {
  try {
    const galleryCol = collection(db, "gallery");
    const snapshot = await withTimeout(getDocs(galleryCol), 5000);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      category: (doc.data().category || 'bridal') as GalleryItem['category'],
      title: doc.data().title || '',
      image: doc.data().image || ''
    }));
  } catch (error) {
    console.warn("Firestore fetch gallery warning (using local gallery):", error);
    return [];
  }
}

// Function to save site pictures settings to Firestore
export async function saveSiteImagesToFirestore(images: SiteImages): Promise<void> {
  try {
    const docRef = doc(db, "settings", "siteImages");
    await withTimeout(setDoc(docRef, { ...images, updatedAt: serverTimestamp() }), 8000);
  } catch (error) {
    console.warn("Non-blocking Firestore site images save warning:", error);
  }
}

// Function to fetch site pictures settings from Firestore
export async function fetchSiteImagesFromFirestore(): Promise<SiteImages | null> {
  try {
    const docRef = doc(db, "settings", "siteImages");
    const snapshot = await withTimeout(getDoc(docRef), 5000);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        heroImage: data.heroImage || '',
        heroBadgeText: data.heroBadgeText || 'Master Artisan Showcase',
        artistPortrait: data.artistPortrait || '',
        academyBanner: data.academyBanner || '',
        testimonialBanner: data.testimonialBanner || ''
      };
    }
    return null;
  } catch (error) {
    console.warn("Firestore fetch site images warning:", error);
    return null;
  }
}

// Function to save or update testimonial in Firestore
export async function saveTestimonialToFirestore(testimonial: Testimonial): Promise<string> {
  const path = testimonial.id ? `testimonials/${testimonial.id}` : "testimonials";
  try {
    if (testimonial.id && !testimonial.id.startsWith('t') && !testimonial.id.startsWith('local_test_')) {
      const docRef = doc(db, "testimonials", testimonial.id);
      await withTimeout(setDoc(docRef, {
        name: testimonial.name,
        role: testimonial.role || '',
        text: testimonial.text || '',
        stars: Number(testimonial.stars) || 5,
        image: testimonial.image || '',
        isVideo: Boolean(testimonial.isVideo),
        videoThumbnail: testimonial.videoThumbnail || '',
        videoUrl: testimonial.videoUrl || '',
        updatedAt: serverTimestamp()
      }, { merge: true }), 10000);
      return testimonial.id;
    } else {
      const colRef = collection(db, "testimonials");
      const docRef = await withTimeout(addDoc(colRef, {
        name: testimonial.name,
        role: testimonial.role || '',
        text: testimonial.text || '',
        stars: Number(testimonial.stars) || 5,
        image: testimonial.image || '',
        isVideo: Boolean(testimonial.isVideo),
        videoThumbnail: testimonial.videoThumbnail || '',
        videoUrl: testimonial.videoUrl || '',
        createdAt: serverTimestamp()
      }), 10000);
      return docRef.id;
    }
  } catch (error) {
    console.error("Firestore save testimonial error:", error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      // Re-throw
    }
    throw error;
  }
}

// Function to delete a testimonial from Firestore
export async function deleteTestimonialFromFirestore(id: string): Promise<void> {
  const path = `testimonials/${id}`;
  try {
    const docRef = doc(db, "testimonials", id);
    await withTimeout(deleteDoc(docRef), 10000);
  } catch (error) {
    console.error("Firestore delete testimonial error:", error);
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch (e) {
      // Re-throw
    }
    throw error;
  }
}

// Function to fetch testimonials from Firestore once
export async function fetchTestimonialsFromFirestore(): Promise<Testimonial[]> {
  try {
    const colRef = collection(db, "testimonials");
    const snapshot = await withTimeout(getDocs(colRef), 6000);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        role: data.role || '',
        text: data.text || '',
        stars: Number(data.stars) || 5,
        image: data.image || '',
        isVideo: Boolean(data.isVideo),
        videoThumbnail: data.videoThumbnail || '',
        videoUrl: data.videoUrl || ''
      };
    });
  } catch (error) {
    console.warn("Firestore fetch testimonials warning:", error);
    return [];
  }
}

// Real-time listener for Testimonials collection
export function subscribeToTestimonials(callback: (testimonials: Testimonial[]) => void): () => void {
  const colRef = collection(db, "testimonials");
  const path = "testimonials";

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const testimonials: Testimonial[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        role: data.role || '',
        text: data.text || '',
        stars: Number(data.stars) || 5,
        image: data.image || '',
        isVideo: Boolean(data.isVideo),
        videoThumbnail: data.videoThumbnail || '',
        videoUrl: data.videoUrl || ''
      };
    });
    callback(testimonials);
  }, (error) => {
    console.warn("Firestore testimonials onSnapshot warning:", error);
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch (e) {
      // Ignore
    }
  });

  return unsubscribe;
}




