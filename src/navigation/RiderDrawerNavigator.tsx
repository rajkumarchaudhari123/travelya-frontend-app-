import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DestinationSearchScreen from '../screens/home/DestinationSearchScreen';
import BookingScreen from '../screens/home/BookingScreen';
import RideProgressScreen from '../screens/home/RideProgress Screen';

import ProfileScreen from '../screens/home/ProfileScreen';
import SettingsScreen from '../screens/home/SettingsScreen';
import RiderDashboardScreen from '../screens/rider/RiderDashboardScreen';

const Drawer = createDrawerNavigator();

// Custom Drawer Content with Logout
function CustomDrawerContent(props: any) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove(['userToken', 'userRole', 'riderData', 'userData']);
              
              // Navigate to Login screen using navigation prop from drawer
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              // Even if there's an error, still navigate to login
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* User Info Section */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3">
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-800">Rider</Text>
            <Text className="text-gray-600 text-sm">Welcome back!</Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <View className="mt-auto border-t border-gray-200">
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={handleLogout}
          labelStyle={{ color: '#EF4444', fontWeight: '600' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function RiderDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
        },
        headerShown: true,
        headerTitle: 'Rider App',
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#6B7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={RiderDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          title: 'Dashboard'
        }}
      />
      <Drawer.Screen 
        name="BookRide" 
        component={DestinationSearchScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
          title: 'Book Ride'
        }}
      />
      <Drawer.Screen 
        name="MyRides" 
        component={BookingScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          title: 'My Rides'
        }}
      />
      <Drawer.Screen 
        name="RideProgress" 
        component={RideProgressScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="navigate" size={size} color={color} />
          ),
          title: 'Ride in Progress'
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}