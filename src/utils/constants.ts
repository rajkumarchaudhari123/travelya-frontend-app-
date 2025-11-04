import { Dimensions } from 'react-native';

// ==================== COMMON CONSTANTS ====================
export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LOCATIONIQ_KEY = 'pk.4e99c2bb6538458479e6e356415d31cf';
export const RATE_PER_KM = 20;

// ==================== DRIVER NOTIFICATION CONSTANTS ====================
export const NOTIFICATION_TIMEOUT = 15;
export const POLLING_INTERVAL = 5000;
export const DRIVER_TRACKING_INTERVAL = 5000;
export const TRACKING_INTERVAL = 5000;
export const VIBRATION_PATTERN = [0, 500, 200, 500] as number[];

// ==================== BOOKING SCREEN CONSTANTS ====================
export const BOOKING_POLLING_INTERVAL = 3000;
export const INITIAL_ETA = '5-10 min';

// ==================== VEHICLE CONSTANTS ====================
export const VEHICLE_ICONS: { [key: string]: string } = {
  'auto': 'bicycle',
  'mini car': 'car-sport',
  'sedan': 'car',
  'suv': 'car-sport',
  '7-seater': 'people',
  'default': 'car'
};

export const VEHICLE_COLORS: { [key: string]: string } = {
  'auto': 'text-red-500',
  'mini car': 'text-blue-500',
  'sedan': 'text-green-500',
  'suv': 'text-yellow-500',
  '7-seater': 'text-purple-500',
  'default': 'text-gray-500'
};

export const VEHICLE_MULTIPLIERS: { [key: string]: number } = {
  'Auto': 0.7,
  'Mini Car': 0.9,
  'Sedan': 1,
  'SUV': 1.2,
  '7-Seater': 1.5
};

export const INITIAL_VEHICLES = [
  { 
    id: '1', 
    name: 'Auto', 
    icon: 'bicycle', 
    price: 0, 
    seats: '3 Seats', 
    time: '5-10 min', 
    color: '#EF4444', 
    selected: false 
  },
  { 
    id: '2', 
    name: 'Mini Car', 
    icon: 'car-sport', 
    price: 0, 
    seats: '4 Seats', 
    time: '5-10 min', 
    color: '#3B82F6', 
    selected: false 
  },
  { 
    id: '3', 
    name: 'Sedan', 
    icon: 'car', 
    price: 0, 
    seats: '4 Seats', 
    time: '5-10 min', 
    color: '#10B981', 
    selected: false 
  },
  { 
    id: '4', 
    name: 'SUV', 
    icon: 'car-sport', 
    price: 0, 
    seats: '6 Seats', 
    time: '5-10 min', 
    color: '#F59E0B', 
    selected: false 
  },
  { 
    id: '5', 
    name: '7-Seater', 
    icon: 'people', 
    price: 0, 
    seats: '7 Seats', 
    time: '5-10 min', 
    color: '#8B5CF6', 
    selected: false 
  }
];

// ==================== STATUS CONSTANTS ====================
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  DRIVER_ASSIGNED: 'driver_assigned',
  ARRIVING: 'arriving',
  ONGOING: 'ongoing',
  COMPLETED: 'completed'
} as const;

export const STATUS_COLORS: { [key: string]: string } = {
  'confirmed': 'bg-green-500',
  'driver_assigned': 'bg-blue-500',
  'arriving': 'bg-yellow-500',
  'ongoing': 'bg-purple-500',
  'completed': 'bg-gray-500'
};

export const STATUS_TEXTS: { [key: string]: string } = {
  'confirmed': 'Looking for Driver',
  'driver_assigned': 'Driver Assigned',
  'arriving': 'Driver Arriving',
  'ongoing': 'Trip Ongoing',
  'completed': 'Trip Completed'
};

// ==================== API ENDPOINTS ====================
export const API_ENDPOINTS = {
  // Driver Endpoints
  DRIVER_NOTIFICATIONS: {
    PENDING_RIDES: '/api/driver-notifications/pending-rides',
    ACCEPT_RIDE: '/api/driver-notifications/accept-ride'
  },
  
  // Booking Endpoints
  BOOKINGS: {
    GET_BOOKING: '/api/bookings',
    CANCEL_BOOKING: '/api/bookings/cancel'
  },
  
  // Destination Search Endpoints
  DESTINATION_SEARCH: {
    SEARCH: '/api/destination-search/search',
    CALCULATE_FARE: '/api/destination-search/calculate-fare',
    BOOK_RIDE: '/api/destination-search/book-ride'
  }
};

// ==================== RESPONSIVE BREAKPOINTS ====================
export const BREAKPOINTS = {
  SMALL: 375,
  LARGE: 414
};

// ==================== COLORS ====================
export const COLORS = {
  PRIMARY: '#10B981',
  PRIMARY_DARK: '#059669',
  SECONDARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6'
};