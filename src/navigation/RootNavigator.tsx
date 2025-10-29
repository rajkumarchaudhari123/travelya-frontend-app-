// navigation/RootNavigator.tsx
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import RoleSelectionScreen from '../screens/home/RoleSelectionScreen';
import RiderRegisterScreen from '@/screens/home/RiderRegisterScreen';
import DriverRegisterScreen from '@/screens/home/DriverRegisterScreen';
import DestinationSearchScreen from '../screens/home/DestinationSearchScreen';
import BookingScreen from '@/screens/home/BookingScreen';
import DriverNotificationScreen from '@/screens/home/DriverNotificationScreen';
import RideProgressScreen from '@/screens/home/RideProgress Screen';
import DriverRideInProgressScreen from '@/screens/home/DriverRideInProgressScreen';
import RiderDrawerNavigator from './RiderDrawerNavigator';
import DriverDrawerNavigator from './DriverDrawerNavigator';
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerify: { phone: string; verificationId: string; context?: 'signup' | 'login' };
  RoleSelection: undefined;
  DriverRegister: undefined;
  RiderRegister: undefined;
  MainApp: undefined;
  DestinationSearch: undefined;
  BookingScreen: undefined;
  DriverNotification: undefined;
  RideProgress: undefined;
  DriverRideInProgress: {
    bookingId: string;
    fromLocation: string;
    toLocation: string;
    price: string;
    distance: string;
    customerName: string;
    customerPhone: string;
  };
  RiderDashboard: undefined;
  DriverDashboard: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'rider' | 'driver' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const checkAuthStatus = async () => {
    try {
      const authStatus = await getAuthStatus();
      const role = await getUserRole();
      setIsAuthenticated(authStatus);
      setUserRole(role);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuthStatus();

  // ✅ Auto re-check every 1 second to detect storage change instantly
  const interval = setInterval(checkAuthStatus, 1000);
  return () => clearInterval(interval);
}, []);


  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Loading....</Text>
      </View>
    );
  }

  // Render authenticated screens based on user role
  if (isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === 'rider' ? (
          <Stack.Screen name="RiderDashboard" component={RiderDrawerNavigator} />
        ) : userRole === 'driver' ? (
          <Stack.Screen name="DriverDashboard" component={DriverDrawerNavigator} />
        ) : (
          // If role not determined, go to role selection
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        )}

        {/* Common screens accessible from both rider and driver */}
        <Stack.Screen name="DestinationSearch" component={DestinationSearchScreen} />
        <Stack.Screen name="BookingScreen" component={BookingScreen} />
        <Stack.Screen name="RideProgress" component={RideProgressScreen} />
        <Stack.Screen name="DriverRideInProgress" component={DriverRideInProgressScreen} />
        <Stack.Screen name="DriverNotification" component={DriverNotificationScreen} />
      </Stack.Navigator>
    );
  }

  // Render unauthenticated screens
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
      <Stack.Screen name="RiderRegister" component={RiderRegisterScreen} />

      {/* You can keep these screens accessible without auth if needed */}
      <Stack.Screen name="DestinationSearch" component={DestinationSearchScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
    </Stack.Navigator>
  );
}

// Get authentication status from AsyncStorage
async function getAuthStatus(): Promise<boolean> {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    return !!userToken;
  } catch (error) {
    console.error('Error getting auth status:', error);
    return false;
  }
}

// Get user role from storage
async function getUserRole(): Promise<'rider' | 'driver' | null> {
  try {
    const role = await AsyncStorage.getItem('userRole');
    return role as 'rider' | 'driver' | null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}