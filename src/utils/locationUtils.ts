import { Location } from '@/types/booking.types';

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
};

export const calculateETA = (distance: number): string => {
  const avgSpeed = 20;
  const timeInMinutes = (distance / avgSpeed) * 60;

  if (timeInMinutes < 2) return '1-2 min';
  if (timeInMinutes < 5) return '2-5 min';
  if (timeInMinutes < 10) return '5-10 min';
  if (timeInMinutes < 15) return '10-15 min';
  return '15+ min';
};

export const simulateDriverLocation = (userLat: number, userLng: number): Location => {
  const offset = 0.02;
  return {
    latitude: userLat + (Math.random() - 0.5) * offset,
    longitude: userLng + (Math.random() - 0.5) * offset
  };
};