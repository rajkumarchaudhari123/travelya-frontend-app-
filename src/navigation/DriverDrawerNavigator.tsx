// navigation/DriverDrawerNavigator.tsx (Alternative Solution)
import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverNotificationScreen from '../screens/home/DriverNotificationScreen';
import DriverRideInProgressScreen from '../screens/home/DriverRideInProgressScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import SettingsScreen from '../screens/home/SettingsScreen';

const Drawer = createDrawerNavigator();

function CustomDriverDrawerContent(props: any) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Clear all stored data
      await AsyncStorage.multiRemove(['userToken', 'userRole', 'driverData']);
      console.log('✅ All driver data cleared from storage');

      // ✅ FIX 1: Go back to parent navigator first, then navigate to Login
      navigation.getParent()?.navigate('Login');
      
      console.log('✅ Successfully navigated to Login screen');
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout from Driver App?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('🚫 Logout cancelled by user'),
        },
        {
          text: 'Yes, Logout',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* User Info Section */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-3">
            <Ionicons name="car-sport" size={24} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-800">Driver Account</Text>
            <Text className="text-gray-600 text-sm">Manage your driver profile</Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <View className="mt-8 border-t border-gray-200 pt-4">
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color="#EF4444" />
          )}
          onPress={confirmLogout}
          labelStyle={{ 
            color: '#EF4444', 
            fontWeight: '600',
            fontSize: 16,
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DriverDrawerNavigator() {
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDriverDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerStyle: {
          width: 280,
          backgroundColor: '#ffffff',
        },
        headerShown: true,
        headerTitle: '', // Empty title by default
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#374151',
        // Custom header left with hamburger menu
        headerLeft: () => (
          <Ionicons
            name="menu"
            size={28}
            color="#374151"
            style={{ marginLeft: 15 }}
            onPress={navigation.toggleDrawer}
          />
        ),
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#6B7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
          marginVertical: 2,
        },
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DriverDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          title: 'Dashboard',
          headerTitle: 'Driver Dashboard'
        }}
      />
      <Drawer.Screen 
        name="RideRequests" 
        component={DriverNotificationScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          title: 'Ride Requests',
          headerTitle: 'Ride Requests'
        }}
      />
   
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          title: 'Profile',
          headerTitle: 'My Profile'
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          title: 'Settings',
          headerTitle: 'Settings'
        }}
      />
    </Drawer.Navigator>
  );
}