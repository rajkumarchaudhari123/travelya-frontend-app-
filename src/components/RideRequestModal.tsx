import React from 'react';
import { View, Text, Modal, Pressable, Animated, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RideRequest } from '@/types/navigation.types';

interface RideRequestModalProps {
    visible: boolean;
    slideAnim: Animated.Value;
    countdown: number;
    currentRideRequest: RideRequest | null;
    accepting: boolean;
    onDecline: () => void;
    onAccept: () => void;
}

export const RideRequestModal: React.FC<RideRequestModalProps> = ({
    visible,
    slideAnim,
    countdown,
    currentRideRequest,
    accepting,
    onDecline,
    onAccept
}) => {
    if (!currentRideRequest) return null;

    return (
        <Modal visible={visible} transparent animationType="none">
            <View className="flex-1 bg-black/50 justify-end">
                <Animated.View 
                    style={{ transform: [{ translateY: slideAnim }] }} 
                    className="bg-white rounded-t-3xl"
                >
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
                                    {currentRideRequest.customerName}
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="star" size={16} color="#F59E0B" />
                                    <Text className="text-gray-600 ml-1">
                                        {currentRideRequest.customerRating.toFixed(1)} • {currentRideRequest.vehicleType}
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
                                        {currentRideRequest.fromLocation}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-start">
                                <View className="bg-red-500 rounded-full w-3 h-3 mt-1 mr-3" />
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium">Drop</Text>
                                    <Text className="text-gray-600" numberOfLines={2}>
                                        {currentRideRequest.toLocation}
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
                                        {currentRideRequest.distance.toFixed(1)} km
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-gray-600">Fare</Text>
                                    <Text className="text-lg font-bold text-green-600">
                                        ₹{currentRideRequest.price.toFixed(0)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Actions */}
                        <View className="flex-row space-x-3">
                            <Pressable
                                onPress={onDecline}
                                className="flex-1 bg-red-100 rounded-xl p-4 items-center justify-center active:bg-red-200"
                            >
                                <Ionicons name="close-circle" size={28} color="#DC2626" />
                                <Text className="text-red-600 font-bold mt-1">Decline</Text>
                            </Pressable>

                            <Pressable
                                onPress={onAccept}
                                disabled={accepting}
                                className={`flex-1 bg-green-600 rounded-xl p-4 items-center justify-center ${
                                    accepting ? 'opacity-50' : 'active:bg-green-700'
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
    );
};