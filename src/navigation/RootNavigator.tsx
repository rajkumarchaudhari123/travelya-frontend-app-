import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import RoleSelectionScreen from '../screens/home/RoleSelectionScreen';
import RiderRegisterScreen from '@/screens/home/RiderRegisterScreen';
import DriverRegisterScreen from '@/screens/home/DriverRegisterScreen';
import DestinationSearchScreen from '../screens/home/DestinationSearchScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerify: { phone: string; verificationId: string; context?: 'signup' | 'login' };
  RoleSelection: undefined;
  DriverRegister: undefined;
  RiderRegister: undefined;
  MainApp: undefined;
  DestinationSearch: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authStatus = await getAuthStatus();
      setIsAuthenticated(authStatus);
    };
    checkAuthStatus();
  }, []);

  // Render authenticated screens
  if (isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    );
  }

  // Render unauthenticated screens
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: 'Select Role' }} />
      <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} options={{ title: 'Set Up Profile' }} />
      <Stack.Screen name="RiderRegister" component={RiderRegisterScreen} options={{ title: 'Set Up Profile' }} />
      <Stack.Screen 
        name="DestinationSearch" 
        component={DestinationSearchScreen} 
        options={{ title: 'Search Destination' }} 
      />
    </Stack.Navigator>
  );
}

// Example of getting auth status from AsyncStorage or Redux
async function getAuthStatus(): Promise<boolean> {
  return false; // Default to not authenticated for demo purposes
}