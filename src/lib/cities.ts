export interface CityOption {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export const CITY_OPTIONS: CityOption[] = [
  { name: 'Meerut', state: 'Uttar Pradesh', country: 'India', lat: 28.9845, lng: 77.7064 },
  { name: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { name: 'Noida', state: 'Uttar Pradesh', country: 'India', lat: 28.5355, lng: 77.3910 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', lat: 28.6692, lng: 77.4538 },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 },
];

export function getCityByName(name?: string | null): CityOption | null {
  if (!name) return null;
  const target = name.trim().toLowerCase();
  return CITY_OPTIONS.find((city) => city.name.toLowerCase() === target) ?? null;
}

export function getDefaultCity(): CityOption {
  return CITY_OPTIONS[0];
}
