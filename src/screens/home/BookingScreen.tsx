import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/api/axios'; // ✅ Fixed axios import

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

  // ✅ Fetch booking info from API using axios instance
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        console.log('🔍 Fetching booking:', bookingId);
        
        const response = await api.get(`/api/bookings/${bookingId}`);
        
        console.log('✅ Booking API Response:', response.data);

        if (response.data.success) {
          setBookingData(response.data.data);
          
          // ✅ If driver is already assigned in API response
          if (response.data.data.driver) {
            setDriverInfo({
              name: response.data.data.driver.fullName,
              rating: response.data.data.driver.rating?.toString() || '4.8',
              vehicleNumber: response.data.data.driver.vehicleNumber,
              phone: response.data.data.driver.phone
            });
            setBookingStatus('driver_assigned');
          }
        } else {
          Alert.alert('Error', 'Booking not found');
          navigation.navigate('DestinationSearch');
        }
      } catch (error: any) {
        console.log('❌ Fetch booking error:', error.message);
        Alert.alert('Error', 'Failed to fetch booking details');
        navigation.navigate('DestinationSearch');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  // ✅ Simulate driver assignment
  useEffect(() => {
    if (!bookingData || driverInfo) return;

    const timer = setTimeout(() => {
      setDriverInfo({
        name: 'Rajesh Kumar',
        rating: '4.8',
        vehicleNumber: 'DL 01 AB 1234',
        phone: '+91 98765 43210'
      });
      setBookingStatus('driver_assigned');
    }, 2000);

    Animated.timing(progress, {
      toValue: 1,
      duration: 30000,
      useNativeDriver: false,
    }).start();

    return () => clearTimeout(timer);
  }, [bookingData]);

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

  // ✅ Fixed cancel booking with axios
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
            } catch (error: any) {
              console.log('❌ Cancel booking error:', error.message);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleContactDriver = () => {
    Alert.alert(
      'Contact Driver',
      `Call driver ${driverInfo?.name} at ${driverInfo?.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', `Connecting to ${driverInfo?.name}`) }
      ]
    );
  };

  const getStatusColor = () => {
    switch (bookingStatus) {
      case 'confirmed': return 'bg-success-500';
      case 'driver_assigned': return 'bg-primary-500';
      case 'arriving': return 'bg-warning-500';
      case 'ongoing': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-success-500';
    }
  };

  const getStatusText = () => {
    switch (bookingStatus) {
      case 'confirmed': return 'Booking Confirmed';
      case 'driver_assigned': return 'Driver Assigned';
      case 'arriving': return 'Driver Arriving';
      case 'ongoing': return 'Trip Ongoing';
      case 'completed': return 'Trip Completed';
      default: return 'Booking Confirmed';
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
      case 'auto': return 'text-error-500';
      case 'mini car': return 'text-primary-500';
      case 'sedan': return 'text-success-500';
      case 'suv': return 'text-warning-500';
      case '7-seater': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  // Responsive sizing
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth >= 414;

  if (loading || !bookingData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-600 mt-4 text-lg">Loading booking details...</Text>
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
              <Text className="text-gray-500 text-base">ETA: {eta}</Text>
            </View>
            <View className="items-end">
              <Text className={`font-bold text-success-600 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
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
            <View className="w-3 h-3 bg-success-500 rounded-full" />
            <View className="w-0.5 h-10 bg-gray-300 my-1" />
            <View className="w-3 h-3 bg-error-500 rounded-full" />
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

        {/* Driver Info Card */}
        {driverInfo && (
          <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
            <Text className={`font-bold text-gray-800 mb-4 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
              Your Driver
            </Text>
            
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-primary-500 rounded-full justify-center items-center mr-4">
                <Text className="text-white font-bold text-lg">
                  {driverInfo.name.charAt(0)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">
                  {driverInfo.name}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {driverInfo.rating}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  {driverInfo.vehicleNumber}
                </Text>
              </View>
              
              <Pressable 
                className="p-3 bg-primary-50 rounded-full"
                onPress={handleContactDriver}
              >
                <Ionicons name="call" size={20} color="#3B82F6" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Booking Timeline */}
        <View className="bg-white mx-4 my-2 p-6 rounded-2xl shadow-lg border border-gray-100">
          <Text className={`font-bold text-gray-800 mb-4 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
            Booking Timeline
          </Text>
          
          <View className="space-y-4">
            {[
              { status: 'confirmed', text: 'Booking Confirmed', time: 'Just now' },
              { status: 'driver_assigned', text: 'Driver Assigned', time: driverInfo ? '2 min ago' : 'Pending' },
              { status: 'arriving', text: 'Driver Arriving', time: bookingStatus === 'arriving' ? 'Soon' : 'Pending' },
              { status: 'ongoing', text: 'Trip Started', time: 'Pending' },
              { status: 'completed', text: 'Trip Completed', time: 'Pending' },
            ].map((item, index) => (
              <View key={index} className="flex-row items-center">
                <View className={`w-6 h-6 rounded-full justify-center items-center mr-3 ${
                  bookingStatus === item.status ? getStatusColor() : 'bg-gray-300'
                }`}>
                  {bookingStatus === item.status && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${
                    bookingStatus === item.status ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {item.text}
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm">
                  {item.time}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="bg-white border-t border-gray-200 px-4 py-4 flex-row space-x-3">
        <Pressable 
          className="flex-1 flex-row items-center justify-center py-4 rounded-xl border border-error-200 bg-error-50 space-x-2"
          onPress={handleCancelBooking}
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
          <Text className="text-error-600 font-semibold text-base">Cancel Ride</Text>
        </Pressable>
        
        <Pressable 
          className="flex-1 flex-row items-center justify-center py-4 rounded-xl bg-success-500 space-x-2"
          onPress={() => Alert.alert('Help', 'What would you like to do?')}
        >
          <Ionicons name="help-circle" size={20} color="white" />
          <Text className="text-white font-semibold text-base">Help</Text>
        </Pressable>
      </View>
    </View>
  );
}