'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Shop } from '@/types/shop';
import { formatDistance, getGoogleDirectionsUrl } from '@/lib/geo';
import { LocateFixed, ZoomIn, ZoomOut, Navigation, Star, ArrowRight, Store } from 'lucide-react';

interface LeafletShopMapProps {
  shops: Shop[];
  selectedShop: Shop | null;
  onSelectShop: (shop: Shop) => void;
  onNavigateToShop: (shop: Shop) => void;
  userLocation: { lat: number; lng: number } | null;
  centerLocation?: { lat: number; lng: number } | null;
  onRequestUserLocation?: () => void;
  className?: string;
}

export default function LeafletShopMap({
  shops,
  selectedShop,
  onSelectShop,
  onNavigateToShop,
  userLocation,
  centerLocation,
  onRequestUserLocation,
  className = 'w-full h-full min-h-[400px]',
}: LeafletShopMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

      const L = await import('leaflet');
      if (isCancelled || !containerRef.current) return;
      LRef.current = L;

      // Default center: Meerut or centerLocation or userLocation
      const defaultLat = centerLocation?.lat || userLocation?.lat || 28.9845;
      const defaultLng = centerLocation?.lng || userLocation?.lng || 77.7064;

      const map = L.map(containerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // CARTO's public basemap key is a client-side key; restrict it to your site in CARTO.
      const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
      const cartoKeyParam = cartoKey ? `?key=${encodeURIComponent(cartoKey)}` : '';
      L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoKeyParam}`, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://carto.com/attributions">CARTO</a>',
        })
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapRef.current = map;
      setMapLoaded(true);
    }

    void initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
        userMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Center update when centerLocation changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !centerLocation) return;
    mapRef.current.setView([centerLocation.lat, centerLocation.lng], 14, { animate: true });
  }, [centerLocation, mapLoaded]);

  // Render User Location Pin
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapRef.current;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background-color: rgba(37, 99, 235, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
        title: 'Your Location',
      }).addTo(map);

      userMarkerRef.current = marker;
    }
  }, [userLocation, mapLoaded]);

  // Render Shop Markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !markersGroupRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;

    markersGroup.clearLayers();

    if (!shops || shops.length === 0) return;

    const bounds = L.latLngBounds([]);

    shops.forEach((shop) => {
      const lat = shop.loc?.[0];
      const lng = shop.loc?.[1];

      if (!lat || !lng || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const isSelected = selectedShop?.id === shop.id;
      const distanceDisplay = shop.distanceMeters ? formatDistance(shop.distanceMeters) : '';
      const rating = (shop.rating || 4.5).toFixed(1);

      const markerIcon = L.divIcon({
        className: `custom-shop-marker shop-marker-${shop.id}`,
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: ${isSelected ? '#873F17' : '#A85420'};
            color: #ffffff;
            padding: ${isSelected ? '5px 9px' : '4px 7px'};
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
            cursor: pointer;
            white-space: nowrap;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #4ade80;"></span>
            <span style="max-width: 90px; overflow: hidden; text-overflow: ellipsis;">${shop.name}</span>
            <span style="opacity: 0.9; font-size: 10px; font-weight: 600; background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 6px;">★${rating}</span>
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const marker = L.marker([lat, lng], {
        icon: markerIcon,
        zIndexOffset: isSelected ? 500 : 100,
        title: shop.name,
      });

      marker.on('click', () => {
        onSelectShop(shop);
      });

      markersGroup.addLayer(marker);
      bounds.extend([lat, lng]);
    });

    // If selectedShop changes, pan to it
    if (selectedShop?.loc && selectedShop.loc.length === 2) {
      map.panTo([selectedShop.loc[0], selectedShop.loc[1]], { animate: true });
    }
  }, [shops, selectedShop, mapLoaded, onSelectShop]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleMyLocation = () => {
    if (onRequestUserLocation) {
      onRequestUserLocation();
    }
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
  };

  return (
    <div className={`relative ${className} overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F5F4F0]`}>
      {/* The Leaflet DOM container */}
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* My Location Button */}
        <button
          type="button"
          onClick={handleMyLocation}
          title="Center on My Location"
          className="p-2.5 bg-white text-[#171717] hover:text-[#A85420] hover:bg-[#FBF3EE] rounded-lg shadow-md border border-[#E5E5E5] transition-all flex items-center justify-center group"
        >
          <LocateFixed className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white rounded-lg shadow-md border border-[#E5E5E5] overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 text-[#171717] hover:bg-[#F5F4F0] border-b border-[#E5E5E5] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 text-[#171717] hover:bg-[#F5F4F0] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Shop Floating Mini-Card (Bottom popup on the map) */}
      {selectedShop && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[400] bg-white rounded-xl shadow-xl border border-[#E5E5E5] p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-[#F5F4F0] overflow-hidden shrink-0">
              <img
                src={
                  selectedShop.photos?.[0] ||
                  selectedShop.images?.[0] ||
                  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80'
                }
                alt={selectedShop.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-sm text-[#171717] truncate">{selectedShop.name}</h4>
                <span className="text-[11px] font-semibold text-[#16803C] bg-[#EBF8F0] px-1.5 py-0.5 rounded shrink-0">
                  Open
                </span>
              </div>

              <p className="text-xs text-[#666666] capitalize truncate mt-0.5">
                {selectedShop.subcategory || selectedShop.cat}
              </p>

              <div className="flex items-center gap-2 mt-1 text-xs text-[#666666]">
                <div className="flex items-center gap-0.5 font-bold text-[#171717]">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{(selectedShop.rating || 4.6).toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>
                  {selectedShop.distanceMeters
                    ? formatDistance(selectedShop.distanceMeters)
                    : 'Nearby'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => onSelectShop(selectedShop)}
              className="py-1.5 px-3 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <span>View Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateToShop(selectedShop)}
              className="py-1.5 px-3 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border border-[#E5E5E5] transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#A85420]" />
              <span>Directions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
