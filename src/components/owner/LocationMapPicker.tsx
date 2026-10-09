'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { LocateFixed, Search } from 'lucide-react';
import { loadGoogleMapsApi } from '@/lib/googleMapsBrowser';

export default function LocationMapPicker({
  latitude,
  longitude,
  onSelect,
}: {
  latitude: number;
  longitude: number;
  onSelect: (lat: number, lng: number, address?: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const coordinatesRef = useRef({ latitude, longitude });
  const onSelectRef = useRef(onSelect);
  coordinatesRef.current = { latitude, longitude };
  onSelectRef.current = onSelect;
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void loadGoogleMapsApi().then((maps) => {
      if (cancelled || !mapElementRef.current || mapRef.current) return;
      const initialPoint = { lat: coordinatesRef.current.latitude, lng: coordinatesRef.current.longitude };
      const map = new maps.Map(mapElementRef.current, {
        center: initialPoint,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;
      markerRef.current = new maps.Marker({ map, position: initialPoint, draggable: true, title: 'Shop location' });
      map.addListener('click', (event: any) => {
        const point = event.latLng;
        if (!point) return;
        const lat = point.lat();
        const lng = point.lng();
        markerRef.current?.setPosition(point);
        const geocoder = new maps.Geocoder();
        void geocoder.geocode({ location: point }).then((result: any) => {
          const address = result.results?.[0]?.formatted_address;
          onSelectRef.current(lat, lng, address);
        }).catch(() => onSelectRef.current(lat, lng));
      });
      markerRef.current.addListener('dragend', (event: any) => {
        const point = event.latLng;
        if (!point) return;
        const geocoder = new maps.Geocoder();
        void geocoder.geocode({ location: point }).then((result: any) => {
          onSelectRef.current(point.lat(), point.lng(), result.results?.[0]?.formatted_address);
        }).catch(() => onSelectRef.current(point.lat(), point.lng()));
      });
    }).catch((loadError: any) => {
      if (!cancelled) setError(loadError?.message || 'Google Maps could not be loaded.');
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const point = { lat: latitude, lng: longitude };
    map.setCenter(point);
    marker.setPosition(point);
  }, [latitude, longitude]);

  const searchLocation = async (event: FormEvent) => {
    event.preventDefault();
    if (!locationQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const maps = await loadGoogleMapsApi();
      const result = await new maps.Geocoder().geocode({ address: locationQuery.trim() });
      const match = result.results?.[0];
      const point = match?.geometry?.location;
      if (!point || !mapRef.current) throw new Error('No matching location found. Try another address.');
      const lat = point.lat();
      const lng = point.lng();
      mapRef.current.setCenter(point);
      mapRef.current.setZoom(16);
      markerRef.current?.setPosition(point);
      onSelectRef.current(lat, lng, match.formatted_address);
    } catch (searchError: any) {
      setError(searchError?.message || 'Location search failed. Check Maps API access and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <form onSubmit={searchLocation} className="flex gap-2 bg-[#181818] p-2">
        <Search className="ml-1 mt-2.5 h-4 w-4 shrink-0 text-[#C9A96E]" />
        <input
          value={locationQuery}
          onChange={(event) => setLocationQuery(event.target.value)}
          placeholder="Search the shop address or area"
          aria-label="Search shop location"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs text-[#F5F5F5] outline-none placeholder:text-[#71717A]"
        />
        <button type="submit" disabled={loading || !locationQuery.trim()} className="rounded-lg bg-[#C9A96E]/15 px-3 text-xs font-bold text-[#C9A96E] disabled:opacity-50">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      <div ref={mapElementRef} className="h-64 w-full bg-[#181818]" />
      <p className="bg-[#181818] px-3 py-2 text-[10px] text-[#9E8B75]">Search for an address or click the Google map to pin the shop. Coordinates and a matched address update automatically.</p>
      {error && <p role="status" className="bg-[#181818] px-3 pb-3 text-[10px] text-rose-400">{error}</p>}
      <div className="flex items-center gap-2 bg-[#181818] px-3 pb-3 text-[10px] text-[#C9A96E]"><LocateFixed className="h-3.5 w-3.5" />{latitude.toFixed(5)}, {longitude.toFixed(5)}</div>
    </div>
  );
}
