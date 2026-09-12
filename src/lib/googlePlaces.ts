// src/lib/googlePlaces.ts
// Server-only — fetches live data (photos, hours, open status, nearby discovery) from Google Places API (New)
import type { Shop } from '@/types/shop';
import { toCanonicalShopCategory } from '@/lib/shopCategories';
import { DEFAULT_HOURS, getLegacyBadge } from '@/data/shops';

const PLACES_BASE = 'https://places.googleapis.com/v1';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export interface GoogleLiveData {
  rating: number;
  totalRatings: number;
  openNow: boolean | null;
  openingHours: string[];
  photos: string[];
  phone?: string;
  website?: string;
  priceLevel?: number;
}

// Convert a Google Places API (New) place result into a Locara Shop
export function mapGooglePlaceToShop(place: any): Shop {
  const id = `gplace_${place.id || Math.random().toString(36).slice(2, 9)}`;
  const name = place.displayName?.text || place.name || 'Local Shop';
  const rawType = place.primaryType || (Array.isArray(place.types) ? place.types[0] : 'store');
  const cat = toCanonicalShopCategory(rawType);

  const lat = place.location?.latitude ?? 28.6139;
  const lng = place.location?.longitude ?? 77.2090;

  const photos: string[] = (place.photos ?? [])
    .slice(0, 6)
    .map((p: any) => `/api/photo?name=${encodeURIComponent(p.name)}`);

  const userRatingCount = place.userRatingCount ?? 0;
  // Estimate heritage age from review count / profile or default
  const estYear = Math.max(1950, new Date().getFullYear() - Math.min(60, Math.floor(userRatingCount / 10) + 5));
  const age = Math.max(1, new Date().getFullYear() - estYear);

  return {
    id,
    placeId: place.id || id,
    name,
    cat,
    est: estYear,
    age,
    owner: 'Verified Business',
    ownerImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    story: `Popular local destination verified on Google Maps with ${userRatingCount} reviews.`,
    addr: place.formattedAddress || 'Local Market, India',
    loc: [lat, lng],
    badge: getLegacyBadge(age),
    images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80'],
    hours: DEFAULT_HOURS,
    reviews: [],
    rating: place.rating ?? 4.5,
    totalRatings: userRatingCount,
    openNow: place.currentOpeningHours?.openNow ?? null,
    openingHours: place.regularOpeningHours?.weekdayDescriptions ?? [],
    photos,
    phone: place.nationalPhoneNumber,
    website: place.websiteUri,
    products: [],
    ownerProfile: {
      ownerName: 'Verified Business',
      ownerPhone: place.nationalPhoneNumber,
      fullAddress: place.formattedAddress,
      lat,
      lng,
    },
  };
}

// 1. Search nearby shops around coordinates using Google Places API (New)
export async function searchGoogleNearbyShops(
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<Shop[]> {
  if (!API_KEY) return [];

  try {
    const res = await fetch(`${PLACES_BASE}/places:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.userRatingCount',
          'places.primaryType',
          'places.types',
          'places.photos',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.currentOpeningHours',
        ].join(','),
      },
      body: JSON.stringify({
        includedTypes: [
          'store',
          'clothing_store',
          'bakery',
          'jewelry_store',
          'supermarket',
          'grocery_store',
          'pharmacy',
          'home_goods_store',
          'shopping_mall',
          'market',
        ],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn('[googlePlaces] searchNearby error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const places = data.places || [];
    return places.map(mapGooglePlaceToShop);
  } catch (err) {
    console.error('[googlePlaces] searchNearby failed:', err);
    return [];
  }
}

// 2. Text Search for shops in a city or keyword using Google Places API (New)
export async function searchGoogleTextShops(
  textQuery: string,
  lat?: number,
  lng?: number,
  radiusMeters = 10000
): Promise<Shop[]> {
  if (!API_KEY || !textQuery) return [];

  try {
    const bodyPayload: Record<string, any> = {
      textQuery,
      maxResultCount: 20,
    };

    if (lat !== undefined && lng !== undefined) {
      bodyPayload.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      };
    }

    const res = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.userRatingCount',
          'places.primaryType',
          'places.types',
          'places.photos',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.currentOpeningHours',
        ].join(','),
      },
      body: JSON.stringify(bodyPayload),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn('[googlePlaces] searchText error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const places = data.places || [];
    return places.map(mapGooglePlaceToShop);
  } catch (err) {
    console.error('[googlePlaces] searchText failed:', err);
    return [];
  }
}

// 3. Fetch live details for a single place
export async function fetchGoogleLiveData(placeId: string): Promise<GoogleLiveData | null> {
  if (!API_KEY) {
    return null;
  }

  try {
    const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'rating',
          'userRatingCount',
          'currentOpeningHours',
          'regularOpeningHours',
          'nationalPhoneNumber',
          'websiteUri',
          'photos',
          'priceLevel',
        ].join(','),
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;
    const data = await res.json();

    const photos: string[] = (data.photos ?? [])
      .slice(0, 8)
      .map((p: any) => `/api/photo?name=${encodeURIComponent(p.name)}`);

    return {
      rating: data.rating ?? 0,
      totalRatings: data.userRatingCount ?? 0,
      openNow: data.currentOpeningHours?.openNow ?? null,
      openingHours: data.regularOpeningHours?.weekdayDescriptions ?? [],
      photos,
      phone: data.nationalPhoneNumber,
      website: data.websiteUri,
      priceLevel: data.priceLevel,
    };
  } catch (err) {
    console.error('[googlePlaces] fetch error:', err);
    return null;
  }
}

// 4. Photo proxy route handler
export async function fetchGooglePhoto(name: string, maxWidth = 800): Promise<Response> {
  if (!API_KEY) return new Response('No API key', { status: 500 });

  const url = `${PLACES_BASE}/${name}/media?maxWidthPx=${maxWidth}&skipHttpRedirect=true&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return new Response('Photo fetch failed', { status: res.status });

  const data = await res.json();
  if (!data.photoUri) return new Response('No photo URI', { status: 404 });

  return Response.redirect(data.photoUri, 302);
}