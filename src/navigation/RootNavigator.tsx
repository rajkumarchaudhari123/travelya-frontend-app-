// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import RoleSelectionScreen from '../screens/home/RoleSelectionScreen';
import RiderRegisterScreen from '@/screens/home/RiderRegisterScreen';
import DriverRegisterScreen from '@/screens/home/DriverRegisterScreen';
// Strong typing for route params
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerify: {
    phone: string;
    verificationId: string;
    context?: 'signup' | 'login';

  };

  RoleSelection: undefined;
  DriverRegister: undefined;
  RiderRegister: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: 'Select Role' }} />
      <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} options={{ title: 'Set Up Profile' }} />
      <Stack.Screen name="RiderRegister" component={RiderRegisterScreen} options={{ title: 'Set Up Profile' }} />

    </Stack.Navigator>
  );
}
