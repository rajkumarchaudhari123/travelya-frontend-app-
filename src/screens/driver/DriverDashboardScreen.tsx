// screens/driver/DriverDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DriverDashboardNavigationProp = NativeStackNavigationProp<any>;

export default function DriverDashboardScreen() {
  const navigation = useNavigation<DriverDashboardNavigationProp>();
  const [isOnline, setIsOnline] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('driverData');
      if (storedData) {
        setDriverData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    }
  };

  const toggleOnlineStatus = () => {
    if (!isOnline) {
      Alert.alert(
        'Go Online',
        'You will start receiving ride requests. Are you ready?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go Online', 
            onPress: () => {
              setIsOnline(true);
              navigation.navigate('RideRequests' as never);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Go Offline',
        'You will stop receiving ride requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go Offline', 
            onPress: () => setIsOnline(false)
          }
        ]
      );
    }
  };

  const quickStats = [
    {
      title: 'Today Earnings',
      value: '₹0',
      icon: 'cash',
      color: '#10B981'
    },
    {
      title: 'Completed Rides',
      value: '0',
      icon: 'checkmark-circle',
      color: '#3B82F6'
    },
    {
      title: 'Rating',
      value: '4.8',
      icon: 'star',
      color: '#F59E0B'
    },
    {
      title: 'Online Time',
      value: '0h 0m',
      icon: 'time',
      color: '#8B5CF6'
    }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              Hello, {driverData?.fullName || 'Driver'}!
            </Text>
            <Text className="text-gray-600 mt-1">
              {isOnline ? 'You are online 🟢' : 'You are offline 🔴'}
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-100 p-3 rounded-full"
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="person" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Online/Offline Toggle */}
        <TouchableOpacity
          onPress={toggleOnlineStatus}
          className={`rounded-xl py-4 flex-row justify-center items-center ${
            isOnline ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          <Ionicons 
            name={isOnline ? 'pause-circle' : 'play-circle'} 
            size={24} 
            color="white" 
          />
          <Text className="text-white font-bold text-lg ml-2">
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View className="mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Today's Summary</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickStats.map((stat, index) => (
              <View
                key={index}
                className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">{stat.value}</Text>
                    <Text className="text-gray-600 text-sm mt-1">{stat.title}</Text>
                  </View>
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-4 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => navigation.navigate('RideRequests' as never)}
            >
              <View className="items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="notifications" size={24} color="#10B981" />
                </View>
                <Text className="text-gray-800 font-semibold text-center">Ride Requests</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <View className="items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="person" size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-800 font-semibold text-center">Profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Message */}
        <View className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-200">
          <Text className="text-blue-800 font-bold mb-2">🚗 Welcome to Driver App!</Text>
          <Text className="text-blue-700">
            Go online to start receiving ride requests and earn money. Make sure your documents are verified.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};