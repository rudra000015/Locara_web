import { create } from 'zustand';
import { Product } from '@/types/shop';
import { SHOPS } from '@/data/shops';
import { haptic } from '@/utils/haptic';

export type ThemeMode = 'light' | 'dark';
export type LanguageMode = 'en' | 'hi';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  unit: string;
  size?: string;
  color?: string;
  quantity: number;
  shopId: string;
  shopName: string;
  shopAddress?: string;
  image?: string;
}

export interface WishItem {
  shopId: string;
  prodId: string;
  name: string;
  price: number;
  unit: string;
  shopName: string;
  image?: string;
}

export interface SavedCollection {
  id: string;
  title: string;
  shopName: string;
  coverImage: string;
  tag: string;
}

export interface SavedMarket {
  slug: string;
  name: string;
  city: string;
  coverImage: string;
  shopCount: number;
}

export interface ReservationPass {
  id: string;
  otp: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  advancePaid: number;
  balanceDue: number;
  shopId: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopLocation?: [number, number];
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'VISITED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
}

interface ToastState {
  message: string;
  visible: boolean;
}

export type OwnerPage = 'showcase' | 'products' | 'collections' | 'addproduct' | 'profile' | 'analytics' | 'reservations' | 'offers';

export interface OwnerShopProfile {
  tagline: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  specialties: string[];
  coverImage?: string;
  profileImage?: string;
  lat?: number;
  lng?: number;
}

interface AppStore {
  // Auth
  user: { id?: string; name: string; email?: string; phone?: string; img: string; role?: 'explorer' | 'owner'; storeName?: string } | null;
  role: 'explorer' | 'owner';
  setUser: (
    user: { id?: string; name: string; email?: string; phone?: string; img: string; role?: 'explorer' | 'owner'; storeName?: string } | null,
    role?: 'explorer' | 'owner'
  ) => void;
  setMode: (mode: 'explorer' | 'owner') => void;
  logout: () => void;

  // Language & Theme
  language: LanguageMode;
  setLanguage: (l: LanguageMode) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;

  // Location State
  userLocation: {
    latitude: number | null;
    longitude: number | null;
    permission: 'granted' | 'denied' | 'prompt';
  };
  setUserLocation: (coords: { latitude: number; longitude: number }) => void;
  setLocationPermission: (permission: 'granted' | 'denied' | 'prompt') => void;
  requestUserLocation: () => Promise<{ latitude: number; longitude: number } | null>;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Explorer navigation
  currentPage: string;
  currentShopId: string | null;
  currentProdId: string | null;
  currentMarketSlug: string | null;
  navTo: (page: string) => void;
  openShop: (shopId: string) => void;
  viewProduct: (shopId: string, prodId: string) => void;
  openMarket: (slug: string) => void;
  setProdId: (id: string | null) => void;
  setShopId: (id: string | null) => void;
  setMarketSlug: (slug: string | null) => void;

  // Follow Shop System
  followingShops: string[];
  followShop: (shopId: string, shopName?: string) => void;
  unfollowShop: (shopId: string) => void;
  isFollowing: (shopId: string) => boolean;

  // Cart System
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearShopCart: (shopId: string) => void;
  clearCart: () => void;
  getCartByShop: () => Record<string, { shopName: string; shopAddress?: string; items: CartItem[]; total: number; advance: number; balance: number }>;

  // Wishlist & Saved
  wishlist: WishItem[];
  toggleWish: (shopId: string, prodId: string, product: Product, shopName: string) => void;
  isWished: (shopId: string, prodId: string) => boolean;
  savedCollections: SavedCollection[];
  toggleSaveCollection: (collection: SavedCollection) => void;
  isCollectionSaved: (id: string) => boolean;
  savedMarkets: SavedMarket[];
  toggleSaveMarket: (market: SavedMarket) => void;
  isMarketSaved: (slug: string) => boolean;

  // Reservations
  reservations: ReservationPass[];
  setReservations: (reservations: ReservationPass[]) => void;
  createReservation: (data: {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    shopId: string;
    shopName: string;
    shopAddress: string;
    shopPhone?: string;
    shopLocation?: [number, number];
    customerName?: string;
    customerPhone?: string;
    pickupDate?: string;
    timeSlot?: string;
  }) => ReservationPass;
  cancelReservation: (id: string) => void;
  redeemReservationByOtp: (otp: string) => { success: boolean; message: string; reservation?: ReservationPass };
  activeReservationNumber: string | null;
  setActiveReservationNumber: (num: string | null) => void;

  // Recently Viewed & Search History
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;

  // Toast
  toast: ToastState;
  showToast: (msg: string) => void;

  // Owner workspace
  ownerShopId: string;
  ownerShopName: string;
  ownerPage: OwnerPage;
  ownerNavTo: (page: OwnerPage) => void;
  setOwnerShopId: (shopId: string) => void;
  setOwnerShopName: (shopName: string) => void;

  // Shop Profiles & Products
  shopProfiles: Record<string, OwnerShopProfile>;
  updateShopProfile: (shopId: string, patch: Partial<OwnerShopProfile>) => void;
  setShopProfile: (shopId: string, profile: Partial<OwnerShopProfile>) => void;
  collections: { id: string; name: string; count: number; date: string }[];
  addCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  shopProducts: Record<string, Product[]>;
  addProduct: (shopId: string, product: Product) => void;
  removeProduct: (shopId: string, productId: string) => void;
  updateProductImage: (shopId: string, productId: string, image: string) => void;
  setShopProducts: (shopId: string, products: Product[]) => void;
}

const DEFAULT_RESERVATIONS: ReservationPass[] = [
  {
    id: 'res_seed_1',
    otp: 'LOC-482913',
    productId: 'prod_lamp_1',
    productName: 'Decorative Lamp',
    productImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    price: 2699,
    advancePaid: 269.9,
    balanceDue: 2429.1,
    shopId: 'sharma-handicrafts',
    shopName: 'Sharma Handicrafts',
    shopAddress: '42 Sadar Bazaar, Cantt Road, Meerut',
    shopPhone: '+91 98370 12345',
    shopLocation: [28.9845, 77.7064],
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98370 55555',
    pickupDate: '12 Oct 2026',
    timeSlot: '5:00 PM – 6:00 PM',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'res_seed_2',
    otp: 'LOC-291048',
    productId: 'prod_cotton_kurta',
    productName: 'Cotton Kurta',
    productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
    price: 899,
    advancePaid: 89.9,
    balanceDue: 809.1,
    shopId: 'style-hub',
    shopName: 'Style Hub',
    shopAddress: '18 Abu Lane, Central Market, Meerut',
    shopPhone: '+91 98370 98765',
    shopLocation: [28.9812, 77.7021],
    customerName: 'Priya Verma',
    customerPhone: '+91 98370 44444',
    pickupDate: 'Tomorrow (Anytime before 7 PM)',
    timeSlot: '4:00 PM - 5:00 PM',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },
];

export const useStore = create<AppStore>((set, get) => ({
  // ── Auth ──────────────────────────────────────────────
  user: null,
  role: 'explorer',
  setUser: (user, role) => set({ user, role: role || (user?.role ?? 'explorer') }),
  setMode: (role) => set({ role }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('locara_shutter_opened');
    }
    set({ user: null, role: 'explorer' });
  },

  // Language & Theme
  language: 'en',
  setLanguage: (language) => set({ language }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  // ── Location State ─────────────────────────────────────
  selectedCity: 'Meerut',
  setSelectedCity: (selectedCity) => set({ selectedCity }),
  userLocation: {
    latitude: null,
    longitude: null,
    permission: 'prompt',
  },
  setUserLocation: (coords) =>
    set({
      userLocation: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        permission: 'granted',
      },
    }),
  setLocationPermission: (permission) =>
    set((s) => ({
      userLocation: {
        ...s.userLocation,
        permission,
      },
    })),
  requestUserLocation: async () => {
    const { showToast } = get();
    if (typeof window === 'undefined' || !navigator.geolocation) {
      set({
        userLocation: { latitude: null, longitude: null, permission: 'denied' },
      });
      showToast('Geolocation is not supported by your browser');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          set({
            userLocation: {
              latitude: coords.latitude,
              longitude: coords.longitude,
              permission: 'granted',
            },
          });
          showToast('Location enabled! Showing nearby shops');
          resolve(coords);
        },
        (err) => {
          set((s) => ({
            userLocation: {
              ...s.userLocation,
              permission: 'denied',
            },
          }));
          if (err.code === err.PERMISSION_DENIED) {
            showToast('Location access was denied. Showing default city shops.');
          } else {
            showToast('Could not fetch location. Showing default city shops.');
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  },

  // ── Navigator ─────────────────────────────────────────
  currentPage: 'home',
  currentShopId: 'sharma-handicrafts',
  currentProdId: 'prod_lamp_1',
  currentMarketSlug: 'sadar-bazaar',
  navTo: (page) => set({ currentPage: page }),
  openShop: (shopId) => set({ currentShopId: shopId, currentPage: 'shop' }),
  viewProduct: (shopId, prodId) =>
    set({ currentShopId: shopId, currentProdId: prodId, currentPage: 'product' }),
  openMarket: (slug) => set({ currentMarketSlug: slug, currentPage: 'market' }),
  setProdId: (id) => set({ currentProdId: id }),
  setShopId: (id) => set({ currentShopId: id }),
  setMarketSlug: (slug) => set({ currentMarketSlug: slug }),

  // ── Follow Shop System ────────────────────────────────
  followingShops: ['maya-studio', 'bombay-attic'],
  followShop: (shopId, shopName) => {
    const { followingShops, showToast } = get();
    if (!followingShops.includes(shopId)) {
      set({ followingShops: [...followingShops, shopId] });
      haptic.success();
      showToast(`Now following ${shopName || 'atelier'}`);
    }
  },
  unfollowShop: (shopId) => {
    const { followingShops, showToast } = get();
    set({ followingShops: followingShops.filter((id) => id !== shopId) });
    haptic.light();
    showToast('Unfollowed atelier');
  },
  isFollowing: (shopId) => get().followingShops.includes(shopId),

  // ── Cart System ───────────────────────────────────────
  cart: [],
  addToCart: (item) => {
    const { cart, showToast } = get();
    const cartItemId = `${item.productId}_${item.size || 'std'}_${item.color || 'std'}`;
    const existingIndex = cart.findIndex((i) => i.id === cartItemId);

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
      set({ cart: updated });
    } else {
      set({ cart: [...cart, { ...item, id: cartItemId }] });
    }
    haptic.success();
    showToast(`Added ${item.name} to pickup bag`);
  },
  removeFromCart: (cartItemId) => {
    set((s) => ({ cart: s.cart.filter((i) => i.id !== cartItemId) }));
    haptic.light();
  },
  updateCartQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    set((s) => ({
      cart: s.cart.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)),
    }));
  },
  clearShopCart: (shopId) => {
    set((s) => ({ cart: s.cart.filter((i) => i.shopId !== shopId) }));
  },
  clearCart: () => set({ cart: [] }),
  getCartByShop: () => {
    const { cart } = get();
    const grouped: Record<
      string,
      { shopName: string; shopAddress?: string; items: CartItem[]; total: number; advance: number; balance: number }
    > = {};

    cart.forEach((item) => {
      if (!grouped[item.shopId]) {
        grouped[item.shopId] = {
          shopName: item.shopName,
          shopAddress: item.shopAddress,
          items: [],
          total: 0,
          advance: 0,
          balance: 0,
        };
      }
      grouped[item.shopId].items.push(item);
      grouped[item.shopId].total += item.price * item.quantity;
    });

    Object.keys(grouped).forEach((shopId) => {
      const g = grouped[shopId];
      g.advance = Math.round(g.total * 0.1);
      g.balance = g.total - g.advance;
    });

    return grouped;
  },

  // ── Wishlist ───────────────────────────────────────────
  wishlist: [],
  toggleWish: (shopId, prodId, product, shopName) => {
    const { wishlist } = get();
    const idx = wishlist.findIndex((w) => w.shopId === shopId && w.prodId === prodId);
    if (idx >= 0) {
      set({ wishlist: wishlist.filter((_, i) => i !== idx) });
      haptic.light();
      get().showToast('Removed from saved gems');
    } else {
      set({
        wishlist: [
          ...wishlist,
          {
            shopId,
            prodId,
            name: product.name,
            price: product.price,
            unit: product.unit,
            shopName,
            image: product.image,
          },
        ],
      });
      haptic.success();
      get().showToast('Saved to your collection ❤️');
    }
  },
  isWished: (shopId, prodId) =>
    get().wishlist.some((w) => w.shopId === shopId && w.prodId === prodId),

  // Saved Collections & Markets
  savedCollections: [],
  toggleSaveCollection: (collection) => {
    const { savedCollections } = get();
    const exists = savedCollections.some((c) => c.id === collection.id);
    if (exists) {
      set({ savedCollections: savedCollections.filter((c) => c.id !== collection.id) });
      get().showToast('Collection removed from saved');
    } else {
      set({ savedCollections: [...savedCollections, collection] });
      haptic.success();
      get().showToast('Collection saved');
    }
  },
  isCollectionSaved: (id) => get().savedCollections.some((c) => c.id === id),

  savedMarkets: [],
  toggleSaveMarket: (market) => {
    const { savedMarkets } = get();
    const exists = savedMarkets.some((m) => m.slug === market.slug);
    if (exists) {
      set({ savedMarkets: savedMarkets.filter((m) => m.slug !== market.slug) });
      get().showToast('Market removed from saved');
    } else {
      set({ savedMarkets: [...savedMarkets, market] });
      haptic.success();
      get().showToast('Market bookmarked');
    }
  },
  isMarketSaved: (slug) => get().savedMarkets.some((m) => m.slug === slug),

  // ── Reservations (Offline Drop Passes) ─────────────────
  reservations: DEFAULT_RESERVATIONS,
  setReservations: (reservations) => set({ reservations }),
  createReservation: (data) => {
    const { reservations, user, showToast } = get();
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const otp = `LOC-${random6}`;
    const advancePaid = Math.round(data.price * 0.1);
    const balanceDue = data.price - advancePaid;

    const newPass: ReservationPass = {
      id: `res_${Date.now()}`,
      otp,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      price: data.price,
      advancePaid,
      balanceDue,
      shopId: data.shopId,
      shopName: data.shopName,
      shopAddress: data.shopAddress,
      shopPhone: data.shopPhone || '+91 80 4123 9988',
      shopLocation: data.shopLocation || [12.9716, 77.6412],
      customerName: data.customerName || (user?.name ?? 'Rohan Mehta'),
      customerPhone: data.customerPhone || (user?.phone ?? '+91 98450 99881'),
      pickupDate: data.pickupDate || 'Tomorrow (Anytime 11 AM - 8 PM)',
      timeSlot: data.timeSlot || '11:00 AM - 8:00 PM',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    };

    set({
      reservations: [newPass, ...reservations],
      activeReservationNumber: otp,
    });
    haptic.success();
    showToast(`In-Store Pass Confirmed! OTP: ${otp}`);
    return newPass;
  },
  cancelReservation: (id) => {
    const { reservations, showToast } = get();
    set({
      reservations: reservations.map((r) =>
        r.id === id ? { ...r, status: 'CANCELLED' as const } : r
      ),
    });
    haptic.light();
    showToast('Reservation pass cancelled');
  },
  redeemReservationByOtp: (otp) => {
    const { reservations, showToast } = get();
    const cleanOtp = otp.trim().toUpperCase();
    const target = reservations.find(
      (r) => r.otp === cleanOtp || r.otp === `LOC-${cleanOtp}`
    );

    if (!target) {
      return { success: false, message: 'Invalid OTP code. No matching reservation found.' };
    }

    if (target.status === 'COMPLETED') {
      return { success: false, message: 'This pass has already been redeemed.' };
    }

    if (target.status === 'CANCELLED') {
      return { success: false, message: 'This reservation was cancelled by the customer.' };
    }

    const updated = reservations.map((r) =>
      r.id === target.id ? { ...r, status: 'COMPLETED' as const } : r
    );

    set({ reservations: updated });
    haptic.success();
    showToast(`Verified & Redeemed pickup for ${target.customerName}!`);
    return {
      success: true,
      message: `Successfully verified pickup for ${target.customerName} (${target.productName})`,
      reservation: { ...target, status: 'COMPLETED' },
    };
  },
  activeReservationNumber: null,
  setActiveReservationNumber: (activeReservationNumber) => set({ activeReservationNumber }),

  // ── Recently Viewed & Search History ───────────────────
  recentlyViewed: [],
  addRecentlyViewed: (id) =>
    set((s) => ({
      recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 6),
    })),
  searchHistory: [],
  addSearchHistory: (query) =>
    set((s) => ({
      searchHistory: [query, ...s.searchHistory.filter((x) => x !== query)].slice(0, 6),
    })),

  // ── Toast ──────────────────────────────────────────────
  toast: { message: '', visible: false },
  showToast: (message) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => set({ toast: { message: '', visible: false } }), 3500);
  },

  // ── Owner ──────────────────────────────────────────────
  ownerShopId: 'sharma-handicrafts',
  ownerShopName: 'Sharma Handicrafts',
  ownerPage: 'showcase',
  ownerNavTo: (page) => set({ ownerPage: page }),
  setOwnerShopId: (ownerShopId) => set({ ownerShopId }),
  setOwnerShopName: (ownerShopName) => set({ ownerShopName }),

  shopProfiles: Object.fromEntries(
    SHOPS.map((s) => [
      s.id,
      {
        tagline: 'Artisanal Handlooms & Fine Crafted Silks',
        description: s.story ?? 'Curated boutique showcasing living craft traditions.',
        phone: s.phone ?? '+91 80 4123 9988',
        email: 'contact@mayastudio.in',
        website: s.website ?? 'https://mayastudio.in',
        openTime: '10:30',
        closeTime: '20:30',
        isOpen: true,
        specialties: ['Handloom Silks', 'Zari Weaving', 'Custom Tailoring'],
        lat: 12.9716,
        lng: 77.6412,
      } satisfies OwnerShopProfile,
    ])
  ),
  updateShopProfile: (shopId, patch) =>
    set((state) => ({
      shopProfiles: {
        ...state.shopProfiles,
        [shopId]: { ...state.shopProfiles[shopId], ...patch },
      },
    })),
  setShopProfile: (shopId, profile) =>
    set((state) => {
      const existing = state.shopProfiles[shopId] ?? {
        tagline: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        openTime: '10:30',
        closeTime: '20:30',
        isOpen: true,
        specialties: [],
        lat: undefined,
        lng: undefined,
      };
      return {
        shopProfiles: {
          ...state.shopProfiles,
          [shopId]: {
            ...existing,
            ...profile,
          },
        },
      };
    }),

  // ── Collections ────────────────────────────────────────
  collections: [
    { id: 'c1', name: 'Autumn Silk & Ikat Edit 2026', count: 18, date: 'Sep 2026' },
    { id: 'c2', name: 'Terracotta & Studio Pottery', count: 12, date: 'Oct 2026' },
  ],
  addCollection: (name) =>
    set((s) => ({
      collections: [...s.collections, { id: 'c' + Date.now(), name, count: 0, date: 'Sep 2026' }],
    })),
  deleteCollection: (id) =>
    set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

  // ── Shop Products ──────────────────────────────────────
  shopProducts: Object.fromEntries(SHOPS.map((s) => [s.id, s.products])),
  addProduct: (shopId, product) =>
    set((s) => ({
      shopProducts: {
        ...s.shopProducts,
        [shopId]: [...(s.shopProducts[shopId] ?? []), product],
      },
    })),
  removeProduct: (shopId, productId) =>
    set((s) => ({
      shopProducts: {
        ...s.shopProducts,
        [shopId]: (s.shopProducts[shopId] ?? []).filter((p) => p.id !== productId),
      },
    })),
  updateProductImage: (shopId, productId, image) =>
    set((state) => ({
      shopProducts: {
        ...state.shopProducts,
        [shopId]: (state.shopProducts[shopId] ?? []).map((p) =>
          p.id === productId ? { ...p, image } : p
        ),
      },
    })),
  setShopProducts: (shopId, products) =>
    set((state) => ({
      shopProducts: {
        ...state.shopProducts,
        [shopId]: products,
      },
    })),
}));
