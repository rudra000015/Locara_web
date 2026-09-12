export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  inStock: boolean;
  isNew: boolean;
  discountPct?: number; // e.g. 10 for 10% off
  description?: string;
  category?: string;
  image?: string;
}

export type LegacyBadge = 'centennial' | 'heritage' | 'established' | 'rising';

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string; // ISO-ish display string
}

// Used by the "OpenStatus" pill + legacy shop cards.
export interface Hours {
  open: string; // "09:00"
  close: string; // "21:00"
  closed: boolean;
}

// Owner profile "menu" items used in Explorer -> ShopProfile.
export interface MenuItem {
  id: string;
  name: string;
  nameHindi?: string;
  price: number;
  unit: string;
  category: string;
  description?: string;
  isAvailable: boolean;
  isSignature?: boolean;
  isVeg: boolean;
}

// Owner profile structured hours (different from the legacy Hours above).
export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OpeningHoursMap {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

// Rich owner-filled profile shown in Explorer -> ShopProfile.
export interface ShopOwnerProfile {
  ownerName?: string;
  ownerPhone?: string;
  whatsapp?: string;
  bio?: string;

  googleMapsUrl?: string;
  googlePlaceId?: string;
  lat?: number;
  lng?: number;
  fullAddress?: string;
  landmark?: string;

  established?: string;
  speciality?: string;
  description?: string;
  tagline?: string;

  openingHoursMap?: OpeningHoursMap;
  openingHoursText?: string;

  photos?: string[];
  coverPhoto?: string;
  logoUrl?: string;

  instagram?: string;
  facebook?: string;

  menu?: MenuItem[];

  fssaiNumber?: string;
  gstin?: string;
  isVerified?: boolean;

  specialties?: string[];
}

export interface GooglePlacesData {
  rating: number;
  totalRatings: number;
  openNow: boolean | null;
  openingHours: string[];
  photos: string[];
  phone?: string;
  website?: string;
  priceLevel?: number;
}

export type ShopCategory = 'sweets' | 'grocery' | 'pharmacy' | 'general';

export interface Shop {
  id: string;
  placeId: string;
  name: string;
  cat: ShopCategory;
  distanceMeters?: number;

  est: number;
  age: number;

  owner: string;
  ownerImg: string;
  story: string;
  addr: string;
  loc: [number, number];

  // "Legacy" / offline-first fields (used throughout the UI).
  badge: LegacyBadge;
  images: string[];
  hours: Record<string, Hours>;
  reviews: Review[];
  whatsapp?: string;

  // Live / external data (optional).
  googleData?: GooglePlacesData;
  rating: number;
  totalRatings: number;
  openNow?: boolean | null;
  openingHours?: string[];
  photos?: string[];
  phone?: string;
  website?: string;

  products: Product[];

  ownerProfile?: ShopOwnerProfile;
}
