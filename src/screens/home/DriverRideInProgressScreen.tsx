// screens/DriverRideInProgressScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import api from '@/api/axios';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Use your actual backend URL
const socket = io('http://localhost:10000', {
  transports: ['websocket'],
  autoConnect: true
});

// Define TypeScript types
type RootStackParamList = {
  DriverDashboard: undefined;
  DriverRideInProgress: {
    bookingId: string;
    driverId?: string;
  };
};

type RideInProgressRouteProp = RouteProp<RootStackParamList, 'DriverRideInProgress'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverDashboard'>;

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RideDetails {
  bookingId: string;
  fromLocation: string;
  toLocation: string;
  price: string;
  distance: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerRating?: number;
  customerPhoto?: string;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  status: string;
  vehicleType: string;
  userId: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
}

export default function DriverRideInProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RideInProgressRouteProp>();
  const { bookingId, driverId: routeDriverId } = route.params;

  // States
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<Coordinate | null>(null);
  const [riderLocation, setRiderLocation] = useState<Coordinate | null>(null);
  const [distanceToRider, setDistanceToRider] = useState<string>('Calculating...');
  const [rideStatus, setRideStatus] = useState<'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [timer, setTimer] = useState(0);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [isLocationReady, setIsLocationReady] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  
  // Use driver ID from route or from fetched ride details
  const [driverId, setDriverId] = useState<string>(routeDriverId || '');
  
  const mapRef = useRef<MapView>(null);
  const routeMapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const socketConnectedRef = useRef<boolean>(false);
  const initialFetchRef = useRef<boolean>(false);

  // Fetch ride details from API
  const fetchRideDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`📋 Fetching booking details for: ${bookingId}`);
      
      const response = await api.get(`/api/bookings/${bookingId}`);
      
      if (response.data.success) {
        const details = response.data.data;
        console.log('✅ Ride details fetched:', {
          status: details.status,
          driverName: details.driverName,
          driverId: details.driverId
        });
        
        setRideDetails(details);
        setRideStatus(details.status || 'PENDING');
        
        // Set driver ID from ride details if available
        if (details.driverId && !driverId) {
          console.log('🚗 Setting driver ID from ride details:', details.driverId);
          setDriverId(details.driverId);
        }
        
        // If driver is assigned, we don't need to look for available drivers
        if (details.driverName && details.driverPhone) {
          console.log('✅ Driver already assigned:', details.driverName);
        }
      } else {
        setError('Failed to fetch ride details');
      }
    } catch (err: any) {
      console.error('❌ Error fetching ride details:', err);
      setError(err.response?.data?.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  }, [bookingId, driverId]);

  // Fetch ride details on component mount - ONLY ONCE
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchRideDetails();
    }
  }, [fetchRideDetails]);

  // Coordinates calculation with proper validation
  const pickupCoords: Coordinate = rideDetails ? {
    latitude: rideDetails.pickupLat && !isNaN(rideDetails.pickupLat) ? rideDetails.pickupLat : 28.6328,
    longitude: rideDetails.pickupLng && !isNaN(rideDetails.pickupLng) ? rideDetails.pickupLng : 77.2197,
  } : { latitude: 28.6328, longitude: 77.2197 };
  
  const dropCoords: Coordinate = rideDetails ? {
    latitude: rideDetails.dropLat && !isNaN(rideDetails.dropLat) ? rideDetails.dropLat : 28.6129,
    longitude: rideDetails.dropLng && !isNaN(rideDetails.dropLng) ? rideDetails.dropLng : 77.2295,
  } : { latitude: 28.6129, longitude: 77.2295 };

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

  // Calculate distance function
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  }, []);

  // Socket connection - ONLY when we have driverId and rideDetails
  useEffect(() => {
    if (!rideDetails || !driverId || socketConnectedRef.current) return;

    console.log('🔌 Setting up socket connection for driver:', driverId);
    socketConnectedRef.current = true;

    // Register driver with socket
    socket.emit('register_user', { 
      userId: driverId, 
      userType: 'driver' 
    });

    // Register rider with socket
    socket.emit('register_user', {
      userId: rideDetails.userId,
      userType: 'rider'
    });

    // Listen for rider location updates
    const handleLocationUpdate = (data: any) => {
      if (data.userId === rideDetails.userId && data.latitude && data.longitude) {
        console.log('📍 Rider location updated:', data);
        const newRiderLocation = {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        };
        
        if (isValidCoordinate(newRiderLocation)) {
          setRiderLocation(newRiderLocation);
        }
      }
    };

    // Listen for ride status updates
    const handleStatusUpdate = (data: any) => {
      if (data.bookingId === bookingId) {
        console.log('🔄 Ride status updated via socket:', data.status);
        setRideStatus(data.status);
        
        // Refresh ride details when status changes
        fetchRideDetails();
      }
    };

    // Socket connection events
    const handleConnect = () => {
      console.log('✅ Connected to socket server');
    };

    const handleDisconnect = () => {
      console.log('❌ Disconnected from socket server');
      socketConnectedRef.current = false;
    };

    const handleError = (error: any) => {
      console.error('❌ Socket error:', error);
    };

    socket.on('location_updated', handleLocationUpdate);
    socket.on('ride_status_updated', handleStatusUpdate);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('location_updated', handleLocationUpdate);
      socket.off('ride_status_updated', handleStatusUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      socketConnectedRef.current = false;
    };
  }, [rideDetails, driverId, bookingId, fetchRideDetails]);

  // Driver location tracking - ONLY when we have driverId
  useEffect(() => {
    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        console.log('📍 Starting location tracking for driver:', driverId);
        
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
          console.log('📍 Current driver location:', coords);
          setDriverLocation(coords);
          setIsLocationReady(true);

          // Calculate initial distance
          if (rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED') {
            const distToPickup = calculateDistance(
              coords.latitude,
              coords.longitude,
              pickupCoords.latitude,
              pickupCoords.longitude
            );
            setDistanceToRider(`${distToPickup} km to pickup`);
          }

          // Send location to server
          if (driverId) {
            socket.emit('update_location', {
              userId: driverId,
              userType: 'driver',
              latitude: coords.latitude,
              longitude: coords.longitude,
              bookingId: bookingId
            });
          }

          // Start watching position
          locationSubscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 10000, // 10 seconds
              distanceInterval: 50,
            },
            (newLocation) => {
              const newCoords = newLocation.coords;
              
              if (isMounted && isValidCoordinate(newCoords)) {
                setDriverLocation(newCoords);
                
                // Calculate distance to pickup/drop based on ride status
                if (rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED') {
                  const distToPickup = calculateDistance(
                    newCoords.latitude,
                    newCoords.longitude,
                    pickupCoords.latitude,
                    pickupCoords.longitude
                  );
                  setDistanceToRider(`${distToPickup} km to pickup`);
                } else if (rideStatus === 'STARTED') {
                  const distToDrop = calculateDistance(
                    newCoords.latitude,
                    newCoords.longitude,
                    dropCoords.latitude,
                    dropCoords.longitude
                  );
                  setDistanceToRider(`${distToDrop} km to destination`);
                }

                // Send location update to server
                if (driverId) {
                  socket.emit('update_location', {
                    userId: driverId,
                    userType: 'driver',
                    latitude: newCoords.latitude,
                    longitude: newCoords.longitude,
                    bookingId: bookingId
                  });
                }
              }
            }
          );
        }

      } catch (error) {
        console.error('❌ Error getting location:', error);
        if (isMounted) {
          setIsLocationReady(true);
        }
      }
    };

    if (driverId && !locationSubscriptionRef.current) {
      startLocationTracking();
    }

    return () => {
      isMounted = false;
      if (locationSubscriptionRef.current) {
        console.log('🧹 Cleaning up location tracking');
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, [driverId, bookingId, rideStatus, calculateDistance, pickupCoords, dropCoords]);

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
    if (rideDetails) {
      Linking.openURL(`tel:${rideDetails.customerPhone}`);
    }
  };

  const handleUpdateStatus = async (newStatus: 'ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      console.log(`🔄 Updating ride status to: ${newStatus}`);
      
      // Update via API
      const response = await api.put(`/api/bookings/${bookingId}/status`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
        // Update via socket
        socket.emit('update_ride_status', {
          bookingId,
          status: newStatus,
          driverId: driverId
        });
        
        setRideStatus(newStatus);
        
        // Show route map when ride starts
        if (newStatus === 'STARTED') {
          setShowRouteMap(true);
          openGoogleMaps(pickupCoords, dropCoords);
        }
        
        if (newStatus === 'COMPLETED') {
          Alert.alert(
            'Ride Completed!',
            `You have earned ₹${rideDetails?.price}`,
            [
              {
                text: 'Back to Dashboard',
                onPress: () => navigation.navigate('DriverDashboard'),
              },
            ]
          );
        }
        
        if (newStatus === 'CANCELLED') {
          Alert.alert(
            'Ride Cancelled',
            'The ride has been cancelled',
            [
              {
                text: 'Back to Dashboard',
                onPress: () => navigation.navigate('DriverDashboard'),
              },
            ]
          );
        }
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      Alert.alert('Error', 'Failed to update ride status');
    }
  };


  const openGoogleMaps = (from: Coordinate, to: Coordinate) => {
  const scheme = Platform.select({
    ios: `comgooglemaps://?saddr=${from.latitude},${from.longitude}&daddr=${to.latitude},${to.longitude}&directionsmode=driving`,
    android: `google.navigation:q=${to.latitude},${to.longitude}&mode=d`,
  });
  const fallback = `https://www.google.com/maps/dir/${from.latitude},${from.longitude}/${to.latitude},${to.longitude}`;

  Linking.canOpenURL(scheme!)
    .then(supported => supported && Linking.openURL(scheme!))
    .catch(() => Linking.openURL(fallback));
};


  const getNextAction = () => {
    switch (rideStatus) {
      case 'PENDING':
      case 'ACCEPTED':
        return { 
          label: 'I Have Arrived', 
          action: () => handleUpdateStatus('ARRIVED'),
          color: 'bg-green-600'
        };
      case 'ARRIVED':
        return { 
          label: 'Start Ride', 
          action: () => handleUpdateStatus('STARTED'),

          color: 'bg-blue-600'
        };
      case 'STARTED':
        return { 
          label: 'Complete Ride', 
          action: () => handleUpdateStatus('COMPLETED'),
          color: 'bg-purple-600'
        };
      default:
        return null;
    }
  };

  const getCancelAction = () => {
    if (rideStatus === 'PENDING' || rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED') {
      return {
        label: 'Cancel Ride',
        action: () => {
          Alert.alert(
            'Cancel Ride',
            'Are you sure you want to cancel this ride?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', onPress: () => handleUpdateStatus('CANCELLED') }
            ]
          );
        },
        color: 'bg-red-600'
      };
    }
    return null;
  };

  const fitToMarkers = useCallback(() => {
    if (mapRef.current && driverLocation && isValidCoordinate(driverLocation)) {
      const coordinates = [driverLocation];
      
      if (rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED') {
        if (isValidCoordinate(pickupCoords)) {
          coordinates.push(pickupCoords);
        }
      } else if (rideStatus === 'STARTED') {
        if (isValidCoordinate(dropCoords)) {
          coordinates.push(dropCoords);
        }
      }
      
      if (coordinates.length > 1) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [driverLocation, rideStatus, pickupCoords, dropCoords]);

  const fitRouteToMarkers = useCallback(() => {
    if (routeMapRef.current && isValidCoordinate(pickupCoords) && isValidCoordinate(dropCoords)) {
      const coordinates = [pickupCoords, dropCoords];
      
      routeMapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  }, [pickupCoords, dropCoords]);

  const getMapRegion = useCallback(() => {
    if (driverLocation && isValidCoordinate(driverLocation)) {
      return {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    // Default to pickup location if no driver location
    return {
      latitude: pickupCoords.latitude,
      longitude: pickupCoords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [driverLocation, pickupCoords]);

  const getRouteMapRegion = useCallback(() => {
    const centerLat = (pickupCoords.latitude + dropCoords.latitude) / 2;
    const centerLng = (pickupCoords.longitude + dropCoords.longitude) / 2;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.abs(pickupCoords.latitude - dropCoords.latitude) * 1.5 + 0.02,
      longitudeDelta: Math.abs(pickupCoords.longitude - dropCoords.longitude) * 1.5 + 0.02,
    };
  }, [pickupCoords, dropCoords]);

  // Show driver assignment status
  const renderDriverStatus = () => {
    if (!rideDetails) return null;

    if (rideDetails.driverName && rideDetails.driverPhone) {
      return (
        <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View className="ml-3 flex-1">
              <Text className="text-green-800 font-bold">Driver Assigned</Text>
              <Text className="text-green-700">{rideDetails.driverName} • {rideDetails.driverVehicle}</Text>
              <Text className="text-green-600 text-sm">{rideDetails.driverPhone}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#F59E0B" />
          <View className="ml-3 flex-1">
            <Text className="text-yellow-800 font-bold">Looking for available driver...</Text>
            <Text className="text-yellow-700 text-sm">Please wait while we find a driver for your ride</Text>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 text-lg mt-4">Loading ride details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !rideDetails) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-red-500 text-lg mt-4 text-center">
          {error || 'Ride details not found'}
        </Text>
        <Pressable
          onPress={fetchRideDetails}
          className="bg-blue-600 rounded-xl px-6 py-3 mt-4"
        >
          <Text className="text-white font-bold">Retry</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('DriverDashboard')}
          className="bg-gray-600 rounded-xl px-6 py-3 mt-2"
        >
          <Text className="text-white font-bold">Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const nextAction = getNextAction();
  const cancelAction = getCancelAction();

  // Route Map Component
  const RouteMapComponent = () => (
    <View style={{ flex: 1 }}>
      <MapView
        ref={routeMapRef}
        style={{ flex: 1 }}
        region={getRouteMapRegion()}
        onLayout={fitRouteToMarkers}
        showsUserLocation={false}
      >
        {isValidCoordinate(pickupCoords) && (
          <Marker
            coordinate={pickupCoords}
            title="Pickup Location"
            description={rideDetails.fromLocation}
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

        {isValidCoordinate(dropCoords) && (
          <Marker
            coordinate={dropCoords}
            title="Drop Location"
            description={rideDetails.toLocation}
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

        {isValidCoordinate(pickupCoords) && isValidCoordinate(dropCoords) && (
          <Polyline
            coordinates={[pickupCoords, dropCoords]}
            strokeColor="#3B82F6"
            strokeWidth={5}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <TouchableOpacity
        onPress={() => setShowRouteMap(false)}
        className="absolute top-16 right-4 bg-black/70 rounded-full p-3"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      <View className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg">
        <Text className="font-bold text-gray-800 text-lg mb-2">Route Overview</Text>
        
        <View className="space-y-3">
          <View className="flex-row items-start">
            <View className="bg-green-100 rounded-full p-2 mr-3">
              <Ionicons name="location" size={16} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">PICKUP</Text>
              <Text className="text-gray-800 font-medium" numberOfLines={2}>
                {rideDetails.fromLocation}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="bg-red-100 rounded-full p-2 mr-3">
              <Ionicons name="flag" size={16} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">DROP</Text>
              <Text className="text-gray-800 font-medium" numberOfLines={2}>
                {rideDetails.toLocation}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <View>
              <Text className="text-gray-600 text-sm">Distance</Text>
              <Text className="text-gray-800 font-bold">{rideDetails.distance} km</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Fare</Text>
              <Text className="text-green-600 font-bold text-lg">₹{rideDetails.price}</Text>
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 p-4 pt-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => navigation.navigate('DriverDashboard')}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold text-center flex-1">
            {rideStatus === 'PENDING' && 'Ride Requested'}
            {rideStatus === 'ACCEPTED' && 'Head to pickup location'}
            {rideStatus === 'ARRIVED' && 'You have arrived at pickup'}
            {rideStatus === 'STARTED' && 'Ride in progress'}
            {rideStatus === 'COMPLETED' && 'Ride completed'}
            {rideStatus === 'CANCELLED' && 'Ride cancelled'}
          </Text>
          <View className="w-8" /> {/* Spacer for balance */}
        </View>
        <Text className="text-blue-100 text-center mt-1">
          {distanceToRider}
        </Text>
      </View>

      {/* Map */}
      <View style={{ flex: isMapFullScreen ? 1 : 0.4 }}>
        <MapView
          ref={mapRef}
          style={{
            width: screenWidth,
            height: '100%',
          }}
          region={getMapRegion()}
          showsUserLocation={true}
          followsUserLocation={true}
          onLayout={fitToMarkers}
        >
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

          {isValidCoordinate(pickupCoords) && (
            <Marker
              coordinate={pickupCoords}
              title="Pickup Location"
              description={rideDetails.fromLocation}
            >
              <View className="items-center justify-center">
                <View className="bg-green-500 rounded-full p-2 border-2 border-white">
                  <Ionicons name="person" size={16} color="white" />
                </View>
                <Text className="text-green-600 font-bold text-xs mt-1 bg-white/80 px-1 rounded">
                  PICKUP
                </Text>
              </View>
            </Marker>
          )}

          {isValidCoordinate(dropCoords) && (
            <Marker
              coordinate={dropCoords}
              title="Drop Location"
              description={rideDetails.toLocation}
            >
              <View className="items-center justify-center">
                <View className="bg-red-500 rounded-full p-2 border-2 border-white">
                  <Ionicons name="flag" size={16} color="white" />
                </View>
                <Text className="text-red-600 font-bold text-xs mt-1 bg-white/80 px-1 rounded">
                  DROP
                </Text>
              </View>
            </Marker>
          )}

          {/* Route from driver to pickup */}
          {rideStatus === 'ACCEPTED' && driverLocation && isValidCoordinate(driverLocation) && isValidCoordinate(pickupCoords) && (
            <Polyline
              coordinates={[driverLocation, pickupCoords]}
              strokeColor="#3B82F6"
              strokeWidth={4}
            />
          )}

          {/* Route from driver to drop */}
          {rideStatus === 'STARTED' && driverLocation && isValidCoordinate(driverLocation) && isValidCoordinate(dropCoords) && (
            <Polyline
              coordinates={[driverLocation, dropCoords]}
              strokeColor="#10B981"
              strokeWidth={4}
            />
          )}
        </MapView>

        <TouchableOpacity
          onPress={() => setIsMapFullScreen(!isMapFullScreen)}
          className="absolute top-4 right-4 bg-black/70 rounded-full p-2"
        >
          <Ionicons 
            name={isMapFullScreen ? "contract" : "expand"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>

        {rideStatus === 'STARTED' && (
          <TouchableOpacity
            onPress={() => setShowRouteMap(true)}
            className="absolute top-16 right-4 bg-black/70 rounded-full p-2"
          >
            <Ionicons name="map" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {!isMapFullScreen && (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Driver Assignment Status */}
          {renderDriverStatus()}

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
                    {rideDetails.customerName}
                  </Text>
                  <Text className="text-gray-600">{rideDetails.customerPhone}</Text>
                  {rideDetails.customerRating && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {rideDetails.customerRating.toFixed(1)}
                      </Text>
                    </View>
                  )}
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
                  <Text className="text-gray-800 font-medium" numberOfLines={2}>
                    {rideDetails.fromLocation}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Ionicons name="flag" size={20} color="#EF4444" style={{ marginTop: 2 }} />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-600 text-sm">DROP</Text>
                  <Text className="text-gray-800 font-medium" numberOfLines={2}>
                    {rideDetails.toLocation}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Ionicons name="car" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-600 text-sm">VEHICLE TYPE</Text>
                  <Text className="text-gray-800 font-medium">{rideDetails.vehicleType}</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Ionicons name="time" size={20} color="#8B5CF6" style={{ marginTop: 2 }} />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-600 text-sm">RIDE DURATION</Text>
                  <Text className="text-gray-800 font-medium">{formatTime(timer)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ride Summary */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-gray-600 text-sm">Distance</Text>
                <Text className="text-lg font-bold text-gray-800">{rideDetails.distance} km</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-600 text-sm">Fare</Text>
                <Text className="text-green-600 font-bold text-lg">₹{rideDetails.price}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-600 text-sm">Timer</Text>
                <Text className="text-lg font-bold text-gray-800">{formatTime(timer)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Action Buttons - Only show if driver is assigned */}
      {rideDetails.driverName && (
        <View className="p-4 border-t border-gray-200">
          <View className="space-y-3">
            {nextAction && (
              <Pressable
                onPress={nextAction.action}
                className={`${nextAction.color} rounded-xl p-4 items-center justify-center active:opacity-80`}
              >
                <Text className="text-white text-lg font-bold">{nextAction.label}</Text>
              </Pressable>
            )}
            
            {cancelAction && (
              <Pressable
                onPress={cancelAction.action}
                className={`${cancelAction.color} rounded-xl p-4 items-center justify-center active:opacity-80`}
              >
                <Text className="text-white text-lg font-bold">{cancelAction.label}</Text>
              </Pressable>
            )}

            {rideStatus === 'COMPLETED' && (
              <Pressable
                onPress={() => navigation.navigate('DriverDashboard')}
                className="bg-gray-600 rounded-xl p-4 items-center justify-center active:opacity-80"
              >
                <Text className="text-white text-lg font-bold">Back to Dashboard</Text>
              </Pressable>
            )}
          </View>
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