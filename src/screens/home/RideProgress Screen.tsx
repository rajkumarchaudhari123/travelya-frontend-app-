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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface DriverData {
  id: string;
  fullName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  rating?: number;
}

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
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load driver data from AsyncStorage
  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const storedDriverData = await AsyncStorage.getItem('driverData');
        if (storedDriverData) {
          const driver = JSON.parse(storedDriverData);
          setDriverData(driver);
        } else {
          // Fallback: If no driver data in storage, use mock data
          setDriverData({
            id: 'driver_001',
            fullName: 'Rajesh Kumar',
            phone: '+91 9876543210',
            vehicleNumber: 'DL01AB1234',
            vehicleType: 'Sedan',
            rating: 4.8
          });
        }
      } catch (error) {
        console.error('Error loading driver data:', error);
        Alert.alert('Error', 'Failed to load driver information');
      } finally {
        setLoading(false);
      }
    };

    loadDriverData();
  }, []);

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

  const handleUpdateStatus = async (newStatus: typeof rideStatus) => {
    setRideStatus(newStatus);
    
    if (newStatus === 'completed') {
      try {
        // API call to update ride status
        // await api.post(`/api/bookings/${bookingId}/status`, { status: 'completed' });
        
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
      } catch (error) {
        Alert.alert('Error', 'Failed to update ride status');
      }
    } else {
      // Update intermediate status
      // await api.post(`/api/bookings/${bookingId}/status`, { status: newStatus });
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

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 text-lg">Loading driver information...</Text>
      </View>
    );
  }

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
          <Text className="text-lg font-bold text-gray-800 mb-3">Customer Details</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-gray-200 rounded-full p-3 mr-3">
                <Ionicons name="person" size={24} color="#4B5563" />
              </View>
              <View className="flex-1">
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

        {/* Driver Info - NEW SECTION */}
        {driverData && (
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Your Information</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-blue-100 rounded-full p-3 mr-3">
                  <Ionicons name="car-sport" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {driverData.fullName}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-gray-600 ml-1">
                      {driverData.rating?.toFixed(1) || '4.8'}
                    </Text>
                    <Text className="text-gray-400 mx-2">•</Text>
                    <Text className="text-gray-600 text-sm">
                      {driverData.vehicleNumber}
                    </Text>
                  </View>
                  <Text className="text-blue-600 text-sm mt-1">
                    {driverData.vehicleType}
                  </Text>
                </View>
              </View>
              <View className="bg-blue-500 rounded-full p-3">
                <Ionicons name="navigate" size={20} color="white" />
              </View>
            </View>
          </View>
        )}

        {/* Ride Details */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Ride Information</Text>
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

        {/* Ride Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-gray-600 text-sm">Distance</Text>
              <Text className="text-lg font-bold text-gray-800">{distance} km</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-600 text-sm">Fare</Text>
              <Text className="text-lg font-bold text-green-600">₹{price}</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-600 text-sm">Timer</Text>
              <Text className="text-lg font-bold text-gray-800">{formatTime(timer)}</Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Ride Status</Text>
          <View className="space-y-3">
            {[
              { status: 'accepted', label: 'Ride Accepted', time: 'Just now' },
              { status: 'arrived', label: 'Arrived at Pickup', time: rideStatus === 'arrived' || rideStatus === 'started' || rideStatus === 'completed' ? `${formatTime(timer)} ago` : 'Pending' },
              { status: 'started', label: 'Ride Started', time: rideStatus === 'started' || rideStatus === 'completed' ? `${formatTime(timer)} ago` : 'Pending' },
              { status: 'completed', label: 'Ride Completed', time: rideStatus === 'completed' ? `${formatTime(timer)} ago` : 'Pending' },
            ].map((item, index) => (
              <View key={index} className="flex-row items-center">
                <View className={`w-6 h-6 rounded-full justify-center items-center mr-3 ${
                  rideStatus === item.status || 
                  (rideStatus === 'arrived' && item.status === 'accepted') ||
                  (rideStatus === 'started' && (item.status === 'accepted' || item.status === 'arrived')) ||
                  (rideStatus === 'completed' && item.status !== 'completed')
                    ? 'bg-green-500' 
                    : rideStatus === item.status
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}>
                  {(rideStatus === item.status || 
                    (rideStatus === 'arrived' && item.status === 'accepted') ||
                    (rideStatus === 'started' && (item.status === 'accepted' || item.status === 'arrived')) ||
                    (rideStatus === 'completed' && item.status !== 'completed')) && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${
                    rideStatus === item.status || 
                    (rideStatus === 'arrived' && item.status === 'accepted') ||
                    (rideStatus === 'started' && (item.status === 'accepted' || item.status === 'arrived')) ||
                    (rideStatus === 'completed' && item.status !== 'completed')
                      ? 'text-gray-800' 
                      : 'text-gray-500'
                  }`}>
                    {item.label}
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm">
                  {item.time}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Navigation Instructions */}
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <Text className="text-blue-800 font-semibold mb-2">Navigation Guide</Text>
          <Text className="text-blue-600 text-sm">
            {rideStatus === 'accepted' 
              ? 'Follow GPS navigation to reach the pickup location. Drive safely!'
              : rideStatus === 'arrived'
              ? 'Wait for the customer to board the vehicle. Confirm their identity.'
              : rideStatus === 'started'
              ? 'Follow the route to the destination. Ensure a comfortable ride.'
              : 'Ride completed successfully. Thank you for your service!'}
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