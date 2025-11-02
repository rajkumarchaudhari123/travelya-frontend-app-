import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/booking.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DestinationSearch'>;

interface ErrorScreenProps {
  navigation: NavigationProp;
  message?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  navigation, 
  message = 'Booking not found' 
}) => (
  <View className="flex-1 justify-center items-center bg-gray-50">
    <Ionicons name="alert-circle" size={60} color="#EF4444" />
    <Text className="text-gray-600 mt-4 text-lg">{message}</Text>
    <Pressable
      className="mt-6 bg-green-500 px-6 py-3 rounded-xl"
      onPress={() => navigation.navigate('DestinationSearch')}
    >
      <Text className="text-white font-semibold">Go Back</Text>
    </Pressable>
  </View>
);