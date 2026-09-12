import { create } from 'zustand';
import { Product } from '@/types/shop';
import { SHOPS } from '@/data/shops';
import { haptic } from '@/utils/haptic';

export type ThemeMode = 'light' | 'dark';
export type LanguageMode = 'en' | 'hi';

export interface CartItem {
  id: string; // unique cart item id (e.g. prodId_size_color)
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

interface ToastState {
  message: string;
  visible: boolean;
}

export type OwnerPage = 'showcase' | 'collections' | 'addproduct' | 'profile' | 'analytics' | 'reservations';

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
  user: { id?: string; name: string; email?: string; img: string; role?: 'explorer' | 'owner' } | null;
  role: 'explorer' | 'owner';
  setUser: (
    user: { id?: string; name: string; email?: string; img: string; role?: 'explorer' | 'owner' },
    role: 'explorer' | 'owner'
  ) => void;
  logout: () => void;

  // Language
  language: LanguageMode;
  setLanguage: (l: LanguageMode) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;

  // Explorer navigation
  currentPage: string;
  currentShopId: string | null;
  currentProdId: string | null;
  currentMarketSlug: string | null;
  navTo: (page: string) => void;
  openShop: (shopId: string) => void;
  viewProduct: (shopId: string, prodId: string) => void;
  openMarket: (slug: string) => void;

  // Follow Shop System
  followingShops: string[];
  followShop: (shopId: string, shopName?: string) => void;
  unfollowShop: (shopId: string) => void;
  isFollowing: (shopId: string) => boolean;

  // Cart System (Separated by shop)
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

  // Recently Viewed & Search History
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;

  // Active Reservation modal / focus
  activeReservationNumber: string | null;
  setActiveReservationNumber: (num: string | null) => void;

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

  // Owner: Shop profile editor
  shopProfiles: Record<string, OwnerShopProfile>;
  updateShopProfile: (shopId: string, patch: Partial<OwnerShopProfile>) => void;
  setShopProfile: (shopId: string, profile: Partial<OwnerShopProfile>) => void;

  // Collections
  collections: { id: string; name: string; count: number; date: string }[];
  addCollection: (name: string) => void;
  deleteCollection: (id: string) => void;

  // Shop Products
  shopProducts: Record<string, Product[]>;
  addProduct: (shopId: string, product: Product) => void;
  removeProduct: (shopId: string, productId: string) => void;
  updateProductImage: (shopId: string, productId: string, image: string) => void;
  setShopProducts: (shopId: string, products: Product[]) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // ── Auth ──────────────────────────────────────────────
  user: null,
  role: 'explorer',
  setUser: (user, role) => set({ user, role }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('intro_seen_'))
        .forEach((k) => sessionStorage.removeItem(k));
    }
    set({ user: null, role: 'explorer' });
  },

  // Language
  language: 'en',
  setLanguage: (language) => set({ language }),

  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  // ── Navigator ─────────────────────────────────────────
  currentPage: 'home',
  currentShopId: null,
  currentProdId: null,
  currentMarketSlug: null,
  navTo: (page) => set({ currentPage: page }),
  openShop: (shopId) => set({ currentShopId: shopId, currentPage: 'shop' }),
  viewProduct: (shopId, prodId) =>
    set({ currentShopId: shopId, currentProdId: prodId, currentPage: 'product' }),
  openMarket: (slug) => set({ currentMarketSlug: slug, currentPage: 'market' }),

  // ── Follow Shop System ────────────────────────────────
  followingShops: ['hira', 'sharma-fashion'],
  followShop: (shopId, shopName) => {
    const { followingShops, showToast } = get();
    if (!followingShops.includes(shopId)) {
      set({ followingShops: [...followingShops, shopId] });
      haptic.success();
      showToast(`Now following ${shopName || 'shop'}`);
    }
  },
  unfollowShop: (shopId) => {
    const { followingShops, showToast } = get();
    set({ followingShops: followingShops.filter((id) => id !== shopId) });
    haptic.light();
    showToast('Unfollowed shop');
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
    showToast(`Added ${item.name} to cart`);
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
      get().showToast('Removed from wishlist');
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
      get().showToast('Saved to wishlist ❤️');
    }
  },
  isWished: (shopId, prodId) =>
    get().wishlist.some((w) => w.shopId === shopId && w.prodId === prodId),

  // Saved Collections
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

  // Saved Markets
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
      get().showToast('Market saved');
    }
  },
  isMarketSaved: (slug) => get().savedMarkets.some((m) => m.slug === slug),

  // ── Recently Viewed ────────────────────────────────────
  recentlyViewed: [],
  addRecentlyViewed: (id) =>
    set((s) => ({
      recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 6),
    })),

  // ── Search History ─────────────────────────────────────
  searchHistory: [],
  addSearchHistory: (query) =>
    set((s) => ({
      searchHistory: [query, ...s.searchHistory.filter((x) => x !== query)].slice(0, 6),
    })),

  // ── Active Reservation Focus ───────────────────────────
  activeReservationNumber: null,
  setActiveReservationNumber: (activeReservationNumber) => set({ activeReservationNumber }),

  // ── Toast ──────────────────────────────────────────────
  toast: { message: '', visible: false },
  showToast: (message) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => set({ toast: { message: '', visible: false } }), 3500);
  },

  // ── Owner ──────────────────────────────────────────────
  ownerShopId: 'hira',
  ownerShopName: 'Hira Sweets',
  ownerPage: 'showcase',
  ownerNavTo: (page) => set({ ownerPage: page }),
  setOwnerShopId: (ownerShopId) => set({ ownerShopId }),
  setOwnerShopName: (ownerShopName) => set({ ownerShopName }),

  shopProfiles: Object.fromEntries(
    SHOPS.map((s) => [
      s.id,
      {
        tagline: '',
        description: s.story ?? '',
        phone: s.phone ?? '',
        email: '',
        website: s.website ?? '',
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
        specialties: [],
        lat: undefined,
        lng: undefined,
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
        openTime: '09:00',
        closeTime: '21:00',
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
    { id: 'c1', name: 'Festive Wedding Edit 2026', count: 14, date: 'Nov 2026' },
    { id: 'c2', name: 'Winter Season Gajak & Mithai Box', count: 8, date: 'Dec 2026' },
  ],
  addCollection: (name) =>
    set((s) => ({
      collections: [...s.collections, { id: 'c' + Date.now(), name, count: 0, date: 'Mar 2026' }],
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
