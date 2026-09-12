export interface MarketItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  state: string;
  coverImage: string;
  photos: string[];
  shopCount: number;
  categories: string[];
  specialties: string[];
  historicalEra: string;
  popularTimings: string;
  location: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  featuredShops: Array<{
    id: string;
    name: string;
    category: string;
    rating: number;
    image: string;
  }>;
  popularOffers: Array<{
    title: string;
    discount: string;
    shopName: string;
  }>;
}

export const MARKETS_DATA: MarketItem[] = [
  {
    slug: 'karol-bagh',
    name: 'Karol Bagh Market',
    tagline: 'The Grand Emporium of Ethnic Couture & Handcrafted Jewellery',
    description:
      'Spanning across Ajmal Khan Road and Ghaffar Market, Karol Bagh is an illustrious shopping district renowned for multi-generational bridal couture, pure zari silks, diamond and gold merchants, and artisanal street namkeens.',
    city: 'New Delhi',
    state: 'Delhi',
    coverImage: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    ],
    shopCount: 180,
    categories: ['Fashion', 'Jewellery', 'Sweets', 'Electronics', 'Footwear'],
    specialties: ['Bridal Lehengas', 'Pure Gold Jewellery', 'Kundan Sets', 'Kulfi Faluda', 'Handcrafted Juttis'],
    historicalEra: 'Established 1947',
    popularTimings: '11:00 AM – 09:30 PM (Closed Mondays)',
    location: {
      lat: 28.6517,
      lng: 77.1906,
    },
    highlights: ['Ajmal Khan Road Couture', 'Ghaffar Tech Arcade', 'Bank Street Gold Quarter'],
    featuredShops: [
      {
        id: 'kb-sharma',
        name: 'Sharma Ethnic Studio',
        category: 'Fashion',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'kb-roshan',
        name: 'Roshan Di Kulfi',
        category: 'Sweets',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'kb-meena',
        name: 'Meena Bazaar Jewellers',
        category: 'Jewellery',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
      },
    ],
    popularOffers: [
      { title: 'Festive Wedding Season', discount: 'Flat 20% Off Couture', shopName: 'Sharma Ethnic Studio' },
      { title: 'Gold Making Charges', discount: '50% Waiver', shopName: 'Meena Bazaar Jewellers' },
    ],
  },
  {
    slug: 'chandni-chowk',
    name: 'Chandni Chowk Bazaar',
    tagline: '370 Years of Timeless Mughal Grandeur & Heirloom Flavors',
    description:
      'Designed in the 17th century by Mughal Princess Jahanara, Chandni Chowk remains India’s legendary epicenter for bridal weaves in Kinari Bazaar, century-old halwais in Dariba Kalan, and Asia’s largest spice market in Khari Baoli.',
    city: 'Old Delhi',
    state: 'Delhi',
    coverImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop',
    ],
    shopCount: 320,
    categories: ['Sweets', 'Spices', 'Jewellery', 'Textiles', 'Heritage Food'],
    specialties: ['Pure Ghee Jalebi', 'Dariba Silverware', 'Khari Baoli Saffron', 'Bespoke Zari Sarees'],
    historicalEra: 'Founded 1650 AD (Mughal Era)',
    popularTimings: '10:00 AM – 08:30 PM (Closed Sundays)',
    location: {
      lat: 28.6506,
      lng: 77.2303,
    },
    highlights: ['Dariba Kalan Silver Lane', 'Khari Baoli Spice Hub', 'Kinari Bazaar Zari & Trimmings'],
    featuredShops: [
      {
        id: 'hira',
        name: 'Hira Sweets & Sons',
        category: 'Sweets',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'cc-kanhaiya',
        name: 'Kanhaiyalal & Sons Silver',
        category: 'Jewellery',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'cc-chhabra',
        name: 'Chhabra 55 Heritage Silk',
        category: 'Textiles',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      },
    ],
    popularOffers: [
      { title: 'Kesar Peda Box Special', discount: '15% Off 1kg Box', shopName: 'Hira Sweets & Sons' },
      { title: 'Handloom Silk Clearance', discount: 'Up to 30% Off', shopName: 'Chhabra 55 Heritage Silk' },
    ],
  },
  {
    slug: 'dilli-haat-ina',
    name: 'Dilli Haat INA',
    tagline: 'Open-Air Cultural Village & National Mastercraft Bazaar',
    description:
      'A curated national craft village showcasing certified tribal and state artisans, terracotta pottery, handloom pashminas, Madhubani folk paintings, and regional culinary stalls from 28 Indian states.',
    city: 'New Delhi',
    state: 'Delhi',
    coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    ],
    shopCount: 95,
    categories: ['Handicrafts', 'Handlooms', 'Regional Food', 'Terracotta', 'Leather'],
    specialties: ['Kashmiri Pashmina', 'Kutch Embroidery', 'Blue Pottery', 'Kolhapuri Leatherwork'],
    historicalEra: 'Established 1994',
    popularTimings: '10:30 AM – 10:00 PM (Open 7 Days)',
    location: {
      lat: 28.5732,
      lng: 77.2075,
    },
    highlights: ['Artisan Rotation Plaza', 'Regional Food Pavilions', 'Live Weaving Demos'],
    featuredShops: [
      {
        id: 'dh-kashmir',
        name: 'Chinar Crafts Guild',
        category: 'Handicrafts',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'dh-rajasthan',
        name: 'Jaipur Blue Pottery Collective',
        category: 'Handicrafts',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop',
      },
    ],
    popularOffers: [
      { title: 'Artisan Week Special', discount: 'Direct Artisan Rate + 10% Reserve Bonus', shopName: 'Chinar Crafts Guild' },
    ],
  },
  {
    slug: 'khan-market',
    name: 'Khan Market',
    tagline: 'High-End Luxury Boutiques, Heritage Cafes & Lifestyle Stores',
    description:
      'Consistently ranked among the world’s most upscale retail streets, Khan Market blends independent bespoke tailors, luxury Ayurvedic apothecaries, iconic bookshops, and artisanal dining.',
    city: 'New Delhi',
    state: 'Delhi',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop',
    ],
    shopCount: 75,
    categories: ['Luxury Fashion', 'Ayurveda', 'Cafes', 'Fine Books', 'Home Decor'],
    specialties: ['Bespoke Linen Suits', 'Organic Pure Oils', 'Artisanal Roasts', 'First Edition Books'],
    historicalEra: 'Established 1951',
    popularTimings: '10:00 AM – 11:00 PM (Open 7 Days)',
    location: {
      lat: 28.5997,
      lng: 77.2273,
    },
    highlights: ['Middle Lane Boutiques', 'Rooftop Cafes', 'Heritage Apothecary Rows'],
    featuredShops: [
      {
        id: 'km-faquir',
        name: 'Faqir Chand & Sons Books',
        category: 'Books & Curios',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
      },
    ],
    popularOffers: [
      { title: 'Weekend Coffee Blend & Pastry', discount: 'Complimentary Tasting', shopName: 'Faqir Chand' },
    ],
  },
  {
    slug: 'lajpat-nagar',
    name: 'Lajpat Nagar Central Market',
    tagline: 'The Ultimate Ethnic Apparel, Bridal Fabrics & Footwear Hub',
    description:
      'A bustling cultural marketplace famed for matching centers, borders and tassels, ready-to-wear kurtis, Rajasthani mehendi artists, and authentic street chaat.',
    city: 'South Delhi',
    state: 'Delhi',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    ],
    shopCount: 210,
    categories: ['Fashion', 'Fabrics', 'Footwear', 'Street Food', 'Accessories'],
    specialties: ['Chanderi Silk', 'Lucknowi Chikankari', 'Handmade Mojaris', 'Mehendi Cones'],
    historicalEra: 'Established 1950',
    popularTimings: '11:00 AM – 09:00 PM (Closed Mondays)',
    location: {
      lat: 28.5677,
      lng: 77.2433,
    },
    highlights: ['Chikankari Fabric Arcade', 'Mehendi Artists Lane', 'Shoe Bazaar'],
    featuredShops: [
      {
        id: 'ln-lucknow',
        name: 'Avadh Chikankari Emporium',
        category: 'Fashion',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      },
    ],
    popularOffers: [
      { title: 'Festive Kurta Combo', discount: 'Buy 2 Get 15% Off', shopName: 'Avadh Chikankari' },
    ],
  },
];
