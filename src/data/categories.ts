import type { ShopCategory } from '@/types/shop';

export type CategoryId =
  | 'all'
  | 'sweets'
  | 'bridal'
  | 'handlooms'
  | 'jewellery'
  | 'handicrafts'
  | 'spices'
  | 'streetfood'
  | 'footwear'
  | 'puja'
  | 'grocery'
  | 'pharmacy'
  | 'heritage';

export interface Category {
  id: CategoryId;
  label: string;
  labelHindi: string;
  icon: string; // Emoji or unicode icon
  shopCats: ShopCategory[];
  keywords: string[];
}

export type SortId = 'relevance' | 'rating' | 'legacy' | 'name';

export interface SortOption {
  id: SortId;
  label: string;
}

export type PriceRange = 'all' | 'budget' | 'mid' | 'premium';

export type HoursFilter = 'any' | 'open_now' | 'open_late';

export interface FilterState {
  category: CategoryId;
  sort: SortId;
  openNow: boolean;
  minRating: number;
  priceRange: PriceRange;
  hours: HoursFilter;
  openAt: string;
  discountOnly: boolean;
  minDiscount: number;
  newCollection: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  sort: 'relevance',
  openNow: false,
  minRating: 0,
  priceRange: 'all',
  hours: 'any',
  openAt: '',
  discountOnly: false,
  minDiscount: 0,
  newCollection: false,
};

export const SORT_OPTIONS: SortOption[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'legacy', label: 'Oldest First' },
  { id: 'name', label: 'A - Z' },
];

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    label: 'All',
    labelHindi: 'Sab',
    icon: '✨',
    shopCats: ['sweets', 'grocery', 'pharmacy', 'general'],
    keywords: [],
  },
  {
    id: 'sweets',
    label: 'Sweets & Mithai',
    labelHindi: 'Mithai',
    icon: '🍬',
    shopCats: ['sweets'],
    keywords: ['mithai', 'jalebi', 'laddu', 'barfi', 'gajak', 'rewri', 'halwai', 'sweet', 'kaju katli'],
  },
  {
    id: 'bridal',
    label: 'Bridal & Sarees',
    labelHindi: 'Dulhan & Saree',
    icon: '👗',
    shopCats: ['general'],
    keywords: ['saree', 'lehenga', 'bridal', 'couture', 'silk', 'zari', 'banarasi', 'chanderi'],
  },
  {
    id: 'handlooms',
    label: 'Handlooms',
    labelHindi: 'Hathkargha',
    icon: '🧵',
    shopCats: ['general'],
    keywords: ['handloom', 'khadi', 'cotton', 'pashmina', 'shawl', 'chikankari', 'weave'],
  },
  {
    id: 'jewellery',
    label: 'Jewelry & Kundan',
    labelHindi: 'Gehne',
    icon: '💎',
    shopCats: ['general'],
    keywords: ['jewellery', 'jewelry', 'gold', 'silver', 'kundan', 'polki', 'choker', 'gem'],
  },
  {
    id: 'handicrafts',
    label: 'Handicrafts',
    labelHindi: 'Hastkala',
    icon: '🏺',
    shopCats: ['general'],
    keywords: ['crafts', 'pottery', 'wood', 'brass', 'terracotta', 'handmade', 'artisan'],
  },
  {
    id: 'spices',
    label: 'Spices & Herbs',
    labelHindi: 'Masale',
    icon: '🌶️',
    shopCats: ['grocery', 'general'],
    keywords: ['spices', 'masala', 'mirch', 'haldi', 'dhania', 'garam', 'saffron', 'kesar'],
  },
  {
    id: 'streetfood',
    label: 'Street Food',
    labelHindi: 'Chaat & Khana',
    icon: '🍲',
    shopCats: ['sweets', 'general'],
    keywords: ['chaat', 'kachori', 'samosa', 'chole', 'bhature', 'kulcha', 'kulfi', 'falooda'],
  },
  {
    id: 'footwear',
    label: 'Juttis & Footwear',
    labelHindi: 'Jutti',
    icon: '👡',
    shopCats: ['general'],
    keywords: ['jutti', 'mojari', 'sandals', 'leather', 'footwear', 'shoes'],
  },
  {
    id: 'puja',
    label: 'Puja Essentials',
    labelHindi: 'Puja Samagri',
    icon: '🪔',
    shopCats: ['general', 'grocery'],
    keywords: ['puja', 'pooja', 'dhoop', 'agarbatti', 'diya', 'kumkum', 'brass diya'],
  },
  {
    id: 'heritage',
    label: 'Centennial Legacy',
    labelHindi: 'Virasat',
    icon: '🏛️',
    shopCats: ['sweets', 'grocery', 'pharmacy', 'general'],
    keywords: ['since', 'est', 'old', 'heritage', 'traditional', 'purana', 'century'],
  },
];
