import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverInfo } from '@/types/booking.types';
import { getVehicleIcon, getVehicleColor } from '@/utils/bookingUtils';
import { screenWidth } from '@/utils/constants';

interface VehicleInfoCardProps {
  vehicleType: string;
  price: number;
  distance: string;
  driverInfo: DriverInfo | null;
  liveEta: string;
  distanceToDriver: string;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({
  vehicleType,
  price,
  distance,
  driverInfo,
  liveEta,
  distanceToDriver
}) => {
  const isSmallScreen = screenWidth < 375;

  return (
    <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-lg border border-gray-100">
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center mr-4">
          <Ionicons
            name={getVehicleIcon(vehicleType) as any}
            size={28}
            className={getVehicleColor(vehicleType)}
          />
        </View>
        <View className="flex-1">
          <Text className={`font-bold text-gray-800 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
            {vehicleType || 'Standard'}
          </Text>
          <Text className="text-gray-500 text-base">
            {driverInfo ? `Live ETA: ${liveEta}` : 'Finding driver...'}
          </Text>
          {driverInfo && (
            <Text className="text-blue-600 text-sm font-medium">
              {distanceToDriver} • {driverInfo.name} is coming
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className={`font-bold text-green-600 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
            ₹{price || '0'}
          </Text>
          <Text className="text-gray-500 text-sm">{distance || '0'} km</Text>
        </View>
      </View>
    </View>
  );
};