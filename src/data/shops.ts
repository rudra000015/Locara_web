import type { Hours, LegacyBadge, Product, Review, Shop } from '@/types/shop';

export type { Hours, LegacyBadge, Product, Review, Shop } from '@/types/shop';

export function getLegacyBadge(age: number): LegacyBadge {
  if (age >= 100) return 'centennial';
  if (age >= 50) return 'heritage';
  if (age >= 25) return 'established';
  return 'rising';
}

export const BADGE_CONFIG: Record<
  LegacyBadge,
  { label: string; emoji: string; bg: string; text: string; border: string }
> = {
  centennial: { label: 'Centennial Legacy', emoji: '100y', bg: '#FDF8F5', text: '#A85420', border: '#E5E5E5' },
  heritage: { label: 'Heritage Shop', emoji: 'H', bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  established: { label: 'Established', emoji: 'E', bg: '#EBF8F0', text: '#16803C', border: '#A7F3D0' },
  rising: { label: 'Popular Gem', emoji: '★', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
};

const SWEET_IMGS = [
  'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=900&q=80',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&q=80',
];
const GROCERY_IMGS = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
];
const PHARMACY_IMGS = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=80',
];

export function shopImages(cat?: string): string[] {
  if (cat === 'sweets' || cat === 'food') return SWEET_IMGS;
  if (cat === 'grocery') return GROCERY_IMGS;
  if (cat === 'pharmacy') return PHARMACY_IMGS;
  return [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80',
  ];
}

export const DEFAULT_HOURS: Record<string, Hours> = {
  mon: { open: '09:00', close: '21:00', closed: false },
  tue: { open: '09:00', close: '21:00', closed: false },
  wed: { open: '09:00', close: '21:00', closed: false },
  thu: { open: '09:00', close: '21:00', closed: false },
  fri: { open: '09:00', close: '21:00', closed: false },
  sat: { open: '09:00', close: '21:30', closed: false },
  sun: { open: '10:00', close: '20:00', closed: false },
};

export function isOpenNow(hours?: Record<string, Hours>): boolean {
  if (!hours) return true;
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const today = days[new Date().getDay()];
  const h = hours[today];
  if (!h || h.closed) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = (h.open || '09:00').split(':').map(Number);
  const [ch, cm] = (h.close || '21:00').split(':').map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

export function todayHours(hours?: Record<string, Hours>): string {
  if (!hours) return '09:00 AM - 09:00 PM';
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const today = days[new Date().getDay()];
  const h = hours[today];
  if (!h || h.closed) return 'Closed today';
  return `${h.open} - ${h.close}`;
}

export function gmapsUrl(loc: [number, number], name: string): string {
  const dest = `${loc[0]},${loc[1]}`;
  const label = encodeURIComponent(name);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=${label}&travelmode=driving`;
}

export function whatsappUrl(phone: string, shopName: string): string {
  const msg = encodeURIComponent(
    `Hi! I found ${shopName} on Locara. I'd like to enquire about your products and pickup reservation.`
  );
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`;
}

function makeShop(base: Omit<Shop, 'badge' | 'hours' | 'reviews' | 'totalRatings'>): Shop {
  return {
    ...base,
    totalRatings: 120,
    badge: getLegacyBadge(base.age),
    hours: DEFAULT_HOURS,
    reviews: [
      { author: 'Rahul Sharma', rating: 5, text: 'Authentic quality, smooth pickup experience!', date: '2 days ago' },
      { author: 'Priya Verma', rating: 5, text: 'Loved the craftsmanship and great customer service.', date: '1 week ago' },
      { author: 'Amit Kumar', rating: 4, text: 'Great traditional collection at fair prices.', date: '2 weeks ago' },
    ],
  };
}

export const SHOPS: Shop[] = [
  makeShop({
    id: 'sharma-handicrafts',
    placeId: 'sharma-handicrafts',
    name: 'Sharma Handicrafts',
    est: 1974,
    age: 52,
    cat: 'handicrafts',
    subcategory: 'Home Decor & Brassware',
    owner: 'Ramesh Sharma (2nd Gen)',
    ownerImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    whatsapp: '+919837012345',
    phone: '+91 98370 12345',
    story:
      'Traditional handicrafts items crafted by local artisans. From home decor to traditional gifts, we bring you authentic handmade products with modern touch.',
    addr: '42 Sadar Bazaar, Cantt Road, Meerut',
    loc: [28.9845, 77.7064],
    rating: 4.6,
    distanceMeters: 1200,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&q=80',
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=900&q=80',
    ],
    products: [
      {
        id: 'prod_lamp_1',
        name: 'Decorative Lamp',
        price: 1200,
        unit: 'piece',
        inStock: true,
        isNew: true,
        discountPct: 20,
        description: 'Beautiful handmade decorative lamp for home decor. Adds a traditional touch to your space with ambient warm lighting.',
        category: 'Handicrafts',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      },
      {
        id: 'prod_wall_decor',
        name: 'Wooden Wall Decor',
        price: 1499,
        unit: 'piece',
        inStock: true,
        isNew: false,
        discountPct: 15,
        description: 'Intricately carved floral wooden wall art panel. Crafted from seasoned sheesham wood by master artisans.',
        category: 'Handicrafts',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      },
      {
        id: 'prod_brass_statue',
        name: 'Brass Statue',
        price: 2999,
        unit: 'piece',
        inStock: true,
        isNew: true,
        discountPct: 10,
        description: 'Solid brass idol with antique finish and fine hand-etched details.',
        category: 'Handicrafts',
        image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80',
      },
      {
        id: 'prod_vase_1',
        name: 'Handmade Vase',
        price: 899,
        unit: 'piece',
        inStock: true,
        isNew: false,
        discountPct: 25,
        description: 'Terracotta and ceramic glazed flower vase with folk art engravings.',
        category: 'Handicrafts',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
      },
    ],
  }),
  makeShop({
    id: 'style-hub',
    placeId: 'style-hub',
    name: 'Style Hub',
    est: 1998,
    age: 28,
    cat: 'fashion',
    subcategory: 'Ethnic & Modern Apparel',
    owner: 'Vikram Chawla',
    ownerImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    whatsapp: '+919837098765',
    phone: '+91 98370 98765',
    story:
      'Contemporary ethnic wear and handloom clothing. Renowned for pure cotton kurtas, linen shirts, and custom tailoring.',
    addr: '18 Abu Lane, Central Market, Meerut',
    loc: [28.9812, 77.7021],
    rating: 4.4,
    distanceMeters: 2100,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&q=80',
    ],
    products: [
      {
        id: 'prod_cotton_kurta',
        name: 'Cotton Kurta',
        price: 899,
        unit: 'piece',
        inStock: true,
        isNew: true,
        discountPct: 20,
        description: 'Breathable pure handspun cotton kurta with Mandarin collar and mother-of-pearl buttons.',
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      },
      {
        id: 'prod_linen_shirt',
        name: 'Linen Shirt',
        price: 1499,
        unit: 'piece',
        inStock: true,
        isNew: false,
        discountPct: 10,
        description: 'Classic relaxed-fit pure linen shirt in natural earthy tones.',
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
      },
      {
        id: 'prod_dupatta',
        name: 'Embroidered Dupatta',
        price: 650,
        unit: 'piece',
        inStock: true,
        isNew: true,
        discountPct: 15,
        description: 'Chanderi silk dupatta with delicate golden zari border and floral threadwork.',
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      },
    ],
  }),
  makeShop({
    id: 'royal-jewellery',
    placeId: 'royal-jewellery',
    name: 'Royal Jewellery',
    est: 1950,
    age: 76,
    cat: 'jewellery',
    subcategory: 'Traditional Gold & Silver',
    owner: 'Sunil Rastogi',
    ownerImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
    whatsapp: '+919837055443',
    phone: '+91 98370 55443',
    story:
      'Over 75 years of trust in handcrafted jewellery, bridal ornaments, and hallmarked pure silver gifts.',
    addr: 'Sarafa Bazaar, Near Ghanta Ghar, Meerut',
    loc: [28.988, 77.708],
    rating: 4.7,
    distanceMeters: 1800,
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
    ],
    products: [
      {
        id: 'prod_kundan_necklace',
        name: 'Kundan Choker Necklace',
        price: 4500,
        unit: 'set',
        inStock: true,
        isNew: true,
        discountPct: 15,
        description: 'Heritage kundan choker with emerald beads and matching jhumka earrings.',
        category: 'Jewellery',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      },
      {
        id: 'prod_silver_jhumkas',
        name: 'Silver Jhumkas',
        price: 1250,
        unit: 'pair',
        inStock: true,
        isNew: false,
        discountPct: 20,
        description: '92.5 hallmarked sterling silver antique jhumkas with filigree floral design.',
        category: 'Jewellery',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      },
    ],
  }),
  makeShop({
    id: 'taste-of-india',
    placeId: 'taste-of-india',
    name: 'Taste of India',
    est: 1982,
    age: 44,
    cat: 'food',
    subcategory: 'Traditional Sweets & Snacks',
    owner: 'Mahesh Gupta',
    ownerImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    whatsapp: '+919837077889',
    phone: '+91 98370 77889',
    story:
      'Famous for pure desi ghee sweets, fresh morning kachoris, and authentic seasonal delicacies in Meerut.',
    addr: '12 Begum Bridge Road, Saket, Meerut',
    loc: [28.982, 77.697],
    rating: 4.5,
    distanceMeters: 2400,
    images: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&q=80',
      'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=900&q=80',
    ],
    products: [
      {
        id: 'prod_motichoor',
        name: 'Desi Ghee Motichoor Laddu',
        price: 420,
        unit: 'kg',
        inStock: true,
        isNew: true,
        discountPct: 10,
        description: 'Soft melt-in-mouth laddu made with pure cow ghee and fragrant green cardamom.',
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800&q=80',
      },
      {
        id: 'prod_rasmalai',
        name: 'Saffron Rasmalai (Pack of 4)',
        price: 160,
        unit: 'pack',
        inStock: true,
        isNew: true,
        discountPct: 0,
        description: 'Fresh paneer discs soaked in chilled thickened saffron milk with crushed pistachios.',
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
      },
    ],
  }),
  makeShop({
    id: 'hira',
    placeId: 'hira',
    name: 'Hira Sweets',
    est: 1912,
    age: 114,
    cat: 'sweets',
    subcategory: 'Heritage Confectionery',
    owner: 'Hira Family (4th Gen)',
    ownerImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hira',
    whatsapp: '+919837000001',
    phone: '+91 98370 00001',
    story:
      'Serving Meerut since 1912 for four generations. Over 100 varieties of sweets and savouries made with timeless traditional recipes.',
    addr: 'Main Road, Opp Manoranjan Park, Saket, Meerut',
    loc: [28.9845, 77.7064],
    rating: 4.8,
    distanceMeters: 1500,
    images: [
      'https://images.unsplash.com/photo-1666448079979-6fdc715b8b28?w=900&q=80',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&q=80',
    ],
    products: [
      { id: 'hs1', name: 'Desi Ghee Jalebi', price: 180, unit: 'kg', inStock: true, isNew: true, category: 'Food', image: 'https://images.unsplash.com/photo-1666448079979-6fdc715b8b28?w=800&q=80' },
      { id: 'hs2', name: 'Kaju Katli Premium', price: 800, unit: 'kg', inStock: true, isNew: true, discountPct: 10, category: 'Food', image: 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800&q=80' },
    ],
  }),
  makeShop({
    id: 'dubai',
    placeId: 'dubai',
    name: 'Dubai Stores',
    est: 1980,
    age: 46,
    cat: 'grocery',
    subcategory: 'Gourmet & Daily Essentials',
    owner: 'Dubai Family',
    ownerImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dubai',
    whatsapp: '+919837000004',
    phone: '+91 98370 00004',
    story: "Chapel Street's trusted grocery destination. Quality products and honest pricing for 45+ years.",
    addr: '284 Chapel St, Meerut Cantt, Sadar Bazaar',
    loc: [28.983, 77.705],
    rating: 4.2,
    distanceMeters: 900,
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
      'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=900&q=80',
    ],
    products: [
      { id: 'ds1', name: 'Aashirvaad Shudh Chakki Atta 5kg', price: 215, unit: 'pack', inStock: true, isNew: false, category: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' },
    ],
  }),
];
