// types/booking.types.ts - Complete Update

export type RootStackParamList = {
  DestinationSearch: undefined;
  BookingScreen: {
    bookingId: string;
  };
};

export type BookingStatus = 'confirmed' | 'driver_assigned' | 'arriving' | 'ongoing' | 'completed' | 'otp_verified';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  rating: string;
  fullName?: string;
  email?: string;
}

export interface BookingData {
  id: string;
  vehicleType: string;
  fromLocation: string;
  toLocation: string;
  price: number;
  distance: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driver?: DriverInfo;
  status: string;
  
  // ✅ ADD THESE CUSTOMER FIELDS
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerRating?: string;
  
  // ✅ ADD LOCATION COORDINATES (if needed)
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  
  // ✅ ADD OTP INFO (if needed)
  otpCode?: string;
  otpVerified?: boolean;
  otpExpiresAt?: string;
}