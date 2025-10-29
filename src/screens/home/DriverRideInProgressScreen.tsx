import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

type RootStackParamList = {
  DriverDashboard: undefined;
  DriverRideInProgress: {
    bookingId: string;
    fromLocation: string;
    toLocation: string;
    price: string;
    distance: string;
    customerName: string;
    customerPhone: string;
    pickupLat: number;
    pickupLon: number;
    dropLat: number;
    dropLon: number;
  };
};

type RideInProgressRouteProp = RouteProp<RootStackParamList, 'DriverRideInProgress'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverRideInProgress'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DriverRideInProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RideInProgressRouteProp>();
  const { 
    bookingId = '', 
  fromLocation = '', 
  toLocation = '', 
  price = '0', 
  distance = '0', 
  customerName = '', 
  customerPhone = '',
  pickupLat = 0,
  pickupLon = 0,
  dropLat = 0,
  dropLon = 0
  } = route.params;

  const [rideStatus, setRideStatus] = useState<'pickup' | 'ongoing' | 'completed'>('pickup');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [locationUpdates, setLocationUpdates] = useState<any[]>([]);

  // Real driver location coordinates
  const pickupCoords = {
    latitude: pickupLat || 28.6328,
    longitude: pickupLon || 77.2197,
  };
  
  const dropCoords = {
    latitude: dropLat || 28.6129,
    longitude: dropLon || 77.2295,
  };

  // Get driver's real-time location
  useEffect(() => {
    let locationSubscription: any;

    const startLocationTracking = async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to track your ride.');
          return;
        }

        // Get current position first
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setDriverLocation(currentLocation.coords);

        // Subscribe to location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          (newLocation) => {
            const newCoords = newLocation.coords;
            setDriverLocation(newCoords);
            
            // Store location history for polyline
            setLocationUpdates(prev => [...prev.slice(-50), newCoords]); // Keep last 50 locations
          }
        );

      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Unable to get your current location.');
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000) as unknown as number;
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${minsStr}:${secsStr}`;
  };

  const handleStartRide = () => {
    setRideStatus('ongoing');
    Alert.alert('Ride Started', 'You are now on the way to the destination.');
  };

  const handleCompleteRide = () => {
    setIsTimerRunning(false);
    setRideStatus('completed');
    Alert.alert(
      'Ride Completed', 
      `Ride has been completed successfully!\nTotal time: ${formatTime(timer)}\nFare: ₹${price}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('DriverDashboard')
        }
      ]
    );
  };

  const handleCallCustomer = () => {
    Alert.alert('Call Customer', `Call ${customerName} at ${customerPhone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling customer...') }
    ]);
  };

  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes', 
        style: 'destructive',
        onPress: () => navigation.navigate('DriverDashboard')
      }
    ]);
  };

  // Calculate map region based on driver location
  const getMapRegion = () => {
    if (driverLocation) {
      return {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    return {
      latitude: pickupCoords.latitude,
      longitude: pickupCoords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 px-4 py-6 pt-12">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-lg font-bold">Ride in Progress</Text>
          <View className="w-8" />
        </View>
        
        <View className="flex-row justify-between items-center mt-4">
          <View>
            <Text className="text-blue-100 text-sm">Booking ID</Text>
            <Text className="text-white font-semibold">{bookingId}</Text>
          </View>
          <View className="bg-blue-500 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              {rideStatus === 'pickup' ? 'Pickup' : 
               rideStatus === 'ongoing' ? 'On Trip' : 'Completed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Map with Real Driver Location */}
      <View className="flex-1">
        <MapView
          style={{ width: screenWidth, height: screenHeight * 0.4 }}
          region={getMapRegion()}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {/* Driver's Current Location */}
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              title="Your Location"
              description="You are here"
            >
              <View className="items-center justify-center">
                <View className="bg-blue-600 rounded-full p-2">
                  <Ionicons name="car-sport" size={24} color="white" />
                </View>
                <View className="bg-blue-600 w-4 h-4 rounded-full -mt-2 rotate-45" />
              </View>
            </Marker>
          )}

          {/* Pickup Location */}
          <Marker
            coordinate={pickupCoords}
            title="Pickup Location"
            description={fromLocation}
          >
            <View className="items-center justify-center">
              <Ionicons name="location" size={30} color="#10B981" />
              <Text className="text-green-600 font-bold text-xs mt-1">PICKUP</Text>
            </View>
          </Marker>
          
          {/* Drop Location */}
          <Marker
            coordinate={dropCoords}
            title="Drop Location"
            description={toLocation}
          >
            <View className="items-center justify-center">
              <Ionicons name="flag" size={30} color="#EF4444" />
              <Text className="text-red-600 font-bold text-xs mt-1">DROP</Text>
            </View>
          </Marker>

          {/* Route from Driver to Pickup (when going for pickup) */}
          {rideStatus === 'pickup' && driverLocation && (
            <Polyline
              coordinates={[
                { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
                pickupCoords
              ]}
              strokeColor="#3B82F6"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}

          {/* Route from Pickup to Drop (when ride is ongoing) */}
          {rideStatus === 'ongoing' && driverLocation && (
            <Polyline
              coordinates={[
                { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
                dropCoords
              ]}
              strokeColor="#10B981"
              strokeWidth={4}
            />
          )}

          {/* Driver's traveled path */}
          {locationUpdates.length > 1 && (
            <Polyline
              coordinates={locationUpdates}
              strokeColor="#8B5CF6"
              strokeWidth={3}
            />
          )}
        </MapView>

        {/* Location Status Bar */}
        <View className="absolute top-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons 
                name="navigate" 
                size={20} 
                color={driverLocation ? "#10B981" : "#EF4444"} 
              />
              <Text className="ml-2 text-sm font-medium">
                {driverLocation ? 'Live Location Active' : 'Getting Location...'}
              </Text>
            </View>
            {driverLocation && (
              <Text className="text-xs text-gray-500">
                {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Ride Details */}
      <ScrollView className="flex-1 px-4 py-6">
        {/* Customer Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Customer Details</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-gray-100 rounded-full p-3 mr-3">
                <Ionicons name="person" size={24} color="#4B5563" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">{customerName}</Text>
                <Text className="text-gray-600 text-sm">{customerPhone}</Text>
              </View>
            </View>
            <Pressable 
              onPress={handleCallCustomer}
              className="bg-green-500 rounded-full p-3 ml-2"
            >
              <Ionicons name="call" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Ride Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Ride Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#10B981" style={{ marginTop: 4, marginRight: 12 }} />
              <View className="flex-1">
                <Text className="text-gray-600 text-sm">Pickup</Text>
                <Text className="text-gray-800 font-medium">{fromLocation}</Text>
                <Text className="text-gray-500 text-xs">
                  {pickupLat.toFixed(4)}, {pickupLon.toFixed(4)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <Ionicons name="flag" size={20} color="#EF4444" style={{ marginTop: 4, marginRight: 12 }} />
              <View className="flex-1">
                <Text className="text-gray-600 text-sm">Drop</Text>
                <Text className="text-gray-800 font-medium">{toLocation}</Text>
                <Text className="text-gray-500 text-xs">
                  {dropLat.toFixed(4)}, {dropLon.toFixed(4)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between pt-2 border-t border-gray-100">
              <View>
                <Text className="text-gray-600 text-sm">Distance</Text>
                <Text className="text-gray-800 font-semibold">{distance} km</Text>
              </View>
              
              <View>
                <Text className="text-gray-600 text-sm">Fare</Text>
                <Text className="text-green-600 font-bold text-lg">₹{price}</Text>
              </View>
              
              <View>
                <Text className="text-gray-600 text-sm">Time</Text>
                <Text className="text-gray-800 font-semibold">{formatTime(timer)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Status */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Location Status</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${driverLocation ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className="text-gray-700">
                {driverLocation ? 'Live GPS Tracking Active' : 'GPS Not Available'}
              </Text>
            </View>
            {driverLocation && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 pb-6 pt-4 bg-white border-t border-gray-200">
        {rideStatus === 'pickup' && (
          <View className="space-y-3">
            <Pressable
              onPress={handleStartRide}
              className="bg-green-600 rounded-xl py-4 items-center justify-center active:bg-green-700"
            >
              <Text className="text-white font-bold text-lg">Start Ride</Text>
            </Pressable>
            
            <Pressable
              onPress={handleCancelRide}
              className="border border-red-500 rounded-xl py-4 items-center justify-center active:bg-red-50"
            >
              <Text className="text-red-500 font-bold">Cancel Ride</Text>
            </Pressable>
          </View>
        )}
        
        {rideStatus === 'ongoing' && (
          <Pressable
            onPress={handleCompleteRide}
            className="bg-green-600 rounded-xl py-4 items-center justify-center active:bg-green-700"
          >
            <Text className="text-white font-bold text-lg">Complete Ride</Text>
          </Pressable>
        )}
        
        {rideStatus === 'completed' && (
          <Pressable
            onPress={() => navigation.navigate('DriverDashboard')}
            className="bg-blue-600 rounded-xl py-4 items-center justify-center active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg">Back to Dashboard</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}