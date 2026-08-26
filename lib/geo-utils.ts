import type { ChannelPartner } from '@/types';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Sorts channel partners by proximity to a given user coordinate.
 */
export function sortPartnersByDistance(
  partners: ChannelPartner[],
  userLat: number,
  userLng: number
): (ChannelPartner & { distanceKm: number })[] {
  return partners
    .map((partner) => {
      const distanceKm = calculateHaversineDistanceKm(userLat, userLng, partner.lat, partner.lng);
      return {
        ...partner,
        distanceKm,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Formats distance into a clean string (e.g. "3.4 km" or "850 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
