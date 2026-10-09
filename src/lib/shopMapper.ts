import { DEFAULT_HOURS, getLegacyBadge, shopImages } from "@/data/shops";
import type { Shop, Product } from "@/types/shop";
import type { IShopProfile } from "@/models/ShopProfile";
import { toCanonicalShopCategory } from "@/lib/shopCategories";
import { SEED_LOCARA_SHOPS, SEED_RAW_PRODUCTS, type SeedShop } from "@/data/seedVisualSearchData";

export function mapDbShopToShop(doc: any): Shop {
  const raw = doc as Partial<IShopProfile> & { _id?: { toString: () => string } | string };
  const id = typeof raw._id === "string" ? raw._id : raw._id?.toString?.() ?? raw.shopId ?? "";
  const category = toCanonicalShopCategory(raw.category);
  const estYear = raw.est ?? new Date().getFullYear();
  const age = raw.age ?? Math.max(0, new Date().getFullYear() - estYear);

  const coords = raw.location?.coordinates;
  const lat = Array.isArray(coords) && coords.length === 2 ? coords[1] : 28.9845;
  const lng = Array.isArray(coords) && coords.length === 2 ? coords[0] : 77.7064;

  const fallbackPhotos = shopImages(category);
  const photos = raw.photos?.length ? raw.photos : fallbackPhotos;
  const openingText = raw.openTime && raw.closeTime ? `${raw.openTime} - ${raw.closeTime}` : undefined;

  return {
    id,
    placeId: raw.shopId ?? id,
    source: 'locara',
    name: raw.name ?? "Local Shop",
    cat: raw.subcategory || raw.category || category,
    subcategory: raw.subcategory,
    tags: raw.tags ?? [],
    keywords: raw.keywords ?? [],
    aiGeneratedDescription: raw.aiGeneratedDescription,
    isHeritage: typeof raw.est === 'number' && new Date().getFullYear() - raw.est >= 100,
    heritageYears: typeof raw.est === 'number' && new Date().getFullYear() - raw.est >= 100
      ? new Date().getFullYear() - raw.est
      : undefined,
    est: estYear,
    age,
    owner: raw.ownerName ?? "Shop Owner",
    ownerImg: raw.ownerImg ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    story: raw.description ?? "",
    addr: [raw.address, raw.city, raw.state].filter(Boolean).join(", ") || "India",
    loc: [lat, lng],
    badge: getLegacyBadge(age),
    images: photos,
    hours: DEFAULT_HOURS,
    reviews: [],
    rating: raw.rating ?? 0,
    totalRatings: raw.totalRatings ?? 0,
    openNow: typeof raw.isOpen === "boolean" ? raw.isOpen : null,
    openingHours: [],
    photos,
    phone: raw.phone,
    website: raw.website,
    products: (raw.products ?? []) as Shop["products"],
    ownerProfile: {
      ownerName: raw.ownerName,
      ownerPhone: raw.phone,
      description: raw.description,
      tagline: raw.tagline,
      specialties: raw.specialties ?? raw.tags ?? [],
      fullAddress: [raw.address, raw.city, raw.state].filter(Boolean).join(", "),
      openingHoursText: openingText,
      lat,
      lng,
    },
  };
}

export function mapSeedShopToShop(seed: SeedShop): Shop {
  const category = toCanonicalShopCategory(seed.category);
  const estMatch = (seed.tagline || '').match(/(\d{4})/);
  const estYear = estMatch ? parseInt(estMatch[1], 10) : 1968;
  const age = Math.max(1, new Date().getFullYear() - estYear);

  const matchedProducts: Product[] = SEED_RAW_PRODUCTS
    .filter((p) => p.shopId === seed.id)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      inStock: p.stock > 0,
      isNew: false,
      description: p.description,
      category: p.category,
      image: p.image,
    }));

  const photos = seed.photos && seed.photos.length ? seed.photos : shopImages(category);

  return {
    id: seed.id,
    placeId: seed.id,
    source: 'curated',
    name: seed.name,
    cat: category,
    est: estYear,
    age,
    owner: 'Master Artisan',
    ownerImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed.id}`,
    story: seed.tagline,
    addr: `${seed.addr}, ${seed.city}`,
    loc: [seed.lat, seed.lng],
    badge: getLegacyBadge(age),
    images: photos,
    hours: DEFAULT_HOURS,
    reviews: [
      {
        author: 'Priya Sharma',
        rating: 5,
        text: 'Absolute gem of authentic craftsmanship and quality.',
        date: '2026-02-14',
      },
    ],
    rating: seed.rating,
    totalRatings: seed.reviewsCount,
    openNow: seed.isOpen,
    openingHours: ['09:00 - 21:00'],
    photos,
    products: matchedProducts,
    ownerProfile: {
      ownerName: 'Master Artisan',
      description: seed.tagline,
      tagline: seed.tagline,
      specialties: [seed.category],
      fullAddress: `${seed.addr}, ${seed.city}`,
      openingHoursText: '09:00 - 21:00',
      lat: seed.lat,
      lng: seed.lng,
    },
  };
}

export function getAllSeedShops(): Shop[] {
  return SEED_LOCARA_SHOPS.map(mapSeedShopToShop);
}

