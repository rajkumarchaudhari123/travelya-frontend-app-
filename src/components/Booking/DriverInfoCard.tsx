import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverInfo } from '@/types/booking.types';
import { screenWidth } from '@/utils/constants';

interface DriverInfoCardProps {
  driverInfo: DriverInfo | null;
  distanceToDriver: string;
  liveEta: string;
  onContactDriver: () => void;
}

export const DriverInfoCard: React.FC<DriverInfoCardProps> = ({
  driverInfo,
  distanceToDriver,
  liveEta,
  onContactDriver
}) => {
  const isSmallScreen = screenWidth < 375;

  if (!driverInfo) {
    return (
      <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-gray-600 ml-3 text-lg">Looking for available drivers...</Text>
        </View>
        <Text className="text-gray-500 text-center mt-2">
          We're finding the best driver for your ride
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`font-bold text-gray-800 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
          Your Driver
        </Text>
        <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full">
          <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          <Text className="text-green-700 text-sm font-medium">Ride Accepted</Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <View className="w-14 h-14 bg-blue-500 rounded-full justify-center items-center mr-4">
          <Text className="text-white font-bold text-lg">{driverInfo.name.charAt(0)}</Text>
        </View>

        <View className="flex-1">
          <Text className="font-bold text-gray-800 text-lg">{driverInfo.name} ✅</Text>
          <View className="flex-row items-center mb-1">
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text className="text-gray-600 text-sm ml-1">{driverInfo.rating}</Text>
            <Text className="text-gray-400 text-sm mx-2">•</Text>
            <Ionicons name="car-sport" size={14} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-1">{driverInfo.vehicleNumber}</Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Ionicons name="call" size={14} color="#3B82F6" />
            <Text className="text-blue-600 text-sm font-medium ml-1">{driverInfo.phone}</Text>
          </View>

          <View className="flex-row items-center mt-2">
            <Ionicons name="navigate" size={14} color="#EF4444" />
            <Text className="text-red-600 text-sm font-medium ml-1">{distanceToDriver} away</Text>
            <Text className="text-gray-400 text-sm mx-2">•</Text>
            <Ionicons name="time" size={14} color="#10B981" />
            <Text className="text-green-600 text-sm font-medium ml-1">ETA: {liveEta}</Text>
          </View>
        </View>

        <Pressable className="p-3 bg-blue-50 rounded-full" onPress={onContactDriver}>
          <Ionicons name="call" size={20} color="#3B82F6" />
        </Pressable>
      </View>
    </View>
  );
};