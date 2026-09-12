'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Shop } from '@/types/shop';
import { formatDistanceMeters, estimateTravelMinutes } from '@/lib/geo';
import { getCityByName, getDefaultCity } from '@/lib/cities';
import { CATEGORIES } from '@/data/categories';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getAllSeedShops } from '@/lib/shopMapper';
import { SHOPS } from '@/data/shops';
import {
  Navigation,
  Star,
  Clock,
  MapPin,
  Store,
  Search,
  ChevronRight,
  Compass,
  Crosshair,
  SlidersHorizontal,
  ChevronUp,
  Sparkles,
  ShoppingBag,
  Camera,
  Layers,
} from 'lucide-react';
import VisualSearchModal from './VisualSearchModal';

interface Props {
  city: string;
  query?: string;
  shops: Shop[];
  loading: boolean;
  error: string | null;
  userLocation: { lat: number; lng: number } | null;
  onRefetch: (q?: string) => Promise<void>;
  onStartNavigation: (shop: Shop) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  sweets: '🍬',
  food: '🍲',
  fashion: '👗',
  jewellery: '💎',
  electronics: '⚡',
  hardware: '🛠️',
  grocery: '🛒',
  pharmacy: '💊',
  general: '🏛️',
};

export default function MapPage({
  city,
  query,
  shops,
  loading,
  error,
  userLocation,
  onRefetch,
  onStartNavigation,
}: Props) {
  const router = useRouter();
  const { openShop } = useStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersByShopId = useRef<Map<string, any>>(new Map());

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('half');
  const [showVisualSearch, setShowVisualSearch] = useState(false);

  // Guarantee we always have shops to display
  const effectiveBaseShops = useMemo(() => {
    if (shops && shops.length > 0) return shops;
    const all = [...getAllSeedShops(), ...SHOPS];
    if (city) {
      const cityLower = city.toLowerCase();
      const filtered = all.filter((s) => s.addr.toLowerCase().includes(cityLower));
      if (filtered.length > 0) return filtered;
    }
    return all;
  }, [city, shops]);

  const effectiveQuery = (searchQuery || query || '').trim().toLowerCase();
  const filteredShops = useMemo(
    () =>
      effectiveBaseShops.filter((shop) => {
        const matchesCategory = activeCategory === 'all' || shop.cat === activeCategory;
        if (!matchesCategory) return false;
        if (!effectiveQuery) return true;

        const haystack = [
          shop.name,
          shop.addr,
          shop.cat,
          shop.story ?? '',
          ...(shop.products ?? []).map((product) => product.name),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(effectiveQuery);
      }),
    [activeCategory, effectiveBaseShops, effectiveQuery]
  );

  // Initialize Leaflet map once on mount
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (cancelled || !mapRef.current) return;
        leafletRef.current = L;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const cityObj = getCityByName(city) ?? getDefaultCity();
        const center = userLocation || { lat: cityObj.lat, lng: cityObj.lng };

        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: 13,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB & OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        // Trigger initial marker population and resize
        setTimeout(() => {
          if (!cancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      } catch (err) {
        console.error('[MapPage] Leaflet init error:', err);
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const cityObj = getCityByName(city) ?? getDefaultCity();
    const target = userLocation || { lat: cityObj.lat, lng: cityObj.lng };
    map.setView([target.lat, target.lng], 13, { animate: true });
  }, [city]);

  // Update user location pin
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-gps-pulse-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #3B82F6; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current.bindTooltip('Your Current Location', {
        direction: 'top',
        offset: [0, -10],
        className: 'user-location-tooltip',
      });
    }
  }, [userLocation]);

  // Render shop markers with interactive popup cards
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const layer = markerLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    markersByShopId.current.clear();

    const validBounds: [number, number][] = [];

    filteredShops.forEach((shop) => {
      if (!shop.loc || shop.loc.length !== 2) return;
      const [lat, lng] = shop.loc;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      validBounds.push([lat, lng]);
      const isSelected = selectedShop?.id === shop.id;
      const catIcon = CATEGORY_ICONS[shop.cat] || '🏛️';
      const photo = shop.photos?.[0] || shop.images?.[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80';

      const icon = L.divIcon({
        className: 'custom-shop-marker',
        html: `
          <div style="
            width: ${isSelected ? '44px' : '36px'};
            height: ${isSelected ? '44px' : '36px'};
            border-radius: 9999px;
            background: ${isSelected ? '#C8893F' : '#17120E'};
            border: 2px solid ${isSelected ? '#FFFFFF' : '#C8893F'};
            color: ${isSelected ? '#0E0B08' : '#F6EAD7'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '18px' : '14px'};
            box-shadow: 0 0 ${isSelected ? '22px rgba(200,137,63,0.95)' : '10px rgba(0,0,0,0.6)'};
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
          ">${catIcon}</div>
        `,
        iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(layer);
      markersByShopId.current.set(shop.id, marker);

      const popupHtml = `
        <div style="width: 220px; font-family: system-ui, -apple-system, sans-serif; padding: 2px; color: #F6EAD7;">
          <div style="position: relative; width: 100%; height: 95px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #0E0B08;">
            <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" alt="${shop.name}" />
            <span style="position: absolute; top: 6px; right: 6px; background: rgba(23,18,14,0.85); backdrop-filter: blur(4px); border: 1px solid rgba(200,137,63,0.3); border-radius: 6px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #E0AF62;">
              ⭐ ${shop.rating.toFixed(1)}
            </span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #F6EAD7; line-height: 1.2; margin-bottom: 2px;">${shop.name}</div>
          <div style="font-size: 11px; color: #9E8B75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px;">${shop.addr}</div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-view-shop-${shop.id}" style="flex: 1; padding: 6px 0; background: #C8893F; color: #0E0B08; font-size: 11px; font-weight: 800; border-radius: 8px; border: none; cursor: pointer; text-align: center;">
              View Shop
            </button>
            <button id="btn-nav-shop-${shop.id}" style="padding: 6px 10px; background: #211A14; color: #E0AF62; border: 1px solid rgba(246,234,215,0.15); font-size: 11px; font-weight: 700; border-radius: 8px; cursor: pointer;">
              🧭
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'luxury-map-popup',
        maxWidth: 240,
        offset: [0, -12],
      });

      marker.on('popupopen', () => {
        setSelectedShop(shop);
        setTimeout(() => {
          const btnView = document.getElementById(`btn-view-shop-${shop.id}`);
          if (btnView) {
            btnView.onclick = () => {
              openShop(shop.id);
              router.push(`/explorer/shop/${shop.id}`);
            };
          }
          const btnNav = document.getElementById(`btn-nav-shop-${shop.id}`);
          if (btnNav) {
            btnNav.onclick = () => {
              onStartNavigation(shop);
            };
          }
        }, 50);
      });

      marker.on('click', () => {
        setSelectedShop(shop);
        setSheetState('half');
      });
    });

    // Auto fit bounds if shops are present
    if (validBounds.length > 0) {
      if (userLocation) {
        validBounds.push([userLocation.lat, userLocation.lng]);
      }
      try {
        const bounds = L.latLngBounds(validBounds);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
            animate: true,
          });
        }
      } catch {}
    }
  }, [filteredShops, onStartNavigation, openShop, router, selectedShop?.id, userLocation]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map) return;

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
      return;
    }

    if (filteredShops.length > 0 && L) {
      const coords = filteredShops.map((s) => s.loc).filter((loc) => Array.isArray(loc) && loc.length === 2);
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
          return;
        }
      }
    }

    const cityObj = getCityByName(city) ?? getDefaultCity();
    map.setView([cityObj.lat, cityObj.lng], 13, { animate: true });
  };

  const handleSelectShopCard = (shop: Shop) => {
    setSelectedShop(shop);
    const map = mapInstanceRef.current;
    if (map && shop.loc) {
      map.setView(shop.loc, 15, { animate: true });
      const marker = markersByShopId.current.get(shop.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="relative h-[calc(100vh-140px)] min-h-[560px] rounded-3xl overflow-hidden border border-[#F6EAD7]/10 shadow-2xl bg-[#0E0B08] flex flex-col lg:flex-row">
      {/* ── DESKTOP & MOBILE MAP CONTAINER ── */}
      <div className="relative flex-1 h-full min-h-[300px]">
        {/* Floating Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 max-w-md pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#17120E]/92 backdrop-blur-2xl border border-[#F6EAD7]/10 shadow-lg">
            <Search className="w-4 h-4 text-[#C8893F] ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search products, shops in ${city}...`}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#F6EAD7] placeholder-[#9E8B75] outline-none font-medium px-2 py-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#9E8B75] hover:text-[#F6EAD7] px-2 text-xs"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowVisualSearch(true)}
              className="p-1.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] text-[#C8893F] transition-colors cursor-pointer shrink-0"
              title="Visual Search on Map"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Category Chips */}
          <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#C8893F] text-[#0E0B08] shadow-glow-sm'
                  : 'bg-[#17120E]/90 backdrop-blur-md text-[#D8C4A7] border border-[#F6EAD7]/10 hover:text-white'
              }`}
            >
              All ({effectiveBaseShops.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#C8893F] text-[#0E0B08] shadow-glow-sm'
                    : 'bg-[#17120E]/90 backdrop-blur-md text-[#D8C4A7] border border-[#F6EAD7]/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recenter Location Button */}
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="absolute bottom-6 right-4 z-20 w-11 h-11 rounded-2xl bg-[#17120E]/90 backdrop-blur-md border border-[#F6EAD7]/15 flex items-center justify-center text-[#E0AF62] hover:bg-[#211A14] shadow-lg cursor-pointer transition-all"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* Map Canvas */}
        <div ref={mapRef} className="w-full h-full bg-[#0E0B08]" />
      </div>

      {/* ── DESKTOP DISCOVERY PANEL / MOBILE BOTTOM SHEET ── */}
      <div
        className={`w-full lg:w-96 bg-[#17120E] border-t lg:border-t-0 lg:border-l border-[#F6EAD7]/10 flex flex-col z-20 transition-all duration-300 ${
          sheetState === 'collapsed'
            ? 'h-16 lg:h-full'
            : sheetState === 'full'
            ? 'h-[80%] lg:h-full'
            : 'h-[45%] lg:h-full'
        }`}
      >
        {/* Panel Header & Mobile Drawer Handle */}
        <div
          onClick={() => setSheetState(sheetState === 'collapsed' ? 'half' : sheetState === 'half' ? 'full' : 'half')}
          className="p-4 border-b border-[#F6EAD7]/10 flex items-center justify-between cursor-pointer select-none"
        >
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              MAP DISCOVERY
            </span>
            <h3 className="font-serif font-bold text-base text-[#F6EAD7]">
              {filteredShops.length} Stores in {city}
            </h3>
          </div>

          <div className="lg:hidden flex items-center gap-1 text-xs text-[#9E8B75]">
            <ChevronUp className={`w-4 h-4 transition-transform ${sheetState === 'full' ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Selected Shop Preview Card (if one selected) */}
        {selectedShop ? (
          <div className="p-4 border-b border-[#F6EAD7]/10 bg-[#211A14]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {selectedShop.photos?.[0] || selectedShop.images?.[0] ? (
                  <img
                    src={selectedShop.photos?.[0] || selectedShop.images?.[0]}
                    alt={selectedShop.name}
                    className="w-14 h-14 rounded-2xl object-cover bg-[#17120E] border border-[#F6EAD7]/10 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#261D16] flex items-center justify-center text-xl shrink-0">
                    🏛️
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-sm text-[#F6EAD7] truncate max-w-[170px]">{selectedShop.name}</h4>
                  <p className="text-[11px] text-[#9E8B75] truncate max-w-[170px]">{selectedShop.addr}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs font-bold text-[#E0AF62]">⭐ {selectedShop.rating.toFixed(1)}</p>
                    {selectedShop.distanceMeters !== undefined && (
                      <span className="text-[10px] text-[#D8C4A7]">
                        • {formatDistanceMeters(selectedShop.distanceMeters)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-[#9E8B75] hover:text-[#F6EAD7] text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  openShop(selectedShop.id);
                  router.push(`/explorer/shop/${selectedShop.id}`);
                }}
                className="flex-1 py-2 rounded-xl bg-[#17120E] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#F6EAD7] text-center transition-colors"
              >
                View Shop
              </button>
              <button
                onClick={() => onStartNavigation(selectedShop)}
                className="flex-1 py-2 rounded-xl bg-[#C8893F] hover:bg-[#E0AF62] text-xs font-bold text-[#0E0B08] text-center shadow-glow-sm transition-colors"
              >
                Navigate
              </button>
            </div>
          </div>
        ) : null}

        {/* Discovery List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {filteredShops.map((shop) => {
            const photo = shop.photos?.[0] || shop.images?.[0];
            const isSelected = selectedShop?.id === shop.id;

            return (
              <div
                key={shop.id}
                onClick={() => handleSelectShopCard(shop)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#211A14] border-[#C8893F] shadow-glow-sm'
                    : 'bg-[#17120E] border-[#F6EAD7]/5 hover:border-[#F6EAD7]/15 hover:bg-[#211A14]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {photo ? (
                    <img
                      src={photo}
                      alt={shop.name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#261D16] shrink-0 border border-[#F6EAD7]/5"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#261D16] flex items-center justify-center text-lg shrink-0">
                      🏛️
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-xs text-[#F6EAD7] truncate">{shop.name}</h4>
                      <span className="text-[10px] font-bold text-[#E0AF62] ml-1 shrink-0">⭐ {shop.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-[10px] text-[#9E8B75] truncate mt-0.5">{shop.addr.split(',')[0]}</p>
                    <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-[#D8C4A7]">
                      <span className="uppercase">{shop.age} Yrs Heritage</span>
                      {shop.distanceMeters !== undefined && (
                        <span className="text-[#C8893F] font-bold">{formatDistanceMeters(shop.distanceMeters)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <VisualSearchModal
        open={showVisualSearch}
        onOpenChange={setShowVisualSearch}
        userLocation={userLocation}
      />
    </div>
  );
}

