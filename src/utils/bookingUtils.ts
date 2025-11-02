import { BookingStatus } from '@/types/booking.types';
import { VEHICLE_COLORS, VEHICLE_ICONS } from './constants';

export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'confirmed': return 'bg-green-500';
    case 'driver_assigned': return 'bg-blue-500';
    case 'arriving': return 'bg-yellow-500';
    case 'ongoing': return 'bg-purple-500';
    case 'completed': return 'bg-gray-500';
    default: return 'bg-green-500';
  }
};

export const getStatusText = (status: BookingStatus): string => {
  switch (status) {
    case 'confirmed': return 'Looking for Driver';
    case 'driver_assigned': return 'Driver Assigned';
    case 'arriving': return 'Driver Arriving';
    case 'ongoing': return 'Trip Ongoing';
    case 'completed': return 'Trip Completed';
    default: return 'Looking for Driver';
  }
};

export const getVehicleIcon = (type: string): string => {
  const normalizedType = type?.toLowerCase();
  return VEHICLE_ICONS[normalizedType] || VEHICLE_ICONS.default;
};

export const getVehicleColor = (type: string): string => {
  const normalizedType = type?.toLowerCase();
  return VEHICLE_COLORS[normalizedType] || VEHICLE_COLORS.default;
};