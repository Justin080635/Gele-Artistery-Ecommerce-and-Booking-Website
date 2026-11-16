import { Service, Product, Testimonial, GalleryItem, BlogPost, FAQItem } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'bridal_gele',
    name: 'Bridal Gele Styling',
    description: 'Bespoke, flawless gele styling for the elegant bride. Styled to perfection to make you look majestic and radiate confidence on your big day.',
    pricingInfo: 'From ₦30,000',
    tiers: [
      { name: 'Home Service (Ibadan)', price: '₦30,000' },
      { name: 'Outside Ibadan Service', price: '₦70,000' }
    ],
    details: [
      'In-person custom styling at your venue or hotel room',
      'Long-lasting fold techniques tailored to your face shape',
      'Assistance with bridal veil positioning (if requested)',
      'Bridal touch-up kit support',
      'Travel and logistics covered within primary service area (for home service)'
    ],
    iconName: 'Crown'
  },
  {
    id: 'party_guests',
    name: 'Party Guests / Owambe Glam',
    description: 'Be the center of attention with a beautifully crafted gele that complements your elegant party outfit. Perfect for weddings, birthdays, and anniversaries.',
    pricingInfo: '₦15,000 per gele',
    details: [
      'Styled in-studio or at group locations',
      'Choice of modern fan gele, pleats, rose, or structured folds',
      'Secure, lightweight pin-up that lasts all night',
      'Takes 15-20 minutes per head'
    ],
    iconName: 'Sparkles'
  },
  {
    id: 'photoshoot_gele',
    name: 'Pre-wedding & Photoshoot Styling',
    description: 'High-definition gele artistry optimized for professional studio lighting and camera angles. Ideal for pre-wedding shoots, maternity sessions, and branding.',
    pricingInfo: '₦15,000 per gele',
    details: [
      'Collaboration with your makeup artist and photographer',
      'Symmetry check for close-up portraits',
      'Two styling adjustments or look transitions during the shoot'
    ],
    iconName: 'Camera'
  },
  {
    id: 'aso_ebi_ladies',
    name: 'Aso Ebi Ladies Styling',
    description: 'Group gele styling services to ensure your squad looks cohesive, elegant, and perfectly styled. Discounted group rates apply.',
    pricingInfo: '₦10,000 per gele',
    details: [
      'Cohesive styling patterns for the entire squad',
      'Available for groups of 5 or more',
      'Efficient flow-through to keep your event timeline on track',
      'Uniform neatness and styling height'
    ],
    iconName: 'Users'
  },
  {
    id: 'gele_training',
    name: 'Fabulous Gele Academy',
    description: 'Professional Gele Training Institute in Ibadan. 2-Week Intensive Cohort classes covering beginner foundations to luxury bridal mastery and business growth.',
    pricingInfo: 'From ₦30,000',
    tiers: [
      { name: 'Tier 1 – Beginner Cohort', price: '₦30,000' },
      { name: 'Tier 2 – Intermediate Cohort', price: '₦50,000' },
      { name: 'Tier 3 – Professional Cohort (Elite)', price: '₦70,000' },
      { name: 'VIP Elite Mentorship', price: '₦100,000' }
    ],
    details: [
      '2-Week Intensive Cohort (Physical Classes in Ibadan)',
      'Schedule: Mondays, Wednesdays & Fridays (3–4 hours/class)',
      'Limited Seats: 10–20 students per batch for hands-on attention',
      'Early Bird Discount: Save ₦10,000 when registering 2+ weeks early',
      'Certificate of Completion, Manual, & Alumni Community Access'
    ],
    iconName: 'BookOpen'
  },
  {
    id: 'ready_to_wear',
    name: 'Ready-to-Wear Auto Gele',
    description: 'Enjoy the beauty of a professional gele without the stress. Elegant, pre-pleated, fully adjustable auto geles custom-made to fit any head size.',
    pricingInfo: '₦12,000 – ₦25,000',
    details: [
      'Custom crafted with your choice of premium Aso-Oke fabric',
      'Velcro fastener or adjustable buckle system for secure comfort',
      'Ready to wear in under 60 seconds with zero help',
      'Perfect for international clients and quick events'
    ],
    iconName: 'ShoppingBag'
  },
  {
    id: 'senator_caps',
    name: 'Senator Caps for Men',
    description: 'Tailored traditional caps for men, designed to match native attire with structure and class. Handcrafted for premium gentlemen.',
    pricingInfo: '₦8,000 – ₦15,000',
    details: [
      'Durable, structured interlining that maintains shape',
      'Custom sizes made to fit your head circumference',
      'Available in premium wool, cashmeres, or woven fabrics',
      'Wide color selection to complement any native style'
    ],
    iconName: 'Award'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Royal Emerald Auto Gele',
    price: 18000,
    category: 'Auto Gele',
    image: 'https://images.unsplash.com/photo-1607831958387-aa07223bdf33?auto=format&fit=crop&q=80&w=800',
    description: 'Elegantly pre-pleated auto gele in stunning emerald green with a subtle gold sparkle thread weave. Fully adjustable fit.',
    inStock: true
  },
  {
    id: 'p2',
    name: 'Majestic Gold Metallic Aso-Oke',
    price: 25000,
    category: 'Fabrics',
    image: 'https://images.unsplash.com/photo-1605493743455-c5d45230985f?auto=format&fit=crop&q=80&w=800',
    description: 'A premium, tightly woven traditional Aso-Oke fabric with metallic gold accents. Perfect for high-status Owambe styling.',
    inStock: true
  },
  {
    id: 'p3',
    name: 'Presidential Cashmere Senator Cap',
    price: 12000,
    category: 'Senator Caps',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    description: 'Structured traditional male cap made from pure imported white cashmere wool. Built to sit perfectly with pride.',
    inStock: true
  },
  {
    id: 'p4',
    name: 'Rose-gold Crystal Gele Pins',
    price: 3500,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    description: 'A pack of 12 luxury crystal-encrusted pins to lock your gele folds while adding subtle, sparkling premium detail.',
    inStock: true
  },
  {
    id: 'p5',
    name: 'Onyx Black Pleated Auto Gele',
    price: 16000,
    category: 'Auto Gele',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800',
    description: 'Classic and highly versatile black auto gele. Pre-pleated with deep folds, suited for both casual and high-end formal wear.',
    inStock: true
  },
  {
    id: 'p6',
    name: 'Sage Meadow Floral Velvet Gele',
    price: 22000,
    category: 'Auto Gele',
    image: 'https://images.unsplash.com/photo-1532453242-95cd2a5e9334?auto=format&fit=crop&q=80&w=800',
    description: 'Limited edition luxury velvet auto gele in soft sage green with soft botanical details. Exquisite texture and comfort.',
    inStock: true
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    category: 'bridal',
    title: 'Flawless Regal Bridal Gele',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g2',
    category: 'owambe',
    title: 'Emerald Millionaire Fan Fold',
    image: 'https://images.unsplash.com/photo-1607831958387-aa07223bdf33?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g3',
    category: 'asoebi',
    title: 'Symmetrical Aso Ebi Group Pleats',
    image: 'https://images.unsplash.com/photo-1605493743455-c5d45230985f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g4',
    category: 'before_after',
    title: 'Traditional Transformation Step-by-Step',
    image: 'https://images.unsplash.com/photo-1532453242-95cd2a5e9334?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g5',
    category: 'bts',
    title: 'Backstage at Lagos Fashion Week',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g6',
    category: 'training',
    title: 'Hands-on Gele-Tying Masterclass (Blue Gele)',
    image: '/src/assets/images/tutor_teaching_blue_1784637098304.jpg'
  },
  {
    id: 'g7',
    category: 'bridal',
    title: 'Pure White Premium Bridal Pleats',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g8',
    category: 'owambe',
    title: 'Dynamic Rose-Shape Crown Gele',
    image: 'https://images.unsplash.com/photo-1566807812180-43d6463f7a89?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'g9',
    category: 'training',
    title: 'Finished Models Showcase (Green & Blue)',
    image: '/src/assets/images/tutor_and_models_1784637118947.jpg'
  },
  {
    id: 'g10',
    category: 'training',
    title: 'Gele Artistry Hands-on Training (Green Gele)',
    image: '/src/assets/images/tutor_teaching_green_1784637134935.jpg'
  },
  {
    id: 'g11',
    category: 'training',
    title: '2-Week Gele Professional Masterclass Flyer',
    image: '/src/assets/images/academy_flyer_1784637074409.jpg'
  },
  {
    id: 'g12',
    category: 'training',
    title: 'GELE by Him — 2 Weeks Gele Training Masterclass Poster',
    image: '/src/assets/images/gele_by_him_1784695959540.jpg'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Bukola Adebayo',
    role: 'Traditional Bride (Ibadan)',
    text: 'Fabulous Gele made me feel like an absolute queen on my engagement day. The folds were so crisp, perfectly aligned, and did not shift for a single second from 8 AM till late night! Best decision ever.',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150',
    isVideo: false
  },
  {
    id: 't2',
    name: 'Yetunde Shonekan',
    role: 'Aso Ebi Coordinator',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=150',
    isVideo: true,
    videoThumbnail: 'https://images.unsplash.com/photo-1607831958387-aa07223bdf33?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' // safe public placeholder video
  },
  {
    id: 't3',
    name: 'Mrs. Funmi Alao',
    role: 'Owambe Guest',
    text: 'I ordered the Ready-to-Wear Royal Emerald Auto Gele and it was a complete lifesaver. I styled myself in 30 seconds inside the car! People kept asking who wrapped it. Incredible design.',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1532453242-95cd2a5e9334?auto=format&fit=crop&q=80&w=150',
    isVideo: false
  },
  {
    id: 't4',
    name: 'Oluwaseun Daniels',
    role: 'Gele Masterclass Graduate',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    isVideo: true,
    videoThumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 't5',
    name: 'Chioma Nwachukwu',
    role: 'Bridal Client',
    text: 'Highly professional. Arrived exactly on time, brought beautiful positive energy, and delivered the exact avant-garde styling I requested. My traditional look was an internet hit!',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1605493743455-c5d45230985f?auto=format&fit=crop&q=80&w=150',
    isVideo: false
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'How to Make Your Gele Last All Day',
    excerpt: 'Simple professional hacks to secure your gele, prevent headaches, and keep those pleats crisp from morning church till the late-night afterparty.',
    content: `Gele is the ultimate crown of any traditional outfit. However, we have all experienced the dread of a shifting head-tie or the throbbing headache of one wrapped too tightly. As professionals, here are our top secrets to a comfortable, long-lasting gele:

1. **Choose the Right Fabric Base**: Real Aso-Oke or high-grade Segun paper-gele fabrics provide the structural integrity required to lock folds. Cheaper, overly soft fabrics will sag under pressure.
2. **Start with a Good Under-cap**: Always wear a velvet or high-friction grip wig band underneath. This prevents your hair's natural oils from sliding against the fabric, offering a solid anchor.
3. **The Ear Comfort Rule**: Ensure your stylist does not wrap directly over the cartilage of your ears. Folds should sit just above or hug gently behind, otherwise circulation gets pinched.
4. **Use High-tension Rust-free Pins**: Secure key structural points at the back with specific steel styling pins, sliding them along the grain of the fold, never vertically against it.

By adopting these quick principles, you can dance with confidence knowing your crown sits perfectly.`,
    date: 'Jul 15, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1607831958387-aa07223bdf33?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'b2',
    title: '10 Bridal Gele Mistakes to Avoid on Your Big Day',
    excerpt: 'From poor fabric matching to terrible timing, ensure your traditional look goes off without a hitch with this essential bridal guide.',
    content: `Your wedding is one of the most photographed moments of your life. As the bride, your gele frames your face and sets the tone for your entire ensemble. Avoid these critical mistakes:

1. **Buying stiff, low-grade Aso-Oke**: Modern bridal looks require soft, malleable, but sturdy metallic weave threads.
2. **styling after wearing the gown**: Always style your gele *before* putting on heavily embellished bridal gowns to prevent makeup or hair spray transfer.
3. **Ignoring face shape proportions**: A round face benefit from higher, vertical pleats. An elongated face looks stunning with soft, wider fan layouts.
4. **Skipping the trial**: Always test-wrap your fabric once with your stylist to verify length and flexibility.`,
    date: 'Jun 28, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'b3',
    title: 'Best Gele Colours for Dark Skin Tones',
    excerpt: 'Celebrate African beauty with the ultimate color-matching guide. Learn which shades of emerald, gold, and magenta make melanin pop.',
    content: `Melanin is a rich canvas that interacts beautifully with vibrant light. Choosing the right gele color is about elevating your skin's natural undertones:

- **Warm Undertones**: Royal Gold, Mustard Yellow, Champagne, and Bronze bring out incredible golden brilliance.
- **Cool Undertones**: Deep Emerald Green, Midnight Cobalt Blue, and Rich Ruby Magenta pop with dramatic, high-end contrast.
- **Neutral Undertones**: Warm Teal, Sage, Cream, and soft Peach offer a sophisticated, modern, and understated bridal elegance.

Don't be afraid of bold hues! Traditional African attire is celebrated precisely for its magnificent relationship with color.`,
    date: 'May 14, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1532453242-95cd2a5e9334?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    question: 'How do I book a styling session?',
    answer: 'Simply navigate to our "Book Now" section, select your desired service (e.g., Bridal Gele or Owambe Guest), choose your date and time, fill in your details, and submit. You will receive a direct WhatsApp summary message to finalize and confirm your appointment.'
  },
  {
    question: 'Do you travel outside Ibadan?',
    answer: 'Yes! We offer styling services outside Ibadan. For weddings and major group bookings, we regularly travel to Lagos, Abeokuta, Osogbo, and international destinations. Our "Outside Ibadan" flat booking rate covers primary long-distance styling services, with travel/accommodation fees discussed on a case-by-case basis.'
  },
  {
    question: 'What is your refund and cancellation policy?',
    answer: 'To secure your date and block our stylists from taking other bookings, we require a deposit or full payment. Please note that there is a strict "No Refund after Payment" policy. However, we understand emergencies happen and will happily help you reschedule to another available date if notified at least 72 hours in advance.'
  },
  {
    question: 'How long does a single gele wrap session take?',
    answer: 'A standard guest or Aso Ebi styling session takes approximately 15 to 20 minutes. A bespoke bridal gele styling session takes 30 to 45 minutes, as we pay extreme attention to detail, symmetry, comfort, and veil positioning.'
  },
  {
    question: 'How do I register for your training courses?',
    answer: 'We offer Beginners, Upgrade, and Masterclass training courses. You can select the "Register for Training" button or book it directly from our booking flow. We will contact you immediately via WhatsApp with the start dates, physical studio location, and checklist of required learning materials.'
  },
  {
    question: 'Do you supply the gele fabrics, or do I bring my own?',
    answer: 'We can do both! Most clients bring their own traditional Aso-Ebi fabric. However, we also have premium pre-woven Aso-Oke fabrics, luxury Auto Geles, and head accessories available for sale in our Shop section which can be ordered directly.'
  },
  {
    question: 'Can I wash my Auto Gele?',
    answer: 'We recommend gentle spot cleaning only with a damp cloth and mild soap for stains. Do not machine wash or fully submerge your Auto Gele, as this will damage the internal structured interlining and lose the pristine pleated shapes.'
  }
];

export const BRAND_STORY = {
  paragraphs: [
    "Fabulous Gele Artistry was born out of a passion for creativity, elegance, and the desire to help people feel confident on their special occasions. Gele is more than a headpiece — it's a beautiful expression of culture, identity, and confidence. What began as a passion grew into a brand dedicated to excellence and professionalism.",
    "Every client has been an opportunity to refine skill, explore new styles, and master detail. The mission: preserve and celebrate the beauty of African culture through elegant, timeless gele styles, delivered with exceptional service — while also empowering aspiring gele artists through training and mentorship, helping them build profitable careers in the creative industry.",
    "The goal is for Fabulous Gele Artistry to be known for excellence, innovation, and lasting impact."
  ],
  stats: [
    { value: '500+', label: 'Brides Styled' },
    { value: '1,200+', label: 'Owambe Guests Glammed' },
    { value: '150+', label: 'Certified Graduates' },
    { value: '5+', label: 'Years of Artistry' }
  ],
  awards: [
    { 
      name: 'Oyo State Bridal Stylist of the Year (Nominee)', 
      authority: 'Oyo State Beauty Association', 
      year: '2025',
      desc: 'Recognized for styling over 500+ premium brides with unmatched elegance, precision, and comfortable fit.' 
    },
    { 
      name: 'West African Cultural Fashion Showcase', 
      authority: 'African Cultural Heritage Expo', 
      year: '2024',
      desc: 'Awarded for preserving and innovating traditional head-wrap techniques and showcasing authentic gele artistry.' 
    },
    { 
      name: 'Ibadan Youth Creative Excellence Award', 
      authority: 'State Youth Development Council', 
      year: '2024',
      desc: 'Honored for empowering the community by training over 150+ aspiring stylists through hands-on masterclasses.' 
    }
  ]
};
