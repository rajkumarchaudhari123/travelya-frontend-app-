// DriverRideInProgressScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  Dimensions,
  ScrollView,
  Linking,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import io from 'socket.io-client';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const socket = io('http://localhost:3000'); // Your server URL

// Define TypeScript types for route parameters
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
    pickupLng: number;
    dropLat: number;
    dropLng: number;
  };
};

type RideInProgressRouteProp = RouteProp<RootStackParamList, 'DriverRideInProgress'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverDashboard'>;

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function DriverRideInProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RideInProgressRouteProp>();
  const { 
    bookingId, 
    fromLocation, 
    toLocation, 
    price, 
    distance, 
    customerName, 
    customerPhone,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
  } = route.params;

  const [driverLocation, setDriverLocation] = useState<Coordinate | null>(null);
  const [riderLocation, setRiderLocation] = useState<Coordinate | null>(null);
  const [distanceToRider, setDistanceToRider] = useState<string>('Calculating...');
  const [rideStatus, setRideStatus] = useState<'accepted' | 'arrived' | 'started' | 'completed'>('accepted');
  const [timer, setTimer] = useState(0);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [isLocationReady, setIsLocationReady] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false); // New state for route map modal
  const mapRef = useRef<MapView>(null);
  const routeMapRef = useRef<MapView>(null);

  // Real driver location coordinates with validation
  const pickupCoords: Coordinate = {
    latitude: pickupLat && !isNaN(pickupLat) ? pickupLat : 28.6328,
    longitude: pickupLng && !isNaN(pickupLng) ? pickupLng : 77.2197,
  };
  
  const dropCoords: Coordinate = {
    latitude: dropLat && !isNaN(dropLat) ? dropLat : 28.6129,
    longitude: dropLng && !isNaN(dropLng) ? dropLng : 77.2295,
  };

  // Validate coordinate function
  const isValidCoordinate = (coord: any): coord is Coordinate => {
    return (
      coord &&
      typeof coord.latitude === 'number' && 
      !isNaN(coord.latitude) &&
      typeof coord.longitude === 'number' && 
      !isNaN(coord.longitude)
    );
  };

  // Socket connection
  useEffect(() => {
    // Register driver with socket
    socket.emit('register_user', { 
      userId: `driver_${bookingId}`, 
      userType: 'driver' 
    });

    // Listen for rider location updates
    socket.on('location_updated', (data) => {
      if (data.userType === 'rider' && data.latitude && data.longitude) {
        const newRiderLocation = {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        };
        
        if (isValidCoordinate(newRiderLocation)) {
          setRiderLocation(newRiderLocation);
          
          // Recalculate distance to rider
          if (driverLocation && isValidCoordinate(driverLocation)) {
            const dist = calculateDistance(
              driverLocation.latitude,
              driverLocation.longitude,
              newRiderLocation.latitude,
              newRiderLocation.longitude
            );
            setDistanceToRider(`${dist} km`);
          }
        }
      }
    });

    // Listen for ride status updates
    socket.on('ride_status_updated', (data) => {
      setRideStatus(data.status);
    });

    return () => {
      socket.off('location_updated');
      socket.off('ride_status_updated');
    };
  }, [driverLocation, bookingId]);

  // Calculate distance function
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  // Driver location tracking
  useEffect(() => {
    let locationSubscription: any;
    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required.');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = currentLocation.coords;
        
        if (isMounted && isValidCoordinate(coords)) {
          setDriverLocation(coords);
          setIsLocationReady(true);

          // Send location to server
          socket.emit('update_location', {
            userId: `driver_${bookingId}`,
            userType: 'driver',
            latitude: coords.latitude,
            longitude: coords.longitude
          });

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (newLocation) => {
              const newCoords = newLocation.coords;
              
              if (isMounted && isValidCoordinate(newCoords)) {
                setDriverLocation(newCoords);
                
                // Send location update to server
                socket.emit('update_location', {
                  userId: `driver_${bookingId}`,
                  userType: 'driver',
                  latitude: newCoords.latitude,
                  longitude: newCoords.longitude
                });

                // Calculate distance to rider if rider location available
                if (riderLocation && isValidCoordinate(riderLocation)) {
                  const dist = calculateDistance(
                    newCoords.latitude,
                    newCoords.longitude,
                    riderLocation.latitude,
                    riderLocation.longitude
                  );
                  setDistanceToRider(`${dist} km`);
                }
              }
            }
          );
        }

      } catch (error) {
        console.error('Error getting location:', error);
        if (isMounted) {
          setIsLocationReady(true);
        }
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [riderLocation, bookingId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${customerPhone}`);
  };

  const handleUpdateStatus = async (newStatus: typeof rideStatus) => {
    setRideStatus(newStatus);
    
    // Update ride status on server
    socket.emit('update_ride_status', {
      bookingId,
      status: newStatus
    });
    
    // Show route map when ride starts
    if (newStatus === 'started') {
      setShowRouteMap(true);
    }
    
    if (newStatus === 'completed') {
      Alert.alert(
        'Ride Completed!',
        `You have earned ₹${price}`,
        [
          {
            text: 'Back to Dashboard',
            onPress: () => navigation.navigate('DriverDashboard'),
          },
        ]
      );
    }
  };

  const getNextAction = () => {
    switch (rideStatus) {
      case 'accepted':
        return { label: 'I Have Arrived', action: () => handleUpdateStatus('arrived') };
      case 'arrived':
        return { label: 'Start Ride', action: () => handleUpdateStatus('started') };
      case 'started':
        return { label: 'Complete Ride', action: () => handleUpdateStatus('completed') };
      default:
        return null;
    }
  };

  const fitToMarkers = () => {
    if (mapRef.current && driverLocation && isValidCoordinate(driverLocation)) {
      const coordinates = [driverLocation];
      
      if (rideStatus === 'accepted' || rideStatus === 'arrived') {
        coordinates.push(pickupCoords);
      } else if (rideStatus === 'started') {
        coordinates.push(dropCoords);
      }
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const fitRouteToMarkers = () => {
    if (routeMapRef.current && isValidCoordinate(pickupCoords) && isValidCoordinate(dropCoords)) {
      const coordinates = [pickupCoords, dropCoords];
      
      routeMapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  };

  const getMapRegion = () => {
    if (driverLocation && isValidCoordinate(driverLocation)) {
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

  const getRouteMapRegion = () => {
    // Center map between pickup and drop locations
    const centerLat = (pickupCoords.latitude + dropCoords.latitude) / 2;
    const centerLng = (pickupCoords.longitude + dropCoords.longitude) / 2;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.abs(pickupCoords.latitude - dropCoords.latitude) * 1.5 + 0.01,
      longitudeDelta: Math.abs(pickupCoords.longitude - dropCoords.longitude) * 1.5 + 0.01,
    };
  };

  const nextAction = getNextAction();

  // Route Map Component
  const RouteMapComponent = () => (
    <View style={{ flex: 1 }}>
      <MapView
        ref={routeMapRef}
        style={{ flex: 1 }}
        region={getRouteMapRegion()}
        onLayout={fitRouteToMarkers}
      >
        {/* Pickup Location */}
        {isValidCoordinate(pickupCoords) && (
          <Marker
            coordinate={pickupCoords}
            title="Pickup Location"
            description={fromLocation}
          >
            <View className="items-center justify-center">
              <View className="bg-green-500 rounded-full p-3 border-2 border-white">
                <Ionicons name="location" size={20} color="white" />
              </View>
              <Text className="text-green-600 font-bold text-xs mt-1 bg-white/80 px-1 rounded">
                PICKUP
              </Text>
            </View>
          </Marker>
        )}

        {/* Drop Location */}
        {isValidCoordinate(dropCoords) && (
          <Marker
            coordinate={dropCoords}
            title="Drop Location"
            description={toLocation}
          >
            <View className="items-center justify-center">
              <View className="bg-red-500 rounded-full p-3 border-2 border-white">
                <Ionicons name="flag" size={20} color="white" />
              </View>
              <Text className="text-red-600 font-bold text-xs mt-1 bg-white/80 px-1 rounded">
                DROP
              </Text>
            </View>
          </Marker>
        )}

        {/* Route Line */}
        {isValidCoordinate(pickupCoords) && isValidCoordinate(dropCoords) && (
          <Polyline
            coordinates={[pickupCoords, dropCoords]}
            strokeColor="#3B82F6"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Close Button */}
      <TouchableOpacity
        onPress={() => setShowRouteMap(false)}
        className="absolute top-16 right-4 bg-black/70 rounded-full p-3"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      {/* Route Info Overlay */}
      <View className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg">
        <Text className="font-bold text-gray-800 text-lg mb-2">Route Overview</Text>
        
        <View className="space-y-3">
          <View className="flex-row items-start">
            <View className="bg-green-100 rounded-full p-2 mr-3">
              <Ionicons name="location" size={16} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">PICKUP</Text>
              <Text className="text-gray-800 font-medium">{fromLocation}</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="bg-red-100 rounded-full p-2 mr-3">
              <Ionicons name="flag" size={16} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">DROP</Text>
              <Text className="text-gray-800 font-medium">{toLocation}</Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <View>
              <Text className="text-gray-600 text-sm">Distance</Text>
              <Text className="text-gray-800 font-bold">{distance} km</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Fare</Text>
              <Text className="text-green-600 font-bold text-lg">₹{price}</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Ride Time</Text>
              <Text className="text-gray-800 font-bold">{formatTime(timer)}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => setShowRouteMap(false)}
          className="bg-blue-600 rounded-xl py-3 mt-4 items-center justify-center"
        >
          <Text className="text-white font-bold text-lg">Close Route Map</Text>
        </Pressable>
      </View>
    </View>
  );

  // Show loading until location is ready
  if (!isLocationReady) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 text-lg">Getting your location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 p-4 pt-12">
        <Text className="text-white text-xl font-bold text-center">
          {rideStatus === 'accepted' && 'Head to pickup location'}
          {rideStatus === 'arrived' && 'You have arrived at pickup'}
          {rideStatus === 'started' && 'Ride in progress'}
          {rideStatus === 'completed' && 'Ride completed'}
        </Text>
        <Text className="text-blue-100 text-center mt-1">
          Distance to rider: {distanceToRider}
        </Text>
      </View>

      {/* Map */}
      <Pressable
        onPress={() => setIsMapFullScreen(!isMapFullScreen)}
        style={{ flex: 1 }}
      >
        <MapView
          ref={mapRef}
          style={{
            width: screenWidth,
            height: isMapFullScreen ? screenHeight : screenHeight * 0.4,
          }}
          region={getMapRegion()}
          showsUserLocation={true}
          followsUserLocation={true}
          onLayout={fitToMarkers}
        >
          {/* Driver Location - Only render if coordinates are valid */}
          {driverLocation && isValidCoordinate(driverLocation) && (
            <Marker
              coordinate={driverLocation}
              title="Your Location"
            >
              <View className="items-center justify-center">
                <View className="bg-blue-600 rounded-full p-2">
                  <Ionicons name="car-sport" size={20} color="white" />
                </View>
                <Text className="text-blue-600 font-bold text-xs mt-1">YOU</Text>
              </View>
            </Marker>
          )}

          {/* Rider/Pickup Location */}
          {isValidCoordinate(pickupCoords) && (
            <Marker
              coordinate={pickupCoords}
              title="Pickup Location"
              description={fromLocation}
            >
              <View className="items-center justify-center">
                <Ionicons name="person" size={24} color="#10B981" />
                <Text className="text-green-600 font-bold text-xs mt-1">RIDER</Text>
              </View>
            </Marker>
          )}

          {/* Drop Location */}
          {isValidCoordinate(dropCoords) && (
            <Marker
              coordinate={dropCoords}
              title="Drop Location"
              description={toLocation}
            >
              <View className="items-center justify-center">
                <Ionicons name="flag" size={24} color="#EF4444" />
                <Text className="text-red-600 font-bold text-xs mt-1">DROP</Text>
              </View>
            </Marker>
          )}

          {/* Route - Only render if coordinates are valid */}
          {rideStatus === 'accepted' && driverLocation && isValidCoordinate(driverLocation) && (
            <Polyline
              coordinates={[driverLocation, pickupCoords]}
              strokeColor="#3B82F6"
              strokeWidth={4}
            />
          )}
          {rideStatus === 'started' && driverLocation && isValidCoordinate(driverLocation) && (
            <Polyline
              coordinates={[driverLocation, dropCoords]}
              strokeColor="#10B981"
              strokeWidth={4}
            />
          )}
        </MapView>
      </Pressable>

      <ScrollView className="flex-1 p-4">
        {/* Customer Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Customer Details</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-gray-200 rounded-full p-3 mr-3">
                <Ionicons name="person" size={24} color="#4B5563" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">
                  {customerName}
                </Text>
                <Text className="text-gray-600">{customerPhone}</Text>
                <Text className="text-blue-600 text-sm mt-1">
                  {distanceToRider} away
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleCallCustomer}
              className="bg-green-100 rounded-full p-3"
            >
              <Ionicons name="call" size={20} color="#10B981" />
            </Pressable>
          </View>
        </View>

        {/* Ride Information */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Ride Information</Text>
          <View className="space-y-4">
            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#10B981" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-600 text-sm">PICKUP</Text>
                <Text className="text-gray-800 font-medium">{fromLocation}</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="flag" size={20} color="#EF4444" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-600 text-sm">DROP</Text>
                <Text className="text-gray-800 font-medium">{toLocation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ride Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-gray-600 text-sm">Distance</Text>
              <Text className="text-lg font-bold text-gray-800">{distance} km</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-600 text-sm">Fare</Text>
              <Text className="text-lg font-bold text-green-600">₹{price}</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-gray-600 text-sm">Timer</Text>
              <Text className="text-lg font-bold text-gray-800">{formatTime(timer)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {nextAction && (
        <View className="p-4 border-t border-gray-200">
          <Pressable
            onPress={nextAction.action}
            className="bg-green-600 rounded-xl p-4 items-center justify-center active:bg-green-700"
          >
            <Text className="text-white text-lg font-bold">{nextAction.label}</Text>
          </Pressable>
        </View>
      )}

      {/* Route Map Modal */}
      <Modal
        visible={showRouteMap}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <RouteMapComponent />
      </Modal>
    </View>
  );
}