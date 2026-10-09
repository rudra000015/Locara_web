let mapsApiPromise: Promise<any> | null = null;

export function loadGoogleMapsApi(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Maps are only available in a browser.'));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);
  if (mapsApiPromise) return mapsApiPromise;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error('Google Maps is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local.'));

  mapsApiPromise = new Promise((resolve, reject) => {
    const callbackName = '__locaraGoogleMapsReady';
    const previousCallback = (window as any)[callbackName];
    (window as any)[callbackName] = () => {
      if (typeof previousCallback === 'function') previousCallback();
      resolve((window as any).google.maps);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      mapsApiPromise = null;
      reject(new Error('Google Maps failed to load. Check the key and enable Maps JavaScript API and Geocoding API.'));
    };
    document.head.appendChild(script);
    window.setTimeout(() => {
      if (!(window as any).google?.maps) {
        mapsApiPromise = null;
        reject(new Error('Google Maps did not finish loading. Check the key, allowed website origins, billing, and enabled APIs.'));
      }
    }, 12000);
  });

  return mapsApiPromise;
}
