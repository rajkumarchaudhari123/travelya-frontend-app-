import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading booking details...' 
}) => (
  <View className="flex-1 justify-center items-center bg-gray-50">
    <ActivityIndicator size="large" color="#10B981" />
    <Text className="text-gray-600 mt-4 text-lg">{message}</Text>
  </View>
);