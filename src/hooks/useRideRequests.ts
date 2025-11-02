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

    const handleAccept = async () => {
        if (!currentRideRequest || !currentDriver) {
            Alert.alert('Error', 'Driver not registered.');
            return;
        }

        setAccepting(true);

        try {
            const response = await api.post('/api/driver-notifications/accept-ride', {
                bookingId: currentRideRequest.bookingId,
                driverId: currentDriver.id,
                driverName: currentDriver.fullName,
                driverPhone: currentDriver.phone,
                vehicleNumber: currentDriver.vehicleNumber,
                status: 'accepted',
            });

            if (response.data?.success) {
                Alert.alert('Success', 'Ride accepted successfully!', [
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
                            });
                        }
                    }
                ]);
            } else {
                throw new Error(response.data?.message || 'Failed to accept ride');
            }
        } catch (error: any) {
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