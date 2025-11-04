export type RootStackParamList = {
  DestinationSearch: undefined;
  BookingScreen: {
    bookingId: string;
  };
};

export type BookingStatus = 'confirmed' | 'driver_assigned' | 'arriving' | 'ongoing' | 'completed';

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
}