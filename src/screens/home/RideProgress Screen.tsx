import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  DriverRideInProgress: {
    bookingId: string;
    fromLocation: string;
    toLocation: string;
    price: string;
    distance: string;
    customerName: string;
    customerPhone: string;
  };
  DriverDashboard: undefined;
};

type RideInProgressRouteProp = RouteProp<RootStackParamList, 'DriverRideInProgress'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverDashboard'>;

export default function DriverRideInProgressScreen() {
  const route = useRoute<RideInProgressRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { 
    bookingId, 
    fromLocation, 
    toLocation, 
    price, 
    distance, 
    customerName, 
    customerPhone 
  } = route.params;

  const [rideStatus, setRideStatus] = useState<'accepted' | 'arrived' | 'started' | 'completed'>('accepted');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${customerPhone}`);
  };

  const handleUpdateStatus = (newStatus: typeof rideStatus) => {
    setRideStatus(newStatus);
    
    if (newStatus === 'completed') {
      Alert.alert(
        'Ride Completed!',
        `You have earned ₹${price}`,
        [
          {
            text: 'Back to Dashboard',
            onPress: () => navigation.navigate('DriverDashboard'),
          },
        ]
      );
    }
  };

  const getStatusMessage = () => {
    switch (rideStatus) {
      case 'accepted':
        return 'Head to pickup location';
      case 'arrived':
        return 'You have arrived at pickup';
      case 'started':
        return 'Ride in progress';
      case 'completed':
        return 'Ride completed';
      default:
        return '';
    }
  };

  const getNextAction = () => {
    switch (rideStatus) {
      case 'accepted':
        return { label: 'I Have Arrived', action: () => handleUpdateStatus('arrived') };
      case 'arrived':
        return { label: 'Start Ride', action: () => handleUpdateStatus('started') };
      case 'started':
        return { label: 'Complete Ride', action: () => handleUpdateStatus('completed') };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 p-4 pt-12">
        <Text className="text-white text-xl font-bold text-center">
          {getStatusMessage()}
        </Text>
        <Text className="text-blue-100 text-center mt-1">
          Booking ID: {bookingId}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Customer Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-gray-200 rounded-full p-3 mr-3">
                <Ionicons name="person" size={24} color="#4B5563" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {customerName}
                </Text>
                <Text className="text-gray-600">{customerPhone}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleCallCustomer}
              className="bg-green-100 rounded-full p-3"
            >
              <Ionicons name="call" size={20} color="#10B981" />
            </Pressable>
          </View>
        </View>

        {/* Ride Details */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <View className="space-y-4">
            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#10B981" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-600 text-sm">PICKUP</Text>
                <Text className="text-gray-800 font-medium">{fromLocation}</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="flag" size={20} color="#EF4444" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-600 text-sm">DROP</Text>
                <Text className="text-gray-800 font-medium">{toLocation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ride Information */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-gray-600 text-sm">Distance</Text>
              <Text className="text-lg font-bold text-gray-800">{distance} km</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-600 text-sm">Fare</Text>
              <Text className="text-lg font-bold text-green-600">₹{price}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-600 text-sm">Timer</Text>
              <Text className="text-lg font-bold text-gray-800">{formatTime(timer)}</Text>
            </View>
          </View>
        </View>

        {/* Navigation Instructions */}
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <Text className="text-blue-800 font-semibold mb-2">Navigation</Text>
          <Text className="text-blue-600 text-sm">
            {rideStatus === 'accepted' 
              ? 'Follow GPS navigation to reach the pickup location.'
              : rideStatus === 'arrived'
              ? 'Wait for the customer to board the vehicle.'
              : 'Follow the route to the destination.'}
          </Text>
        </View>
      </ScrollView>

      {/* Action Button */}
      {nextAction && (
        <View className="p-4 border-t border-gray-200">
          <Pressable
            onPress={nextAction.action}
            className="bg-green-600 rounded-xl p-4 items-center justify-center active:bg-green-700"
          >
            <Text className="text-white text-lg font-bold">{nextAction.label}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}