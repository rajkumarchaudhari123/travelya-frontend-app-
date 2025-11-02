import React, { useEffect } from 'react';
import { View, Text, Pressable, Alert, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDriverData } from '@/hooks/useDriverData';
import { useNotificationAnimation } from '@/hooks/useNotificationAnimation';
import { useRideRequests } from '@/hooks/useRideRequests';
import { DriverStatusCard } from '@/components/DriverStatusCard';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { RideRequestModal } from '@/components/RideRequestModal';
import { RootStackParamList } from '@/types/navigation.types';
import { VIBRATION_PATTERN } from '@/utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverDashboard'>;

export default function DriverNotificationScreen() {
    const navigation = useNavigation<NavigationProp>();
    
    const { currentDriver, isOnline, toggleOnlineStatus } = useDriverData();
    const { 
        notificationVisible, 
        countdown, 
        setCountdown,
        slideAnim, 
        showNotification, 
        hideNotification 
    } = useNotificationAnimation();
    
    const {
        currentRideRequest,
        loading,
        accepting,
        handleAccept,
        handleDecline
    } = useRideRequests(isOnline, currentDriver, notificationVisible, showNotification, hideNotification);

    // Countdown timer effect
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

    const handleToggleOnline = () => {
        if (!currentDriver) {
            Alert.alert('Registration Required', 'Please complete driver registration first.');
            return;
        }
        toggleOnlineStatus();
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
                {currentDriver && <DriverStatusCard currentDriver={currentDriver} />}

                {/* Online/Offline Toggle */}
                <Pressable
                    onPress={handleToggleOnline}
                    className={`mt-6 rounded-xl px-8 py-4 ${
                        currentDriver
                            ? (isOnline ? 'bg-red-500' : 'bg-green-500')
                            : 'bg-gray-400'
                    }`}
                    disabled={!currentDriver}
                >
                    <Text className="text-white font-bold text-lg">
                        {currentDriver ? (isOnline ? 'Go Offline' : 'Go Online') : 'Register First'}
                    </Text>
                </Pressable>

                {/* Loading Indicator */}
                <LoadingIndicator loading={loading} />
            </View>

            {/* Ride Request Modal */}
            <RideRequestModal
                visible={notificationVisible}
                slideAnim={slideAnim}
                countdown={countdown}
                currentRideRequest={currentRideRequest}
                accepting={accepting}
                onDecline={handleDecline}
                onAccept={handleAccept}
            />
        </View>
    );
}