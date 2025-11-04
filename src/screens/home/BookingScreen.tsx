import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Animated,
  Modal,
  TouchableOpacity,
  Linking,
  Text
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useBookingData } from '@/hooks/useBookingData';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useDriverTracking } from '@/hooks/useDriverTracking';
import { BookingHeader } from '@/components/Booking/BookingHeader';
import { LiveMap } from '@/components/Booking/LiveMap';
import { VehicleInfoCard } from '@/components/Booking/VehicleInfoCard';
import { TripDetailsCard } from '@/components/Booking/TripDetailsCard';
import { DriverInfoCard } from '@/components/Booking/DriverInfoCard';
import { BookingActions } from '@/components/Booking/BookingActions';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ErrorScreen } from '@/components/common/ErrorScreen';
import { RootStackParamList, BookingStatus, DriverInfo } from '@/types/booking.types';
import {
  BOOKING_POLLING_INTERVAL,
  INITIAL_ETA,
  BOOKING_STATUS,
  API_ENDPOINTS
} from '@/utils/constants';
import api from '@/api/axios';

type BookingScreenRouteProp = RouteProp<RootStackParamList, 'BookingScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingScreen'>;
type DestinationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DestinationSearch'>;

export default function BookingScreen() {
  const route = useRoute<BookingScreenRouteProp>();
  const { bookingId } = route.params || {};

  const navigation = useNavigation<NavigationProp>();
  const destinationNavigation = useNavigation<DestinationNavigationProp>();

  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(BOOKING_STATUS.CONFIRMED);
  const [progress] = useState(new Animated.Value(0));
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Add validation for bookingId
  const validatedBookingId = bookingId || '';

  const { bookingData, loading } = useBookingData(validatedBookingId);
  const { userLocation, mapRegion } = useLocationTracking();
  const { driverInfo, driverLocation, distanceToDriver, liveEta } = useDriverTracking(
    bookingData,
    userLocation,
    bookingStatus,
    setBookingStatus
  );

  // Log the bookingId for debugging
  useEffect(() => {
    console.log('📱 BookingScreen mounted with bookingId:', bookingId);
    console.log('🔍 Validated bookingId:', validatedBookingId);
  }, [bookingId, validatedBookingId]);

  useEffect(() => {
    if (bookingStatus === BOOKING_STATUS.DRIVER_ASSIGNED) {
      const timer = setTimeout(() => {
        setBookingStatus(BOOKING_STATUS.ARRIVING);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus]);

  // Calculate effective driver info - create from individual fields
// BookingScreen.tsx में
const effectiveDriverInfo: DriverInfo | null = React.useMemo(() => {
  console.log('🔍 Booking Data for driver:', bookingData);
  
  // Priority 1: Use driver object from database relation
  if (bookingData?.driver) {
    console.log('✅ Using driver from database relation:', bookingData.driver);
    return {
      id: bookingData.driver.id,
      name: bookingData.driver.fullName || bookingData.driver.name,
      phone: bookingData.driver.phone,
      vehicleNumber: bookingData.driver.vehicleNumber,
      rating: bookingData.driver.rating || '4.8'
    };
  }
  
  // Priority 2: Use individual driver fields
  if (bookingData?.driverName) {
    console.log('📱 Using individual driver fields:', bookingData.driverName);
    return {
      id: bookingData.driverId || `driver-${Date.now()}`,
      name: bookingData.driverName,
      phone: bookingData.driverPhone || '+911280012913',
      vehicleNumber: bookingData.driverVehicle || 'VH-219954',
      rating: '4.8'
    };
  }
  
  return driverInfo;
}, [bookingData, driverInfo]);

  // Debug useEffect
  useEffect(() => {
    console.log('🎯 Effective Driver Info:', effectiveDriverInfo);
  }, [effectiveDriverInfo]);

  const handleCancelBooking = async () => {
    if (!validatedBookingId) {
      Alert.alert('Error', 'Invalid booking ID');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              console.log('❌ Cancelling booking:', validatedBookingId);
              const response = await api.post(`${API_ENDPOINTS.BOOKINGS.CANCEL_BOOKING}/${validatedBookingId}`);

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
    if (effectiveDriverInfo?.phone && effectiveDriverInfo.phone !== 'Not available') {
      Alert.alert(
        'Contact Driver',
        `Driver: ${effectiveDriverInfo.name}\nVehicle: ${effectiveDriverInfo.vehicleNumber}\n\nCall ${effectiveDriverInfo.phone}?`,
        [
          {
            text: 'Call',
            onPress: () => {
              Linking.openURL(`tel:${effectiveDriverInfo.phone}`)
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

  const handleHelp = () => {
    Alert.alert('Help', 'What would you like to do?');
  };

  const toggleMapExpanded = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  // Show error if no bookingId
  if (!bookingId) {
    return (
      <ErrorScreen 
        navigation={destinationNavigation} 
        message="No booking ID provided" 
      />
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading booking details..." />;
  }

  if (!bookingData) {
    return <ErrorScreen navigation={destinationNavigation} message="Booking not found" />;
  }

  const { vehicleType, fromLocation, toLocation, price, distance } = bookingData;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Gradient */}
      <BookingHeader
        navigation={destinationNavigation}
        bookingId={validatedBookingId}
        bookingStatus={bookingStatus}
        progress={progress}
      />

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Live Map Section */}
        {mapRegion && (
          <View className="bg-white mx-4 my-4 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <Text className="font-bold text-gray-800 text-lg">Live Tracking</Text>
              <Text className="text-gray-500 text-sm">
                {effectiveDriverInfo ? 'Real-time driver location' : 'Waiting for driver assignment'}
              </Text>
            </View>

            <View className="h-48 relative">
              <LiveMap
                expanded={false}
                mapRegion={mapRegion}
                userLocation={userLocation}
                driverLocation={driverLocation}
                driverInfo={effectiveDriverInfo}
                distanceToDriver={distanceToDriver}
                liveEta={liveEta}
                bookingStatus={bookingStatus}
                onToggleExpanded={toggleMapExpanded}
              />

              {/* Click to expand instruction */}
              {effectiveDriverInfo && (
                <View className="absolute top-2 left-2 bg-black/70 rounded-lg px-2 py-1">
                  <Text className="text-white text-xs">Tap map to expand</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Vehicle & Trip Info Card */}
        <VehicleInfoCard
          vehicleType={vehicleType}
          price={price}
          distance={distance}
          driverInfo={effectiveDriverInfo}
          liveEta={liveEta}
          distanceToDriver={distanceToDriver}
        />

        {/* Trip Details Card */}
        <TripDetailsCard
          fromLocation={fromLocation}
          toLocation={toLocation}
        />

        {/* Driver Info Card */}
        <DriverInfoCard
          driverInfo={effectiveDriverInfo}
          distanceToDriver={distanceToDriver}
          liveEta={liveEta}
          onContactDriver={handleContactDriver}
        />
      </ScrollView>

      {/* Footer Actions */}
      <BookingActions
        onCancelBooking={handleCancelBooking}
        onHelp={handleHelp}
      />

      {/* Expanded Map Modal */}
      <Modal
        visible={isMapExpanded}
        animationType="fade"
        statusBarTranslucent={true}
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-black">
          <LiveMap
            expanded={true}
            mapRegion={mapRegion}
            userLocation={userLocation}
            driverLocation={driverLocation}
            driverInfo={effectiveDriverInfo}
            distanceToDriver={distanceToDriver}
            liveEta={liveEta}
            bookingStatus={bookingStatus}
            onToggleExpanded={toggleMapExpanded}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={toggleMapExpanded}
            className="absolute top-16 left-4 bg-black/70 rounded-full p-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Map Instructions */}
          {effectiveDriverInfo && (
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