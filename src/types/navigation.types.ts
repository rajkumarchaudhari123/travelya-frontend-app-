// types/navigation.types.ts - UPDATED VERSION

export type RootStackParamList = {
    DriverDashboard: undefined;
    DriverRideInProgress: {
        bookingId: string;
        fromLocation: string;
        toLocation: string;
        price: string;
        distance: string;
        customerName: string;
        customerPhone: string;
        driverId: string; // ✅ ADD THIS LINE
    };
    DriverNotification: {
        driverData?: {
            id: string;
            fullName: string;
            phone: string;
            vehicleNumber: string;
        };
    };
};

export interface RideRequest {
    bookingId: string;
    fromLocation: string;
    toLocation: string;
    price: number;
    distance: number;
    vehicleType: string;
    customerName: string;
    customerPhone: string;
    customerRating: number;
    timestamp: string;
    driverId: string; // ✅ This is already here - good!
}

export interface DriverData {
    id: string;
    fullName: string;
    phone: string;
    vehicleNumber: string;
}