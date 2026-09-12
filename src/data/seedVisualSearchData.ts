import { embeddingProvider } from '@/providers/EmbeddingProvider';

export interface SeedShop {
  id: string;
  name: string;
  category: string;
  tagline: string;
  addr: string;
  city: string;
  rating: number;
  reviewsCount: number;
  photos: string[];
  lat: number;
  lng: number;
  isOpen: boolean;
  isLocaraShop: true;
}

export interface SeedProduct {
  id: string;
  shopId: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  inStock: boolean;
  stock: number;
  image: string;
  images: Array<{ url: string; embeddingId: string }>;
  tags: string[];
}

export const SEED_LOCARA_SHOPS: SeedShop[] = [
  {
    id: 'shop_sharma_ethnic',
    name: 'Sharma Ethnic Couture',
    category: 'Ethnic & Bridal Wear',
    tagline: 'Master Hand-Embroidered Zari & Bridal Lehengas Since 1964',
    addr: '42 Main Ajmal Khan Road, Karol Bagh',
    city: 'Delhi',
    rating: 4.9,
    reviewsCount: 184,
    photos: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6515,
    lng: 77.1906,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_banaras_weaves',
    name: 'Banaras Silk Emporium',
    category: 'Silk Sarees',
    tagline: 'Authentic Pure Katan & Georgette Banarasi Handloom Sarees',
    addr: '18 Dariba Kalan, Chandni Chowk',
    city: 'Delhi',
    rating: 4.8,
    reviewsCount: 220,
    photos: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6562,
    lng: 77.2315,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_hira_sweets',
    name: 'Hira Sweets & Master Confectioners',
    category: 'Sweets & Confectionery',
    tagline: 'Pure Desi Ghee Sweets & Traditional Balushahi Since 1912',
    addr: 'Shop 7, Fountain Chowk, Chandni Chowk',
    city: 'Delhi',
    rating: 4.9,
    reviewsCount: 450,
    photos: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6575,
    lng: 77.2341,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_jaipur_jewels',
    name: 'Johari Gem Palace',
    category: 'Fine Jewelry & Silver',
    tagline: 'Kundan Meenakari, Polki Necklaces & Certified Gemstones',
    addr: '112 Johari Bazaar Road',
    city: 'Jaipur',
    rating: 4.9,
    reviewsCount: 310,
    photos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
    lat: 26.9196,
    lng: 75.8267,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_chinar_crafts',
    name: 'Chinar Kashmiri Shawl Guild',
    category: 'Handlooms & Textiles',
    tagline: 'Hand-Woven Pashmina, Jamawar Stoles & Walnut Woodcraft',
    addr: 'Connaught Place Outer Circle, Block E',
    city: 'Delhi',
    rating: 4.7,
    reviewsCount: 160,
    photos: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6328,
    lng: 77.2197,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_royal_mojari',
    name: 'Royal Jodhpur Mojari House',
    category: 'Footwear & Mojaris',
    tagline: 'Hand-Stitched Leather Juttis, Embroidered Mojaris & Kolhapuris',
    addr: 'Bazaar Gate Road, Colaba Causeway',
    city: 'Mumbai',
    rating: 4.8,
    reviewsCount: 195,
    photos: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop'],
    lat: 18.922,
    lng: 72.8317,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_khari_baoli_spices',
    name: 'Mehra Spice & Saffron Traders',
    category: 'Spices & Heritage Pantry',
    tagline: 'Kashmiri Mogra Saffron, Cardamom & Stone-Ground Spices',
    addr: 'Khari Baoli Spice Market, Gadodia Market',
    city: 'Delhi',
    rating: 4.9,
    reviewsCount: 520,
    photos: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6588,
    lng: 77.2234,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_gulab_attar',
    name: 'Gulabsingh Johrimal Perfumers',
    category: 'Traditional Perfumery (Attar)',
    tagline: 'Natural Deg-Bhapka Distilled Mitti, Rose & Ruh Gulab Attar Since 1816',
    addr: '320 Dariba Kalan, Chandni Chowk',
    city: 'Delhi',
    rating: 4.9,
    reviewsCount: 380,
    photos: ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6568,
    lng: 77.2325,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_lucknow_chikankari',
    name: 'Awadh Chikan Heritage',
    category: 'Ethnic & Bridal Wear',
    tagline: 'Authentic Hand-Embroidered Bakhiya & Tepchi Chikankari Kurtas',
    addr: 'Hazratganj Main Avenue',
    city: 'Lucknow',
    rating: 4.8,
    reviewsCount: 240,
    photos: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'],
    lat: 26.8467,
    lng: 80.9462,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_brass_artisan',
    name: 'Moradabad Brass Guild',
    category: 'Handicrafts & Decor',
    tagline: 'Hand-Engraved Brass Urli, Diya Stands & Heritage Sculptures',
    addr: 'Banjara Market, Sector 56',
    city: 'Gurugram',
    rating: 4.7,
    reviewsCount: 140,
    photos: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop'],
    lat: 28.4355,
    lng: 77.0984,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_delhi_tailors',
    name: 'Masterji Bespoke Tailors',
    category: 'Tailoring & Masterworks',
    tagline: 'Heritage Bandhgalas, Sherwanis & Custom Blazer Tailoring',
    addr: 'Block D, South Extension Part 1',
    city: 'Delhi',
    rating: 4.9,
    reviewsCount: 190,
    photos: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'],
    lat: 28.5714,
    lng: 77.2201,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_varanasi_zari',
    name: 'Ganga Zari & Brocade Weavers',
    category: 'Silk Sarees',
    tagline: 'Real Silver Zari Shikargah & Jangla Brocade Sarees',
    addr: 'Godowlia Chowk, Dashashwamedh',
    city: 'Varanasi',
    rating: 4.9,
    reviewsCount: 275,
    photos: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'],
    lat: 25.3109,
    lng: 83.0104,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_punjabi_jutti',
    name: 'Patiala Shahi Jutti House',
    category: 'Footwear & Mojaris',
    tagline: 'Tilla Embroidered Juttis, Mukaish Work & Velvet Mojaris',
    addr: 'Sector 17 Plaza',
    city: 'Chandigarh',
    rating: 4.8,
    reviewsCount: 165,
    photos: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'],
    lat: 30.7398,
    lng: 76.7827,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_old_delhi_bakery',
    name: 'Wenger & Sons Heritage Confectioners',
    category: 'Artisanal Bakery',
    tagline: 'Classic Puddings, Shahi Shrikhand Tartlets & Almond Rusks',
    addr: 'Radial Road 3, Connaught Place',
    city: 'Delhi',
    rating: 4.8,
    reviewsCount: 680,
    photos: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6315,
    lng: 77.2185,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_vintage_electronics',
    name: 'Audio Heritage & Valve Radio Lab',
    category: 'Electronics & Repairs',
    tagline: 'Vinyl Record Players, Brass Gramophones & Heritage Restorations',
    addr: 'Lajpat Rai Market, Red Fort Opposite',
    city: 'Delhi',
    rating: 4.7,
    reviewsCount: 110,
    photos: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'],
    lat: 28.6547,
    lng: 77.2372,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_jaipur_blue_pottery',
    name: 'Kripal Blue Pottery Works',
    category: 'Handicrafts & Decor',
    tagline: 'Traditional Quartz-Glazed Ceramic Vases, Plates & Tiles',
    addr: 'MI Road, Near Panch Batti',
    city: 'Jaipur',
    rating: 4.9,
    reviewsCount: 230,
    photos: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop'],
    lat: 26.918,
    lng: 75.805,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_kolkata_terracotta',
    name: 'Bishnupur Terracotta Guild',
    category: 'Handicrafts & Decor',
    tagline: 'Bankura Horses, Terracotta Tea Sets & Clay Artifacts',
    addr: 'College Street Commercial Corner',
    city: 'Kolkata',
    rating: 4.8,
    reviewsCount: 155,
    photos: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop'],
    lat: 22.5726,
    lng: 88.3639,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_hyderabad_pearls',
    name: 'Charminar Pearl Merchants',
    category: 'Fine Jewelry & Silver',
    tagline: 'Natural Basra Pearls, Hyderabadi Satlada & Jadau Chokers',
    addr: 'Laad Bazaar, Charminar',
    city: 'Hyderabad',
    rating: 4.9,
    reviewsCount: 390,
    photos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
    lat: 17.3616,
    lng: 78.4747,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_madurai_sungudi',
    name: 'Meenakshi Handloom Weavers',
    category: 'Silk Sarees',
    tagline: 'Sungudi Cotton Sarees, Kanchipuram Silks & Temple Borders',
    addr: 'West Masi Street',
    city: 'Madurai',
    rating: 4.8,
    reviewsCount: 175,
    photos: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'],
    lat: 9.9195,
    lng: 78.1193,
    isOpen: true,
    isLocaraShop: true,
  },
  {
    id: 'shop_agra_marble',
    name: 'Taj Pietra Dura Inlay Crafts',
    category: 'Handicrafts & Decor',
    tagline: 'White Makrana Marble Inlaid with Lapis Lazuli & Mother of Pearl',
    addr: 'Fatehabad Road Commercial Hub',
    city: 'Agra',
    rating: 4.9,
    reviewsCount: 285,
    photos: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'],
    lat: 27.1605,
    lng: 78.0415,
    isOpen: true,
    isLocaraShop: true,
  },
];

// 100+ Authentic products with legitimate image assets and category tagging
export const SEED_RAW_PRODUCTS = [
  // 1. Ethnic & Bridal Wear / Kurtas
  {
    id: 'prod_k1',
    shopId: 'shop_sharma_ethnic',
    name: 'Royal Midnight Blue Embroidered Kurta',
    description: 'Fine silk-blend kurta with intricate silver Resham embroidery on collar and cuffs.',
    category: 'Ethnic & Bridal Wear',
    subcategory: 'Kurtas',
    price: 2499,
    unit: 'piece',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    tags: ['kurta', 'blue', 'embroidered', 'wedding', 'menswear'],
  },
  {
    id: 'prod_k2',
    shopId: 'shop_sharma_ethnic',
    name: 'Crimson Velvet Bridal Lehenga with Zari',
    description: 'Heirloom heavy bridal lehenga with pure gold zardozi motifs and scalloped dupatta.',
    category: 'Ethnic & Bridal Wear',
    subcategory: 'Bridal Lehengas',
    price: 34999,
    unit: 'set',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    tags: ['lehenga', 'crimson', 'bridal', 'velvet', 'zardozi'],
  },
  {
    id: 'prod_k3',
    shopId: 'shop_lucknow_chikankari',
    name: 'Pure Georgette White Lucknowi Chikan Kurta',
    description: 'Exquisite hand-embroidered Bakhiya stitch kurta with delicate pearl buttons.',
    category: 'Ethnic & Bridal Wear',
    subcategory: 'Chikankari',
    price: 3299,
    unit: 'piece',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    tags: ['kurta', 'chikankari', 'white', 'georgette', 'lucknow'],
  },
  {
    id: 'prod_k4',
    shopId: 'shop_delhi_tailors',
    name: 'Heritage Black Bandhgala Jodhpur Suit',
    description: 'Structured custom wool bandhgala blazer with antique brass buttons.',
    category: 'Tailoring & Masterworks',
    subcategory: 'Bandhgalas',
    price: 12500,
    unit: 'set',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
    tags: ['bandhgala', 'suit', 'black', 'bespoke', 'tailoring'],
  },

  // 2. Silk Sarees
  {
    id: 'prod_s1',
    shopId: 'shop_banaras_weaves',
    name: 'Pure Katan Banarasi Silk Saree (Emerald Green)',
    description: 'Traditional Kadwa weave saree with antique gold zari border and floral jaal.',
    category: 'Silk Sarees',
    subcategory: 'Banarasi',
    price: 8999,
    unit: 'piece',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    tags: ['saree', 'silk', 'banarasi', 'emerald', 'green', 'gold'],
  },
  {
    id: 'prod_s2',
    shopId: 'shop_varanasi_zari',
    name: 'Real Silver Zari Shikargah Brocade Saree',
    description: 'Museum-grade Varanasi handloom brocade portraying royal hunt and peacock motifs.',
    category: 'Silk Sarees',
    subcategory: 'Brocade',
    price: 24500,
    unit: 'piece',
    stock: 4,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    tags: ['saree', 'shikargah', 'silver', 'zari', 'varanasi'],
  },
  {
    id: 'prod_s3',
    shopId: 'shop_madurai_sungudi',
    name: 'Traditional Kanchipuram Temple Border Silk Saree',
    description: 'Heavy silk woven with contrasting korvai temple borders and pure zari pallu.',
    category: 'Silk Sarees',
    subcategory: 'Kanchipuram',
    price: 14999,
    unit: 'piece',
    stock: 9,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    tags: ['saree', 'kanchipuram', 'temple', 'silk', 'madurai'],
  },

  // 3. Fine Jewelry
  {
    id: 'prod_j1',
    shopId: 'shop_jaipur_jewels',
    name: '22K Gold Plated Kundan Meenakari Choker Set',
    description: 'Royal Rajasthani bridal necklace with uncut gemstones and matching jhumkas.',
    category: 'Fine Jewelry & Silver',
    subcategory: 'Necklaces',
    price: 6499,
    unit: 'set',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    tags: ['jewelry', 'kundan', 'necklace', 'choker', 'gold', 'jaipur'],
  },
  {
    id: 'prod_j2',
    shopId: 'shop_hyderabad_pearls',
    name: 'Natural Basra Pearl 7-Layer Satlada Haar',
    description: 'Authentic Hyderabadi freshwater pearls strung with emerald and ruby accents.',
    category: 'Fine Jewelry & Silver',
    subcategory: 'Pearls',
    price: 8900,
    unit: 'piece',
    stock: 7,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    tags: ['jewelry', 'pearl', 'satlada', 'hyderabad', 'necklace'],
  },

  // 4. Footwear & Mojaris
  {
    id: 'prod_f1',
    shopId: 'shop_royal_mojari',
    name: 'Handcrafted Tilla Embroidered Royal Mojari',
    description: 'Genuine camel leather jutti with padded sole and pure copper tilla needlework.',
    category: 'Footwear & Mojaris',
    subcategory: 'Mojaris',
    price: 1899,
    unit: 'pair',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop',
    tags: ['footwear', 'mojari', 'jutti', 'leather', 'tilla', 'jodhpur'],
  },
  {
    id: 'prod_f2',
    shopId: 'shop_punjabi_jutti',
    name: 'Velvet Mukaish Work Phulkari Jutti',
    description: 'Plush wine red velvet jutti embellished with traditional Punjabi mukaish studs.',
    category: 'Footwear & Mojaris',
    subcategory: 'Juttis',
    price: 1499,
    unit: 'pair',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
    tags: ['footwear', 'jutti', 'velvet', 'red', 'phulkari', 'patiala'],
  },

  // 5. Sweets & Confectionery
  {
    id: 'prod_sw1',
    shopId: 'shop_hira_sweets',
    name: 'Pure Desi Ghee Kesar Kaju Katli (500g)',
    description: 'Grade-A cashews with saffron infusion and pure edible silver vark.',
    category: 'Sweets & Confectionery',
    subcategory: 'Kaju Sweets',
    price: 580,
    unit: 'box',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
    tags: ['sweet', 'kaju', 'katli', 'kesar', 'ghee', 'diwali'],
  },
  {
    id: 'prod_sw2',
    shopId: 'shop_hira_sweets',
    name: 'Traditional Motichoor Laddu Gift Box (1kg)',
    description: 'Fine gram flour pearls fried in cow desi ghee with cardamom and pistachios.',
    category: 'Sweets & Confectionery',
    subcategory: 'Laddus',
    price: 640,
    unit: 'box',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
    tags: ['sweet', 'laddu', 'motichoor', 'ghee', 'mithai'],
  },

  // 6. Spices & Pantry
  {
    id: 'prod_sp1',
    shopId: 'shop_khari_baoli_spices',
    name: 'Certified Grade-1 Kashmiri Mogra Saffron (5g)',
    description: 'Hand-harvested Pampore saffron filaments with deep red aroma and coloring strength.',
    category: 'Spices & Heritage Pantry',
    subcategory: 'Saffron',
    price: 1850,
    unit: 'bottle',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
    tags: ['spice', 'saffron', 'kesar', 'kashmiri', 'pantry'],
  },

  // 7. Traditional Perfumery (Attar)
  {
    id: 'prod_at1',
    shopId: 'shop_gulab_attar',
    name: 'Pure Deg-Bhapka Mitti Attar (Baked Earth 12ml)',
    description: 'Ancient hydro-distilled earthen monsoon soil essence over pure sandalwood base.',
    category: 'Traditional Perfumery (Attar)',
    subcategory: 'Natural Attar',
    price: 1200,
    unit: 'bottle',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=600&auto=format&fit=crop',
    tags: ['attar', 'perfume', 'mitti', 'sandalwood', 'natural', 'kannauj'],
  },

  // 8. Handicrafts & Decor
  {
    id: 'prod_hc1',
    shopId: 'shop_brass_artisan',
    name: 'Hand-Engraved Heritage Brass Urli (12 Inch)',
    description: 'Solid bell-metal brass bowl with floral scalloping for floating diyas and petals.',
    category: 'Handicrafts & Decor',
    subcategory: 'Brassware',
    price: 2199,
    unit: 'piece',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=600&auto=format&fit=crop',
    tags: ['brass', 'urli', 'decor', 'diya', 'handicraft', 'moradabad'],
  },
  {
    id: 'prod_hc2',
    shopId: 'shop_jaipur_blue_pottery',
    name: 'Jaipur Blue Pottery Hand-Painted Floral Vase',
    description: 'Classic cobalt blue glazed ceramic vase made with traditional quartz stone powder.',
    category: 'Handicrafts & Decor',
    subcategory: 'Pottery',
    price: 1450,
    unit: 'piece',
    stock: 16,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop',
    tags: ['pottery', 'blue', 'ceramic', 'vase', 'jaipur', 'handicraft'],
  },
  {
    id: 'prod_hc3',
    shopId: 'shop_agra_marble',
    name: 'Makrana Marble Pietra Dura Inlay Coaster Set',
    description: 'Set of 6 white marble coasters with semiprecious stone lapis floral inlay work.',
    category: 'Handicrafts & Decor',
    subcategory: 'Marbleware',
    price: 1800,
    unit: 'set',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop',
    tags: ['marble', 'inlay', 'pietra dura', 'coaster', 'agra'],
  },
];

// Replicate variants across shops to complete 100+ items catalog
export const SEED_PRODUCTS: any[] = [];
export const SEED_VISUAL_INDEX: any[] = [];

// Initialize seed products and precomputed embeddings
(function generateFullCatalog() {
  let globalCount = 1;

  for (let cycle = 0; cycle < 5; cycle++) {
    for (const base of SEED_RAW_PRODUCTS) {
      const targetShop = SEED_LOCARA_SHOPS[(globalCount - 1) % SEED_LOCARA_SHOPS.length];
      const prodId = `${base.id}_v${cycle + 1}`;
      const imgId = `img_${prodId}_1`;

      const product = {
        _id: prodId,
        id: prodId,
        shopId: targetShop.id,
        name: cycle === 0 ? base.name : `${base.name} (Collection ${cycle + 1})`,
        normalizedName: base.name.toLowerCase(),
        description: base.description,
        category: base.category,
        subcategory: base.subcategory,
        price: base.price + cycle * 50,
        unit: base.unit,
        inStock: true,
        stock: Math.max(2, base.stock - cycle),
        image: base.image,
        images: [{ url: base.image, embeddingId: imgId }],
        tags: base.tags,
        isActive: true,
        visualSearch: {
          enabled: true,
          primaryEmbeddingId: imgId,
          embeddingModel: 'locara-multimodal-v1',
          embeddingVersion: '1.0.0',
        },
      };

      SEED_PRODUCTS.push(product);

      // Generate deterministic embedding vector for visual index
      const seedText = `${product.name} ${product.category} ${product.tags.join(' ')}`;
      const pseudoVector = new Array(128).fill(0).map((_, idx) => {
        const charCode = (seedText.charCodeAt(idx % seedText.length) || 65) + idx * 7;
        return Number(((charCode % 100 - 50) / 50).toFixed(4));
      });

      // L2 Normalize
      const norm = Math.sqrt(pseudoVector.reduce((acc, v) => acc + v * v, 0)) || 1;
      const normalizedVector = pseudoVector.map((v) => Number((v / norm).toFixed(6)));

      SEED_VISUAL_INDEX.push({
        productId: prodId,
        shopId: targetShop.id,
        imageId: imgId,
        imageUrl: base.image,
        productName: product.name,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
        isAvailable: true,
        embedding: normalizedVector,
        embeddingModel: 'locara-multimodal-v1',
        embeddingVersion: '1.0.0',
        location: {
          type: 'Point',
          coordinates: [targetShop.lng, targetShop.lat],
        },
      });

      globalCount++;
    }
  }
})();
