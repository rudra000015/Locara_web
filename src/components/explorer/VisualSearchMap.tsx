'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ShopVisualMatchCluster } from '@/services/shopMatchingService';
import { Store, Sparkles, MapPin, ArrowRight, IndianRupee } from 'lucide-react';

const cartoKeyParam = process.env.NEXT_PUBLIC_CARTO_API_KEY
  ? `?key=${encodeURIComponent(process.env.NEXT_PUBLIC_CARTO_API_KEY)}`
  : '';

// Dynamic import of Leaflet components for SSR safety
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

interface VisualSearchMapProps {
  clusters: ShopVisualMatchCluster[];
  userLocation?: { lat: number; lng: number } | null;
  onSelectShop: (shopId: string) => void;
  onSelectProduct: (shopId: string, productId: string) => void;
}

export default function VisualSearchMap({
  clusters,
  userLocation,
  onSelectShop,
  onSelectProduct,
}: VisualSearchMapProps) {
  const mapRef = useRef<any>(null);

  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : clusters.length > 0
    ? [clusters[0].lat, clusters[0].lng]
    : [28.6515, 77.1906];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((L) => {
      // Fix default Leaflet icon paths in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  const createCustomClusterIcon = (cluster: ShopVisualMatchCluster) => {
    if (typeof window === 'undefined') return undefined;
    const L = require('leaflet');

    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #0E0B08; border: 2px solid #C8893F; border-radius: 16px; padding: 4px 8px; box-shadow: 0 4px 14px rgba(200, 137, 63, 0.4); display: flex; items-center; gap: 4px;">
          <span style="font-family: sans-serif; font-size: 11px; font-weight: 800; color: #E0AF62;">${cluster.highestMatchPercent}%</span>
          <span style="background: #C8893F; color: #0E0B08; font-size: 9px; font-weight: 800; border-radius: 8px; padding: 1px 4px;">${cluster.totalMatches}</span>
        </div>
        <div style="width: 2px; height: 8px; background: #C8893F; margin-top: -1px;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-visual-marker',
      iconSize: [60, 36],
      iconAnchor: [30, 36],
    });
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden border border-[#F6EAD7]/15 shadow-2xl bg-[#17120E]">
      <MapContainer
        center={defaultCenter as [number, number]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="p-1 text-center font-sans text-xs">
                <p className="font-bold text-[#0E0B08]">Your Location</p>
                <p className="text-[10px] text-[#71717A]">Scanning nearby shops</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Clustered Shop Markers */}
        {clusters.map((cluster) => {
          const customIcon = createCustomClusterIcon(cluster);

          return (
            <Marker
              key={cluster.shopId}
              position={[cluster.lat, cluster.lng]}
              icon={customIcon}
            >
              <Popup className="locara-map-popup">
                <div className="p-2 max-w-[240px] bg-[#17120E] text-[#F6EAD7] rounded-xl font-sans space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F6EAD7]/10 pb-1.5">
                    <span className="font-serif font-bold text-xs text-[#F6EAD7] truncate">
                      {cluster.shopName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#E0AF62]">
                      {cluster.highestMatchPercent}% Match
                    </span>
                  </div>

                  <p className="text-[10px] text-[#9E8B75] truncate">
                    {cluster.address} {cluster.distanceText ? `• ${cluster.distanceText}` : ''}
                  </p>

                  {/* Top Matching Products Preview */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {cluster.matchingProducts.slice(0, 2).map((p) => (
                      <div
                        key={p.productId}
                        onClick={() => onSelectProduct(cluster.shopId, p.productId)}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/5 cursor-pointer"
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.productName}
                          className="w-8 h-8 rounded-md object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-[#F6EAD7] truncate">
                            {p.productName}
                          </p>
                          <p className="text-[9px] font-mono text-[#E0AF62]">
                            ₹{p.price} • {p.matchPercent}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectShop(cluster.shopId)}
                    className="w-full py-1.5 rounded-lg bg-[#C8893F] text-[#0E0B08] text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    Open Shop & Reserve <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-2xl bg-[#0E0B08]/90 backdrop-blur-md border border-[#F6EAD7]/15 text-[10px] font-mono font-bold text-[#F6EAD7] shadow-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C8893F]" />
          <span>{clusters.length} Nearby Shops with Matching Styles</span>
        </div>
      </div>
    </div>
  );
}
