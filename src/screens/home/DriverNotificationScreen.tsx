import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, Animated, Vibration, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/axios';

type RootStackParamList = {
    DriverDashboard: undefined;
    DriverRideInProgress: {
        bookingId: string;
        fromLocation: string;
        toLocation: string;
        price: string;
        distance: string;
        customerName: string;
        customerPhone: string;
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverDashboard'>;

interface RideRequest {
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
}

export default function DriverNotificationScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [currentRideRequest, setCurrentRideRequest] = useState<RideRequest | null>(null);
    const [slideAnim] = useState(new Animated.Value(1000));
    const [countdown, setCountdown] = useState(15);
    const [accepting, setAccepting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    
    const [currentDriver, setCurrentDriver] = useState<{
        id: string;
        fullName: string;
        phone: string;
        vehicleNumber: string;
    } | null>(null);

    // Load driver data
    useEffect(() => {
        loadDriverData();
    }, []);

    const loadDriverData = async () => {
        try {
            const routeParams = route.params as any;
            if (routeParams?.driverData) {
                setCurrentDriver(routeParams.driverData);
                setIsOnline(true);
                await AsyncStorage.setItem('driverData', JSON.stringify(routeParams.driverData));
                return;
            }

            const storedDriverData = await AsyncStorage.getItem('driverData');
            if (storedDriverData) {
                const driverData = JSON.parse(storedDriverData);
                setCurrentDriver(driverData);
                setIsOnline(true);
            }
        } catch (error) {
            console.error('Error loading driver data:', error);
        }
    };

    // Fetch ride requests
    useEffect(() => {
        let interval: number;

        const fetchRideRequests = async () => {
            if (!isOnline || !currentDriver || notificationVisible) return;

            try {
                setLoading(true);
                const response = await api.get('/api/driver-notifications/pending-rides');

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

        if (isOnline && currentDriver) {
            interval = setInterval(fetchRideRequests, 5000) as unknown as number;
            fetchRideRequests();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOnline, notificationVisible, currentDriver]);

    // Countdown timer
    useEffect(() => {
        let interval: number;
        if (notificationVisible && countdown > 0) {
            interval = setInterval(() => setCountdown(prev => prev - 1), 1000) as unknown as number;
        } else if (countdown === 0 && notificationVisible) {
            handleDecline();
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [notificationVisible, countdown]);

    const showNotification = () => {
        setCountdown(15);
        setNotificationVisible(true);
        Vibration.vibrate([0, 500, 200, 500]);

        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
    };

    const hideNotification = () => {
        Animated.timing(slideAnim, {
            toValue: 1000,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setNotificationVisible(false);
            setCurrentRideRequest(null);
            setAccepting(false);
            setCountdown(15);
        });
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
                status: 'accepted',
            });

            if (response.data?.success) {
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
    };

    const toggleOnlineStatus = () => {
        if (!currentDriver) {
            Alert.alert('Registration Required', 'Please complete driver registration first.');
            return;
        }
        setIsOnline(!isOnline);
    };

    return (
        <View className="flex-1 bg-gray-100">
            {/* Main Dashboard */}
            <View className="flex-1 justify-center items-center px-6">
                <Ionicons
                    name="car-sport"
                    size={80}
                    color={isOnline ? "#3B82F6" : "#6B7280"}
                />

                <Text className="text-2xl font-bold text-gray-800 mt-4 text-center">
                    {currentDriver
                        ? (isOnline ? "You're Online 🟢" : "You're Offline 🔴")
                        : "Driver Dashboard"
                    }
                </Text>

                <Text className="text-gray-600 text-center mt-2">
                    {currentDriver
                        ? (isOnline ? "Waiting for ride requests..." : "Go online to receive rides")
                        : "Complete registration to start"
                    }
                </Text>

                {/* Driver Info */}
                {currentDriver && (
                    <View className="bg-blue-50 rounded-xl p-4 mt-4 w-full max-w-md">
                        <Text className="text-blue-800 font-semibold text-center">Driver Information</Text>
                        <View className="mt-2 space-y-1">
                            <Text className="text-blue-700">Name: {currentDriver.fullName}</Text>
                            <Text className="text-blue-700">Vehicle: {currentDriver.vehicleNumber}</Text>
                        </View>
                    </View>
                )}

                {/* Online/Offline Toggle */}
                <Pressable
                    onPress={toggleOnlineStatus}
                    className={`mt-6 rounded-xl px-8 py-4 ${currentDriver
                            ? (isOnline ? 'bg-red-500' : 'bg-green-500')
                            : 'bg-gray-400'
                        }`}
                    disabled={!currentDriver}
                >
                    <Text className="text-white font-bold text-lg">
                        {currentDriver ? (isOnline ? 'Go Offline' : 'Go Online') : 'Register First'}
                    </Text>
                </Pressable>

                {/* Status */}
                {loading && (
                    <View className="mt-4 flex-row items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-blue-600 ml-2">Checking for rides...</Text>
                    </View>
                )}
            </View>

            {/* Ride Request Modal */}
            <Modal visible={notificationVisible} transparent animationType="none">
                <View className="flex-1 bg-black/50 justify-end">
                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="bg-white rounded-t-3xl">
                        
                        {/* Header */}
                        <View className="bg-green-600 rounded-t-3xl p-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white text-lg font-semibold">🎯 RIDE REQUEST</Text>
                                <View className="bg-red-500 rounded-full px-3 py-1">
                                    <Text className="text-white font-bold">{countdown}s</Text>
                                </View>
                            </View>
                        </View>

                        {/* Ride Details */}
                        <View className="p-5">
                            {/* Customer Info */}
                            <View className="flex-row items-center mb-4">
                                <View className="bg-gray-200 rounded-full p-3 mr-3">
                                    <Ionicons name="person" size={24} color="#4B5563" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-800">
                                        {currentRideRequest?.customerName}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <Ionicons name="star" size={16} color="#F59E0B" />
                                        <Text className="text-gray-600 ml-1">
                                            {currentRideRequest?.customerRating.toFixed(1)} • {currentRideRequest?.vehicleType}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Route */}
                            <View className="space-y-3 mb-4">
                                <View className="flex-row items-start">
                                    <View className="bg-green-500 rounded-full w-3 h-3 mt-1 mr-3" />
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-medium">Pickup</Text>
                                        <Text className="text-gray-600" numberOfLines={2}>
                                            {currentRideRequest?.fromLocation}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-start">
                                    <View className="bg-red-500 rounded-full w-3 h-3 mt-1 mr-3" />
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-medium">Drop</Text>
                                        <Text className="text-gray-600" numberOfLines={2}>
                                            {currentRideRequest?.toLocation}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Fare */}
                            <View className="bg-gray-50 rounded-xl p-3 mb-6">
                                <View className="flex-row justify-between">
                                    <View>
                                        <Text className="text-gray-600">Distance</Text>
                                        <Text className="text-lg font-bold text-gray-800">
                                            {currentRideRequest?.distance.toFixed(1)} km
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-600">Fare</Text>
                                        <Text className="text-lg font-bold text-green-600">
                                            ₹{currentRideRequest?.price.toFixed(0)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row space-x-3">
                                <Pressable
                                    onPress={handleDecline}
                                    className="flex-1 bg-red-100 rounded-xl p-4 items-center justify-center active:bg-red-200"
                                >
                                    <Ionicons name="close-circle" size={28} color="#DC2626" />
                                    <Text className="text-red-600 font-bold mt-1">Decline</Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleAccept}
                                    disabled={accepting}
                                    className={`flex-1 bg-green-600 rounded-xl p-4 items-center justify-center ${accepting ? 'opacity-50' : 'active:bg-green-700'
                                        }`}
                                >
                                    {accepting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={28} color="white" />
                                            <Text className="text-white font-bold mt-1">Accept</Text>
                                        </>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}