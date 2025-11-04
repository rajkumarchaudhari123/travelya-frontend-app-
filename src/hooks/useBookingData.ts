import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '@/api/axios';
import { BookingData, DriverInfo, RootStackParamList } from '@/types/booking.types';
import { POLLING_INTERVAL } from '@/utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingScreen'>;

export const useBookingData = (bookingId: string) => {
  const navigation = useNavigation<NavigationProp>();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

 const fetchBooking = async () => {
  try {
    console.log('🔍 Fetching booking:', bookingId);

    const response = await api.get(`/api/bookings/${bookingId}`);
    console.log('✅ Booking API Response:', response.data);

    if (response.data.success) {
      const bookingData = response.data.data;
      setBookingData(bookingData);
      
      // ✅ FIXED: Check if driver is assigned by name or ID
      const isDriverAssigned = bookingData.driverId || bookingData.driverName;
      
      if (!isDriverAssigned) {
        console.log('⏳ No driver assigned yet, waiting for driver...');
      } else {
        console.log('✅ Driver assigned:', bookingData.driverName || 'Unknown driver');
      }
    } else {
      console.log('❌ Booking not found in response');
      Alert.alert('Error', 'Booking not found');
      navigation.navigate('DestinationSearch');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.log('❌ Fetch booking error:', errorMessage);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;

    const initializePolling = () => {
      fetchBooking();
      pollInterval = setInterval(fetchBooking, POLLING_INTERVAL);
    };

    initializePolling();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bookingId]);

  return { bookingData, loading, fetchBooking };
};