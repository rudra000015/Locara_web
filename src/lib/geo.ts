export function getDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function formatDistanceMeters(distanceMeters?: number | null): string {
  if (typeof distanceMeters !== 'number' || !Number.isFinite(distanceMeters)) {
    return 'Nearby';
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m away`;
  }

  return `${(distanceMeters / 1000).toFixed(distanceMeters < 10000 ? 1 : 0)} km away`;
}

export function estimateTravelMinutes(distanceMeters?: number | null): string {
  if (typeof distanceMeters !== 'number' || !Number.isFinite(distanceMeters)) {
    return '~15 min';
  }

  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80));
  return `~${walkingMinutes} min`;
}
