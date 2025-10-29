// screens/rider/RiderDashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RiderDashboardNavigationProp = NativeStackNavigationProp<any>;

export default function RiderDashboardScreen() {
  const navigation = useNavigation<RiderDashboardNavigationProp>();

  const quickActions = [
    {
      title: 'Book Ride',
      icon: 'car',
      color: '#10B981',
      screen: 'DestinationSearch'
    },
    {
      title: 'My Rides',
      icon: 'time',
      color: '#3B82F6',
      screen: 'BookingScreen'
    },
    {
      title: 'Ride History',
      icon: 'list',
      color: '#8B5CF6',
      screen: 'RideHistory'
    },
    {
      title: 'Payments',
      icon: 'wallet',
      color: '#F59E0B',
      screen: 'Payments'
    }
  ];

  const recentRides = [
    { id: 1, from: 'Connaught Place', to: 'Airport', date: 'Today, 10:30 AM', price: '₹250' },
    { id: 2, from: 'Home', to: 'Office', date: 'Yesterday, 09:15 AM', price: '₹180' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Welcome back!</Text>
            <Text className="text-gray-600 mt-1">Ready for your next ride?</Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-100 p-3 rounded-full"
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

        {/* Recent Rides */}
        <View className="mt-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Recent Rides</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RideHistory' as never)}>
              <Text className="text-blue-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm">
            {recentRides.map((ride) => (
              <TouchableOpacity
                key={ride.id}
                className="p-4 border-b border-gray-100 last:border-b-0"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      <Text className="text-gray-800 font-medium" numberOfLines={1}>
                        {ride.from}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      <Text className="text-gray-800 font-medium" numberOfLines={1}>
                        {ride.to}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm">{ride.date}</Text>
                  </View>
                  <Text className="text-green-600 font-bold text-lg">{ride.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 mb-6">
          <Text className="text-white text-lg font-bold mb-2">Get 20% off your next ride!</Text>
          <Text className="text-blue-100 mb-3">Use code: RIDE20</Text>
          <TouchableOpacity className="bg-white rounded-lg px-4 py-2 self-start">
            <Text className="text-blue-600 font-semibold">Apply Now</Text>
          </TouchableOpacity>
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