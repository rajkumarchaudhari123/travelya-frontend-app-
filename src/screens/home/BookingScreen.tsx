import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
  TouchableOpacity,
  Linking
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '@/api/axios';

type RootStackParamList = {
  DestinationSearch: undefined;
  BookingScreen: {
    bookingId: string;
  };
};

type BookingScreenRouteProp = RouteProp<RootStackParamList, 'BookingScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingScreen'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BookingScreen() {
  const route = useRoute<BookingScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { bookingId } = route.params;

  const [bookingData, setBookingData] = useState<any>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [eta, setEta] = useState<string>('5-10 min');
  const [bookingStatus, setBookingStatus] = useState<'confirmed' | 'driver_assigned' | 'arriving' | 'ongoing' | 'completed'>('confirmed');
  const [progress] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // New state variables for driver tracking
  const [driverLocation, setDriverLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [distanceToDriver, setDistanceToDriver] = useState<string>('Calculating...');
  const [liveEta, setLiveEta] = useState<string>('Calculating...');
  const [mapRegion, setMapRegion] = useState<any>(null);

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Need location permission to track driver');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });

      // Set map region to user location
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      return { latitude, longitude };
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
  };

  // Calculate ETA based on distance and traffic
  const calculateETA = (distance: number): string => {
    const avgSpeed = 20; // km/h in city traffic
    const timeInMinutes = (distance / avgSpeed) * 60;

    if (timeInMinutes < 2) return '1-2 min';
    if (timeInMinutes < 5) return '2-5 min';
    if (timeInMinutes < 10) return '5-10 min';
    if (timeInMinutes < 15) return '10-15 min';
    return '15+ min';
  };

  // Simulate driver location (in real app, this would come from API)
  const simulateDriverLocation = (userLat: number, userLng: number) => {
    // Simulate driver location 2km away in random direction
    const offset = 0.02; // ~2km
    const driverLat = userLat + (Math.random() - 0.5) * offset;
    const driverLng = userLng + (Math.random() - 0.5) * offset;

    return {
      latitude: driverLat,
      longitude: driverLng
    };
  };

  // Fetch booking info from API - IMPROVED REAL-TIME UPDATES
// BookingScreen.tsx में fetchBooking function को update करें

// Fetch booking info from API - FIXED VERSION
// BookingScreen.tsx में fetchBooking function को replace करें

// Fetch booking info from API - FIXED VERSION
useEffect(() => {
  let pollInterval: ReturnType<typeof setInterval>;

  const fetchBooking = async () => {
    try {
      console.log('🔍 Fetching booking:', bookingId);

      const response = await api.get(`/api/bookings/${bookingId}`);
      console.log('✅ Booking API Response:', response.data);

      if (response.data.success) {
        const bookingData = response.data.data;
        setBookingData(bookingData);

        // Get user location for tracking
        const userLoc = await getUserLocation();

        // DEBUG: Check what data we're getting
        console.log('📋 Booking Data:', {
          id: bookingData.id,
          driverId: bookingData.driverId,
          driverName: bookingData.driverName,
          driver: bookingData.driver,
          status: bookingData.status
        });

        // SIMPLIFIED DRIVER CHECK - Just check if driverId exists
        if (bookingData.driverId) {
          console.log('🚗 Driver FOUND in booking data');
          
          // Create driver info from available data
          const driverData = {
            id: bookingData.driverId,
            name: bookingData.driverName || 'Driver',
            phone: bookingData.driver?.phone || 'Not available',
            vehicleNumber: bookingData.driver?.vehicleNumber || 'Not available',
            rating: '4.8'
          };

          console.log('👨‍🚀 Driver Data to display:', driverData);
          setDriverInfo(driverData);
          setBookingStatus('driver_assigned');

          // Simulate driver location
          if (userLoc) {
            const driverLoc = simulateDriverLocation(userLoc.latitude, userLoc.longitude);
            setDriverLocation(driverLoc);

            const distance = calculateDistance(
              userLoc.latitude,
              userLoc.longitude,
              driverLoc.latitude,
              driverLoc.longitude
            );
            setDistanceToDriver(distance);

            const distanceInKm = parseFloat(distance.replace(' km', '')) || 2.0;
            const eta = calculateETA(distanceInKm);
            setLiveEta(eta);
          }
        } else {
          console.log('⏳ No driverId found, waiting for driver...');
          setDriverInfo(null);
          setBookingStatus('confirmed');
        }
      } else {
        console.log('❌ Booking not found in response');
        Alert.alert('Error', 'Booking not found');
        navigation.navigate('DestinationSearch');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('❌ Fetch booking error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  fetchBooking();

  // Set up polling for real-time updates - every 3 seconds
  pollInterval = setInterval(fetchBooking, 3000);

  // Cleanup interval on unmount
  return () => {
    if (pollInterval) clearInterval(pollInterval);
  };
}, [bookingId]);

  // Track driver location in real-time
  useEffect(() => {
    if (!driverInfo || !userLocation) return;

    let interval: ReturnType<typeof setInterval>;

    const trackDriverLocation = async () => {
      try {
        // In real app, get driver location from API
        // const response = await api.get(`/api/drivers/${driverInfo.id}/location`);

        // For demo, simulate driver moving closer to user
        if (driverLocation && userLocation) {
          const currentDistance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            driverLocation.latitude,
            driverLocation.longitude
          );

          const distanceInKm = parseFloat(currentDistance.replace(' km', '')) || 2.0;

          if (distanceInKm > 0.1) {
            // Move driver 10% closer to user
            const newDriverLat = driverLocation.latitude + (userLocation.latitude - driverLocation.latitude) * 0.1;
            const newDriverLng = driverLocation.longitude + (userLocation.longitude - driverLocation.longitude) * 0.1;

            const newDriverLocation = {
              latitude: newDriverLat,
              longitude: newDriverLng
            };

            setDriverLocation(newDriverLocation);

            // Recalculate distance and ETA
            const newDistance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              newDriverLat,
              newDriverLng
            );
            setDistanceToDriver(newDistance);

            const newDistanceInKm = parseFloat(newDistance.replace(' km', '')) || 0;
            const newEta = calculateETA(newDistanceInKm);
            setLiveEta(newEta);

            // Update booking status based on distance
            if (newDistanceInKm < 0.5) {
              setBookingStatus('arriving');
            }
          }
        }
      } catch (error) {
        console.log('Error tracking driver location:', error);
      }
    };

    // Track every 5 seconds
    interval = setInterval(trackDriverLocation, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [driverInfo, userLocation, driverLocation]);

  useEffect(() => {
    if (bookingStatus === 'driver_assigned') {
      const timer = setTimeout(() => {
        setBookingStatus('arriving');
        setEta('2-5 min');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleCancelBooking = async () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              console.log('❌ Cancelling booking:', bookingId);

              const response = await api.post(`/api/bookings/${bookingId}/cancel`);

              if (response.data.success) {
                Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
                navigation.navigate('DestinationSearch');
              } else {
                throw new Error(response.data.message);
              }
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              console.log('❌ Cancel booking error:', errorMessage);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleContactDriver = () => {
    if (driverInfo?.phone && driverInfo.phone !== 'Not available') {
      Alert.alert(
        'Contact Driver',
        `Driver: ${driverInfo.name}\nVehicle: ${driverInfo.vehicleNumber}\n\nCall ${driverInfo.phone}?`,
        [
          {
            text: 'Call',
            onPress: () => {
              Linking.openURL(`tel:${driverInfo.phone}`)
                .catch(() => Alert.alert('Error', 'Cannot make call'));
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('Info', 'Driver phone number not available yet');
    }
  };

  const toggleMapExpanded = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  const getStatusColor = () => {
    switch (bookingStatus) {
      case 'confirmed': return 'bg-green-500';
      case 'driver_assigned': return 'bg-blue-500';
      case 'arriving': return 'bg-yellow-500';
      case 'ongoing': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (bookingStatus) {
      case 'confirmed': return 'Looking for Driver';
      case 'driver_assigned': return 'Driver Assigned';
      case 'arriving': return 'Driver Arriving';
      case 'ongoing': return 'Trip Ongoing';
      case 'completed': return 'Trip Completed';
      default: return 'Looking for Driver';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'auto': return 'bicycle';
      case 'mini car': return 'car-sport';
      case 'sedan': return 'car';
      case 'suv': return 'car-sport';
      case '7-seater': return 'people';
      default: return 'car';
    }
  };

  const getVehicleColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'auto': return 'text-red-500';
      case 'mini car': return 'text-blue-500';
      case 'sedan': return 'text-green-500';
      case 'suv': return 'text-yellow-500';
      case '7-seater': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  // Map Component
  const MapComponent = ({ expanded = false }) => (
    <View style={{
      width: expanded ? screenWidth : '100%',
      height: expanded ? screenHeight : 200
    }}>
      <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="Pickup point"
          >
            <View className="bg-green-500 w-6 h-6 rounded-full border-2 border-white justify-center items-center">
              <Ionicons name="location" size={12} color="white" />
            </View>
          </Marker>
        )}

        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title={`Driver: ${driverInfo?.name}`}
            description={`ETA: ${liveEta}`}
          >
            <View className="bg-blue-500 w-8 h-8 rounded-full border-2 border-white justify-center items-center">
              <Ionicons name="car-sport" size={16} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Expand/Close Button */}
      <TouchableOpacity
        onPress={toggleMapExpanded}
        className={`absolute ${expanded ? 'top-16 right-4' : 'top-2 right-2'} bg-black/70 rounded-full p-2`}
      >
        <Ionicons
          name={expanded ? 'contract' : 'expand'}
          size={20}
          color="white"
        />
      </TouchableOpacity>

      {/* Live Tracking Info Overlay */}
      {!expanded && driverInfo && (
        <View className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-lg p-3 shadow">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-600 text-xs">Driver is</Text>
              <Text className="font-bold text-gray-800 text-sm">
                {distanceToDriver} away
              </Text>
            </View>
            <View>
              <Text className="text-gray-600 text-xs">ETA</Text>
              <Text className="font-bold text-green-600 text-sm">{liveEta}</Text>
            </View>
            <View>
              <Text className="text-gray-600 text-xs">Status</Text>
              <Text className="font-bold text-blue-600 text-sm">
                {bookingStatus === 'arriving' ? 'Arriving' : 'On the way'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // Responsive sizing
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth >= 414;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-600 mt-4 text-lg">Loading booking details...</Text>
      </View>
    );
  }

  if (!bookingData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle" size={60} color="#EF4444" />
        <Text className="text-gray-600 mt-4 text-lg">Booking not found</Text>
        <Pressable
          className="mt-6 bg-green-500 px-6 py-3 rounded-xl"
          onPress={() => navigation.navigate('DestinationSearch')}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { vehicleType, fromLocation, toLocation, price, distance } = bookingData;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        className="pt-16 pb-6 rounded-b-3xl"
      >
        <View className="flex-row items-center px-5">
          <Pressable
            className="p-2 mr-3"
            onPress={() => navigation.navigate('DestinationSearch')}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View className="flex-1">
            <Text className={`text-white font-bold ${isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-2xl' : 'text-xl'}`}>
              {getStatusText()}
            </Text>
            <Text className="text-green-100 text-sm mt-1">
              Booking ID: {bookingId}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-1 bg-green-400/30 mx-5 mt-4 rounded-full overflow-hidden">
          <Animated.View
            className={`h-full rounded-full ${getStatusColor()}`}
            style={{ width: progressWidth }}
          />
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Live Map Section */}
        {mapRegion && (
          <View className="bg-white mx-4 my-4 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <Text className="font-bold text-gray-800 text-lg">Live Tracking</Text>
              <Text className="text-gray-500 text-sm">
                {driverInfo ? 'Real-time driver location' : 'Waiting for driver assignment'}
              </Text>
            </View>

            <View className="h-48 relative">
              <MapComponent expanded={false} />

              {/* Click to expand instruction */}
              {driverInfo && (
                <View className="absolute top-2 left-2 bg-black/70 rounded-lg px-2 py-1">
                  <Text className="text-white text-xs">Tap map to expand</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Vehicle & Trip Info Card */}
        <View className="bg-white mx-4 my-4 p-6 rounded-2xl shadow-lg border border-gray-100">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center mr-4">
              <Ionicons
                name={getVehicleIcon(vehicleType) as any}
                size={28}
                className={getVehicleColor(vehicleType)}
              />
            </View>
            <View className="flex-1">
              <Text className={`font-bold text-gray-800 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
                {vehicleType || 'Standard'}
              </Text>
              <Text className="text-gray-500 text-base">
                {driverInfo ? `Live ETA: ${liveEta}` : 'Finding driver...'}
              </Text>
              {driverInfo && (
                <Text className="text-blue-600 text-sm font-medium">
                  {distanceToDriver} • {driverInfo.name} is coming
                </Text>
              )}
            </View>
            <View className="items-end">
              <Text className={`font-bold text-green-600 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
                ₹{price || '0'}
              </Text>
              <Text className="text-gray-500 text-sm">{distance || '0'} km</Text>
            </View>
          </View>
        </View>

        {/* Trip Details Card */}
        <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
          <Text className={`font-bold text-gray-800 mb-4 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
            Trip Details
          </Text>

          {/* Route Visualization */}
          <View className="items-center mb-4">
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <View className="w-0.5 h-10 bg-gray-300 my-1" />
            <View className="w-3 h-3 bg-red-500 rounded-full" />
          </View>

          {/* Locations */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-500 text-sm font-semibold mb-1">FROM</Text>
              <Text className="text-gray-800 text-base leading-6" numberOfLines={2}>
                {fromLocation || 'Pickup location not specified'}
              </Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm font-semibold mb-1">TO</Text>
              <Text className="text-gray-800 text-base leading-6" numberOfLines={2}>
                {toLocation || 'Destination not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Driver Info Card - IMPROVED */}
        {driverInfo ? (
          <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`font-bold text-gray-800 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
                Your Driver
              </Text>
              <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-700 text-sm font-medium">Ride Accepted</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-blue-500 rounded-full justify-center items-center mr-4">
                <Text className="text-white font-bold text-lg">
                  {driverInfo.name.charAt(0)}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">
                  {driverInfo.name} ✅
                </Text>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {driverInfo.rating}
                  </Text>
                  <Text className="text-gray-400 text-sm mx-2">•</Text>
                  <Ionicons name="car-sport" size={14} color="#6B7280" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {driverInfo.vehicleNumber}
                  </Text>
                </View>

                {/* Driver Phone Number Display */}
                <View className="flex-row items-center mt-1">
                  <Ionicons name="call" size={14} color="#3B82F6" />
                  <Text className="text-blue-600 text-sm font-medium ml-1">
                    {driverInfo.phone}
                  </Text>
                </View>

                {/* Live Distance Info */}
                <View className="flex-row items-center mt-2">
                  <Ionicons name="navigate" size={14} color="#EF4444" />
                  <Text className="text-red-600 text-sm font-medium ml-1">
                    {distanceToDriver} away
                  </Text>
                  <Text className="text-gray-400 text-sm mx-2">•</Text>
                  <Ionicons name="time" size={14} color="#10B981" />
                  <Text className="text-green-600 text-sm font-medium ml-1">
                    ETA: {liveEta}
                  </Text>
                </View>
              </View>

              <Pressable
                className="p-3 bg-blue-50 rounded-full"
                onPress={handleContactDriver}
              >
                <Ionicons name="call" size={20} color="#3B82F6" />
              </Pressable>
            </View>
          </View>
        ) : (
          // Show loading state while searching for driver
          <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-600 ml-3 text-lg">Looking for available drivers...</Text>
            </View>
            <Text className="text-gray-500 text-center mt-2">
              We're finding the best driver for your ride
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View className="bg-white border-t border-gray-200 px-4 py-4 flex-row space-x-3">
        <Pressable
          className="flex-1 flex-row items-center justify-center py-4 rounded-xl border border-red-200 bg-red-50 space-x-2"
          onPress={handleCancelBooking}
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
          <Text className="text-red-600 font-semibold text-base">Cancel Ride</Text>
        </Pressable>

        <Pressable
          className="flex-1 flex-row items-center justify-center py-4 rounded-xl bg-green-500 space-x-2"
          onPress={() => Alert.alert('Help', 'What would you like to do?')}
        >
          <Ionicons name="help-circle" size={20} color="white" />
          <Text className="text-white font-semibold text-base">Help</Text>
        </Pressable>
      </View>

      {/* Expanded Map Modal */}
      <Modal
        visible={isMapExpanded}
        animationType="fade"
        statusBarTranslucent={true}
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-black">
          <MapComponent expanded={true} />

          {/* Close Button */}
          <TouchableOpacity
            onPress={toggleMapExpanded}
            className="absolute top-16 left-4 bg-black/70 rounded-full p-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Map Instructions */}
          {driverInfo && (
            <View className="absolute bottom-20 left-4 right-4 bg-white/90 rounded-lg p-4">
              <Text className="font-bold text-gray-800 text-lg mb-2">Live Driver Tracking</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-600 text-sm">Driver Distance</Text>
                  <Text className="font-bold text-gray-800">{distanceToDriver}</Text>
                </View>
                <View>
                  <Text className="text-gray-600 text-sm">ETA</Text>
                  <Text className="font-bold text-green-600">{liveEta}</Text>
                </View>
                <View>
                  <Text className="text-gray-600 text-sm">Status</Text>
                  <Text className="font-bold text-blue-600">
                    {bookingStatus === 'arriving' ? 'Arriving' : 'On the way'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}