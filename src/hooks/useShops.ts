'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Shop } from '@/types/shop';
import { getCityByName, getDefaultCity } from '@/lib/cities';
import { getDistanceMeters } from '@/lib/geo';

interface UseShopsOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  query?: string;
  city?: string;
  enabled?: boolean;
  autoGps?: boolean;
}

interface UseShopsReturn {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  locationError: string | null;
  userLocation: { lat: number; lng: number } | null;
  centerLocation: { lat: number; lng: number } | null;
  refetch: (searchQuery?: string) => Promise<void>;
}

function asNumber(value?: number): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function useShops(opts: UseShopsOptions = {}): UseShopsReturn {
  const {
    lat,
    lng,
    radius = 3000,
    query,
    city,
    enabled = true,
    autoGps = true,
  } = opts;

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerLocation, setCenterLocation] = useState<{ lat: number; lng: number } | null>(null);

  const resolvedLat = useRef<number>(asNumber(lat) ?? getDefaultCity().lat);
  const resolvedLng = useRef<number>(asNumber(lng) ?? getDefaultCity().lng);
  const lastFetchCoords = useRef<{ lat: number; lng: number } | null>(null);

  const fetchShops = useCallback(async (searchQuery?: string, coords?: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);

    try {
      const effectiveLat = coords?.lat ?? resolvedLat.current;
      const effectiveLng = coords?.lng ?? resolvedLng.current;
      const params = new URLSearchParams();
      params.set('lat', String(effectiveLat));
      params.set('lng', String(effectiveLng));
      params.set('radius', String(radius));

      if (city) params.set('city', city);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/shops?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const nextShops = Array.isArray(data.shops) ? (data.shops as Shop[]) : [];
      const enriched = nextShops
        .map((shop) => ({
          ...shop,
          distanceMeters:
            Array.isArray(shop.loc) && shop.loc.length === 2
              ? getDistanceMeters(effectiveLat, effectiveLng, shop.loc[0], shop.loc[1])
              : undefined,
        }))
        .sort(
          (a, b) =>
            (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) -
            (b.distanceMeters ?? Number.MAX_SAFE_INTEGER)
        );
      lastFetchCoords.current = { lat: effectiveLat, lng: effectiveLng };
      setShops(enriched);
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, [city, radius]);

  const refetch = useCallback((searchQuery?: string) => fetchShops(searchQuery), [fetchShops]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let watchId: number | null = null;

    const load = async () => {
      setLocationError(null);
      const explicitLat = asNumber(lat);
      const explicitLng = asNumber(lng);

      if (explicitLat !== undefined && explicitLng !== undefined) {
        resolvedLat.current = explicitLat;
        resolvedLng.current = explicitLng;
        setLocationError(null);
        setUserLocation(null);
        setCenterLocation({ lat: explicitLat, lng: explicitLng });
        await fetchShops(query, { lat: explicitLat, lng: explicitLng });
        return;
      }

      const cityInfo = getCityByName(city) ?? getDefaultCity();
      resolvedLat.current = cityInfo.lat;
      resolvedLng.current = cityInfo.lng;
      setUserLocation(null);
      setCenterLocation(null);

      // Immediate fetch with default/selected city coordinates
      void fetchShops(query, { lat: cityInfo.lat, lng: cityInfo.lng });

      if (!autoGps) {
        return;
      }
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationError('Location is not available in this browser. Showing shops near the selected city.');
        return;
      }

      const handleCoords = async (nextLat: number, nextLng: number, forceFetch = false) => {
        if (cancelled) return;

        resolvedLat.current = nextLat;
        resolvedLng.current = nextLng;
        setLocationError(null);
        setUserLocation({ lat: nextLat, lng: nextLng });
        setCenterLocation({ lat: nextLat, lng: nextLng });

        const movedDistance = lastFetchCoords.current
          ? getDistanceMeters(lastFetchCoords.current.lat, lastFetchCoords.current.lng, nextLat, nextLng)
          : Number.POSITIVE_INFINITY;

        if (forceFetch || lastFetchCoords.current === null || movedDistance >= 75) {
          await fetchShops(query, { lat: nextLat, lng: nextLng });
        }
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void handleCoords(pos.coords.latitude, pos.coords.longitude, true);
        },
        (geoError) => {
          if (!cancelled) {
            setLocationError(geoError.code === geoError.PERMISSION_DENIED
              ? 'Location permission was denied. Showing shops near the selected city.'
              : 'Could not get your location. Showing shops near the selected city.');
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 30000,
        }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          void handleCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000,
        }
      );
    };

    void load();

    return () => {
      cancelled = true;
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [autoGps, city, enabled, fetchShops, lat, lng, query]);

  return {
    shops,
    loading,
    error,
    locationError,
    userLocation,
    centerLocation,
    refetch,
  };
}

interface UseShopDetailReturn {
  shop: Shop | null;
  loading: boolean;
  error: string | null;
}

export function useShopDetail(placeId: string | null): UseShopDetailReturn {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/shops/${placeId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setShop(data.shop);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placeId]);

  return { shop, loading, error };
}
