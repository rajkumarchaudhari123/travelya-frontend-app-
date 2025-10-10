import React from 'react';
import { Image } from 'react-native';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsScreen from '../screens/home/SettingsScreen';
import ProfileScreen from '@/screens/home/ProfileScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Profile"
      screenOptions={({ navigation }) => ({
        drawerStyle: {
          width: 240,
        },
        headerLeft: ({ tintColor }) => (
          <Ionicons
            name="menu"
            size={30}
            color={tintColor}
            style={{ marginLeft: 15 }}
            onPress={() => navigation.toggleDrawer()}
          />
        ),
      })}
    >
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Image
              source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
            />
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
};

export default DrawerNavigator;