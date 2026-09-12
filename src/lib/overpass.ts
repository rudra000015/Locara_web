// ============================================================
// src/lib/overpass.ts
// ============================================================
// 100% FREE — No API key, no billing, no signup required
// Uses OpenStreetMap data via Overpass API
// Rate limit: max 1 request/second, be respectful

import { DEFAULT_HOURS, getLegacyBadge, shopImages } from '@/data/shops';
import type { Shop } from '@/types/shop';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Meerut center coordinates
const MEERUT = { lat: 28.9845, lng: 77.7064 };

// ── Build Overpass QL query ───────────────────────────────────
// Fetches shops/amenities within a radius around Meerut center
function buildQuery(lat: number, lng: number, radiusMeters: number): string {
  // around: radius, lat, lng
  return `
    [out:json][timeout:25];
    (
      node["shop"="confectionery"](around:${radiusMeters},${lat},${lng});
      node["shop"="sweets"](around:${radiusMeters},${lat},${lng});
      node["shop"="bakery"](around:${radiusMeters},${lat},${lng});
      node["shop"="grocery"](around:${radiusMeters},${lat},${lng});
      node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      node["shop"="convenience"](around:${radiusMeters},${lat},${lng});
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      node["shop"="general"](around:${radiusMeters},${lat},${lng});
      node["shop"="kirana"](around:${radiusMeters},${lat},${lng});
      node["shop"="medical"](around:${radiusMeters},${lat},${lng});
      node["name"~"halwai|sweets|mithai|rewri|gajak|medical|pharmacy|kirana|grocery",i](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;
}

// ── Text search query ─────────────────────────────────────────
function buildSearchQuery(searchTerm: string, lat: number, lng: number, radiusMeters: number): string {
  // Escape special regex characters
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return `
    [out:json][timeout:25];
    (
      node["name"~"${escaped}",i](around:${radiusMeters},${lat},${lng});
      node["shop"]["name"~"${escaped}",i](around:${radiusMeters},${lat},${lng});
      node["amenity"]["name"~"${escaped}",i](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;
}

// ── Fetch from Overpass ───────────────────────────────────────
async function fetchOverpass(query: string): Promise<any[]> {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Locara/1.0 (Heritage Discovery; contact@locara.app)',
    },
    body: `data=${encodeURIComponent(query)}`,
    next: { revalidate: 3600 }, // cache 1 hour
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.elements ?? [];
}

// ── Main: search nearby shops ─────────────────────────────────
export async function searchNearbyShops(
  lat = MEERUT.lat,
  lng = MEERUT.lng,
  radiusMeters = 3000
): Promise<Shop[]> {
  const elements = await fetchOverpass(buildQuery(lat, lng, radiusMeters));
  return elements
    .filter((el: any) => el.tags?.name) // only named places
    .map((el: any, i: number) => mapElementToShop(el, i));
}

// ── Text search ───────────────────────────────────────────────
export async function textSearchShops(
  query: string,
  lat = MEERUT.lat,
  lng = MEERUT.lng,
  radiusMeters = 5000
): Promise<Shop[]> {
  const elements = await fetchOverpass(buildSearchQuery(query, lat, lng, radiusMeters));
  return elements
    .filter((el: any) => el.tags?.name)
    .map((el: any, i: number) => mapElementToShop(el, i));
}

// ── Get single shop by OSM node ID ───────────────────────────
export async function getShopById(osmId: string): Promise<Shop | null> {
  const query = `
    [out:json][timeout:10];
    node(${osmId});
    out body;
  `;
  const elements = await fetchOverpass(query);
  if (!elements.length) return null;
  return mapElementToShop(elements[0], 0);
}

// ── Map OSM element → our Shop type ──────────────────────────
export function mapElementToShop(el: any, index: number): Shop {
  const tags = el.tags ?? {};

  // Derive category
  const shopTag = tags.shop ?? '';
  const amenityTag = tags.amenity ?? '';

  let cat: Shop['cat'] = 'general';
  if (['pharmacy', 'doctors', 'medical'].includes(amenityTag) || shopTag === 'medical') {
    cat = 'pharmacy';
  } else if (['grocery', 'supermarket', 'convenience', 'kirana', 'general'].includes(shopTag)) {
    cat = 'grocery';
  } else if (['confectionery', 'sweets', 'bakery'].includes(shopTag) ||
    /halwai|sweets|mithai|rewri|gajak|jalebi|laddu/i.test(tags.name ?? '')) {
    cat = 'sweets';
  }

  // Opening hours — OSM uses a standard format like "Mo-Sa 09:00-21:00"
  const rawHours = tags.opening_hours ?? '';
  const openingHours = rawHours ? [rawHours] : [];

  // Build address from OSM addr tags
  const addrParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'] ?? 'Meerut',
  ].filter(Boolean);
  const addr = addrParts.length > 0 ? addrParts.join(', ') : tags['addr:full'] ?? 'Meerut, UP';

  // Est year from OSM start_date tag if available
  const startDate = tags.start_date ?? '';
  const estYear = startDate ? parseInt(startDate.substring(0, 4)) || 1950 : 1950;
  const age = new Date().getFullYear() - estYear;

  return {
    id: String(el.id),
    placeId: String(el.id),           // OSM node ID used as placeId
    name: tags.name ?? 'Unknown Shop',
    est: estYear,
    age,
    cat,
    owner: tags['contact:person'] ?? tags.operator ?? 'Shop Owner',
    ownerImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${el.id}`,
    whatsapp: '919000000000',
    story: tags.description ?? tags['short_description'] ?? generateStory(tags.name, cat, age),
    addr,
    phone: tags.phone ?? tags['contact:phone'] ?? undefined,
    website: tags.website ?? tags['contact:website'] ?? undefined,
    openNow: null, // OSM doesn't give real-time open status
    openingHours,
    photos: [], // OSM has no photos — we use dicebear avatar as fallback
    loc: [el.lat, el.lon],
    rating: parseFloat(tags['stars'] ?? '0') || randomRating(el.id),
    totalRatings: 0,
    badge: getLegacyBadge(age),
    images: shopImages(cat),
    hours: DEFAULT_HOURS,
    reviews: [],
    products: [],
  };
}

// ── Helpers ───────────────────────────────────────────────────

// Generate a realistic story when OSM has no description
function generateStory(name: string, cat: Shop['cat'], age: number): string {
  const stories: Record<Shop['cat'], string[]> = {
    sweets: [
      `A beloved sweet shop serving authentic ${name.includes('Rewri') ? 'rewri and gajak' : 'Indian sweets'} to Meerut families for generations.`,
      `Known for traditional recipes and pure desi ghee preparations, ${name} is a local favourite.`,
      `Serving fresh handmade sweets and namkeen with the taste of old Meerut.`,
    ],
    grocery: [
      `Your trusted neighbourhood kirana store for daily essentials and quality groceries.`,
      `Serving the community with fresh produce and quality goods at honest prices.`,
      `A reliable grocery destination for households across Meerut.`,
    ],
    pharmacy: [
      `A trusted medical hall providing genuine medicines and healthcare products.`,
      `Serving the community's healthcare needs with authentic medicines and expert advice.`,
      `Your neighbourhood pharmacy for all medical and wellness needs.`,
    ],
    general: [
      `A well-known shop in Meerut serving the community with quality products.`,
      `Trusted by local families for quality and honest service.`,
      `A cornerstone of the local market, known for reliability and variety.`,
    ],
  };
  const list = stories[cat];
  // Use shop id hash to pick consistent story
  const idx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % list.length;
  return list[idx];
}

// Deterministic pseudo-rating from OSM node ID (so it doesn't change on refresh)
function randomRating(id: number): number {
  const seed = id % 100;
  return parseFloat((3.8 + (seed / 100) * 1.2).toFixed(1)); // 3.8 – 5.0
}
