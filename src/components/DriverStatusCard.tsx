import React from 'react';
import { View, Text } from 'react-native';
import { DriverData } from '@/types/navigation.types';

interface DriverStatusCardProps {
    currentDriver: DriverData;
}

export const DriverStatusCard: React.FC<DriverStatusCardProps> = ({ currentDriver }) => {
    return (
        <View className="bg-blue-50 rounded-xl p-4 mt-4 w-full max-w-md">
            <Text className="text-blue-800 font-semibold text-center">Driver Information</Text>
            <View className="mt-2 space-y-1">
                <Text className="text-blue-700">Name: {currentDriver.fullName}</Text>
                <Text className="text-blue-700">Phone: {currentDriver.phone}</Text>
                <Text className="text-blue-700">Vehicle: {currentDriver.vehicleNumber}</Text>
            </View>
        </View>
    );
};