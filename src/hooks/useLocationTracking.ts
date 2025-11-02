import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { Location as LocationType } from '@/types/booking.types';

export const useLocationTracking = () => {
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);

  const getUserLocation = async (): Promise<LocationType | undefined> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Need location permission to track driver');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const userLoc = { latitude, longitude };
      setUserLocation(userLoc);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      return userLoc;
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return { userLocation, mapRegion, getUserLocation };
};