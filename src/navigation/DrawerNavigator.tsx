import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../screens/home/SettingsScreen'; 
import ProfileScreen from '@/screens/home/ProfileScreen';
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Profile"
        screenOptions={{
          drawerStyle: {
            width: 240,
          },
        }}
      >
        <Drawer.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            drawerIcon: () => (
              <Image
                source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }} // Placeholder avatar image
                style={{ width: 30, height: 30, borderRadius: 15 }}
              />
            ),
          }} 
        />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default DrawerNavigator;
