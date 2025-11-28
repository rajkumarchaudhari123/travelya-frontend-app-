// hooks/useRideRequests.ts - NOW ERROR-FREE

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '@/api/axios';
import { RideRequest, DriverData, RootStackParamList } from '@/types/navigation.types';
import { POLLING_INTERVAL } from '@/utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverDashboard'>;

export const useRideRequests = (
    isOnline: boolean,
    currentDriver: DriverData | null,
    notificationVisible: boolean,
    showNotification: () => void,
    hideNotification: () => void
) => {
    const navigation = useNavigation<NavigationProp>();
    const [currentRideRequest, setCurrentRideRequest] = useState<RideRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [accepting, setAccepting] = useState(false);

    const fetchRideRequests = async () => {
        if (!isOnline || !currentDriver || notificationVisible) return;

        try {
            setLoading(true);
            const response = await api.get(
                `/api/driver-notifications/pending-rides?driverId=${currentDriver.id}`
            );

            if (response.data?.success && response.data.data?.length > 0 && !notificationVisible) {
                const ride = response.data.data[0];
                const rideRequest: RideRequest = {
                    bookingId: ride.bookingId || ride.id || '',
                    fromLocation: ride.fromLocation || 'Unknown location',
                    toLocation: ride.toLocation || 'Unknown location',
                    price: ride.price || 0,
                    distance: ride.distance || 0,
                    vehicleType: ride.vehicleType || 'Standard',
                    customerName: ride.customerName || 'Customer',
                    customerPhone: ride.customerPhone || 'Not provided',
                    customerRating: ride.customerRating || 4.5,
                    timestamp: ride.timestamp || new Date().toISOString(),
                    driverId: currentDriver.id, // ✅ Add driverId to ride request
                };

                setCurrentRideRequest(rideRequest);
                showNotification();
            }
        } catch (error) {
            console.log('No pending rides available');
        } finally {
            setLoading(false);
        }
    };



// ✅ AUTOMATIC OTP GENERATION WHEN DRIVER ACCEPTS RIDE
// hooks/useRideRequests.ts - Update the generateOTPForRide function

const generateOTPForRide = async (bookingId: string, driverId: string) => {
  try {
    console.log('🔐 [OTP GENERATE] Starting OTP generation...', {
      bookingId,
      driverId
    });
    
    const response = await api.post('/api/otp/generate', {
      bookingId,
      driverId
    });

    console.log('🔐 [OTP GENERATE] API Response:', response.data);

    if (response.data.success) {
      console.log('✅ [OTP GENERATE] OTP generated successfully');
      return true;
    } else {
      console.log('❌ [OTP GENERATE] OTP generation failed:', response.data.message);
      return false;
    }
  } catch (error: any) {
    console.error('❌ [OTP GENERATE] API Call Failed:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
};

const handleAccept = async () => {
  if (!currentRideRequest || !currentDriver) {
    Alert.alert('Error', 'Driver not registered.');
    return;
  }

  setAccepting(true);

  try {
    console.log('🚗 [RIDE ACCEPT] Starting ride acceptance...', {
      bookingId: currentRideRequest.bookingId,
      driverId: currentDriver.id
    });

    // Step 1: Accept the ride
    const acceptResponse = await api.post('/api/driver-notifications/accept-ride', {
      bookingId: currentRideRequest.bookingId,
      driverId: currentDriver.id,
      driverName: currentDriver.fullName,
      driverPhone: currentDriver.phone,
      vehicleNumber: currentDriver.vehicleNumber,
      status: 'accepted',
    });

    console.log('🚗 [RIDE ACCEPT] Ride accept response:', acceptResponse.data);

    if (acceptResponse.data?.success) {
      console.log('✅ [RIDE ACCEPT] Ride accepted successfully, now generating OTP...');
      
      // ✅ Step 2: Automatically generate OTP
      const otpGenerated = await generateOTPForRide(
        currentRideRequest.bookingId, 
        currentDriver.id
      );

      console.log('🔐 [RIDE ACCEPT] OTP Generation Result:', otpGenerated);

      if (otpGenerated) {
        console.log('🎉 [RIDE ACCEPT] Ride accepted with OTP successfully');
        Alert.alert('Success', 'Ride accepted! OTP has been sent to the rider.', [
          {
            text: 'OK',
            onPress: () => {
              hideNotification();
              navigation.navigate('DriverRideInProgress', {
                bookingId: currentRideRequest.bookingId,
                fromLocation: currentRideRequest.fromLocation,
                toLocation: currentRideRequest.toLocation,
                price: currentRideRequest.price.toString(),
                distance: currentRideRequest.distance.toString(),
                customerName: currentRideRequest.customerName,
                customerPhone: currentRideRequest.customerPhone,
                driverId: currentDriver.id,
              });
            }
          }
        ]);
      } else {
        console.log('⚠️ [RIDE ACCEPT] Ride accepted but OTP generation failed');
        Alert.alert(
          'Ride Accepted', 
          'Ride accepted successfully! However, OTP generation failed. You can generate OTP manually from the ride screen.',
          [
            {
              text: 'Continue to Ride',
              onPress: () => {
                hideNotification();
                navigation.navigate('DriverRideInProgress', {
                  bookingId: currentRideRequest.bookingId,
                  fromLocation: currentRideRequest.fromLocation,
                  toLocation: currentRideRequest.toLocation,
                  price: currentRideRequest.price.toString(),
                  distance: currentRideRequest.distance.toString(),
                  customerName: currentRideRequest.customerName,
                  customerPhone: currentRideRequest.customerPhone,
                  driverId: currentDriver.id,
                });
              }
            }
          ]
        );
      }
    } else {
      console.log('❌ [RIDE ACCEPT] Ride accept API failed:', acceptResponse.data?.message);
      throw new Error(acceptResponse.data?.message || 'Failed to accept ride');
    }
  } catch (error: any) {
    console.error('❌ [RIDE ACCEPT] Overall error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    Alert.alert('Error', error.response?.data?.message || 'Failed to accept ride.');
    setAccepting(false);
  }
};

    const handleDecline = async () => {
        if (!currentRideRequest || !currentDriver) return;

        try {
            await api.post('/api/driver-notifications/accept-ride', {
                bookingId: currentRideRequest.bookingId,
                driverId: currentDriver.id,
                status: 'declined',
            });
        } catch (error) {
            console.log('Error declining ride');
        }
        hideNotification();
        setCurrentRideRequest(null);
        setAccepting(false);
    };

    useEffect(() => {
        let interval: number;

        if (isOnline && currentDriver) {
            interval = setInterval(fetchRideRequests, POLLING_INTERVAL) as unknown as number;
            fetchRideRequests();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOnline, notificationVisible, currentDriver]);

    return {
        currentRideRequest,
        loading,
        accepting,
        handleAccept,
        handleDecline,
        fetchRideRequests
    };
};