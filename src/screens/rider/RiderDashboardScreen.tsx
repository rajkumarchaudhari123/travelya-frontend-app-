// screens/rider/RiderDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RiderDashboardNavigationProp = NativeStackNavigationProp<any>;

interface RiderData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export default function RiderDashboardScreen() {
  const navigation = useNavigation<RiderDashboardNavigationProp>();
  const [riderData, setRiderData] = useState<RiderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load rider data from AsyncStorage
  useEffect(() => {
    const loadRiderData = async () => {
      try {
        const storedRiderData = await AsyncStorage.getItem('riderData');
        if (storedRiderData) {
          const rider = JSON.parse(storedRiderData);
          setRiderData(rider);
        }
      } catch (error) {
        console.error('Error loading rider data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRiderData();
  }, []);

  const quickActions = [
    {
      title: 'Book Ride',
      icon: 'car',
      color: '#10B981',
      screen: 'DestinationSearch'
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              {riderData ? `Welcome, ${riderData.fullName}!` : 'Welcome back!'}
            </Text>
            <Text className="text-gray-600 mt-1">Travelya में आपका स्वागत है</Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-100 p-3 rounded-full ml-4"
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="person" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm"
                onPress={() => navigation.navigate(action.screen as never)}
              >
                <View className="items-center">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: action.color + '20' }}
                  >
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text className="text-gray-800 font-semibold text-center">{action.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Travelya Brand Section */}
        <View className="mt-6 mb-6">
          <View className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <View className="items-center">
              <Ionicons name="car-sport" size={48} color="#3B82F6" />
              <Text className="text-2xl font-bold text-blue-800 mt-3">Travelya</Text>
              <Text className="text-blue-600 text-center mt-2">
                आपकी सुरक्षित और आरामदायक यात्रा का विश्वसनीय साथी
              </Text>
              <Text className="text-gray-600 text-sm text-center mt-3">
                हमारे साथ अपनी यात्रा का आनंद लें - सुरक्षित, तेज़ और विश्वसनीय
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Why Choose Travelya?</Text>
          <View className="space-y-3">
            {[
              { icon: 'shield-checkmark', text: '100% Safe & Secure Rides', color: '#10B981' },
              { icon: 'time', text: 'Quick Pickup & Drop', color: '#F59E0B' },
              { icon: 'cash', text: 'Affordable Prices', color: '#EF4444' },
              { icon: 'star', text: 'Verified Drivers', color: '#8B5CF6' },
            ].map((feature, index) => (
              <View key={index} className="bg-white rounded-xl p-4 flex-row items-center shadow-sm">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: feature.color + '20' }}
                >
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <Text className="text-gray-800 font-medium flex-1">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Quick Book Button */}
      <View className="px-6 pb-6 pt-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-green-500 rounded-xl py-4 flex-row justify-center items-center"
          onPress={() => navigation.navigate('DestinationSearch' as never)}
        >
          <Ionicons name="car" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Book New Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}