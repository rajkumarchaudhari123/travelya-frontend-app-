import React from 'react';
import { View, Text } from 'react-native';
import { screenWidth } from '@/utils/constants';

interface TripDetailsCardProps {
  fromLocation: string;
  toLocation: string;
}

export const TripDetailsCard: React.FC<TripDetailsCardProps> = ({
  fromLocation,
  toLocation
}) => {
  const isSmallScreen = screenWidth < 375;

  return (
    <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
      <Text className={`font-bold text-gray-800 mb-4 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
        Trip Details
      </Text>

      <View className="items-center mb-4">
        <View className="w-3 h-3 bg-green-500 rounded-full" />
        <View className="w-0.5 h-10 bg-gray-300 my-1" />
        <View className="w-3 h-3 bg-red-500 rounded-full" />
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-500 text-sm font-semibold mb-1">FROM</Text>
          <Text className="text-gray-800 text-base leading-6" numberOfLines={2}>
            {fromLocation || 'Pickup location not specified'}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-sm font-semibold mb-1">TO</Text>
          <Text className="text-gray-800 text-base leading-6" numberOfLines={2}>
            {toLocation || 'Destination not specified'}
          </Text>
        </View>
      </View>
    </View>
  );
};