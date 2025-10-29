import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useMemo } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import api from '@/api/axios';

// Types
type RootStackParamList = {
  DestinationSearch: undefined;
  BookingScreen: {
    vehicleType: string;
    fromLocation: string;
    toLocation: string;
    price: string;
    distance: string;
    bookingId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DestinationSearch'>;

interface SuggestionItem {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  price: number;
  seats: string;
  time: string;
  color: string;
  selected: boolean;
}

// Constants
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const LOCATIONIQ_KEY = 'pk.4e99c2bb6538458479e6e356415d31cf';
const RATE_PER_KM = 20;

// Initial Vehicles Data
const initialVehicles: VehicleType[] = [
  { id: '1', name: 'Auto', icon: 'bicycle', price: 0, seats: '3 Seats', time: '5-10 min', color: '#EF4444', selected: false },
  { id: '2', name: 'Mini Car', icon: 'car-sport', price: 0, seats: '4 Seats', time: '5-10 min', color: '#3B82F6', selected: false },
  { id: '3', name: 'Sedan', icon: 'car', price: 0, seats: '4 Seats', time: '5-10 min', color: '#10B981', selected: false },
  { id: '4', name: 'SUV', icon: 'car-sport', price: 0, seats: '6 Seats', time: '5-10 min', color: '#F59E0B', selected: false },
  { id: '5', name: '7-Seater', icon: 'people', price: 0, seats: '7 Seats', time: '5-10 min', color: '#8B5CF6', selected: false }
];

export default function DestinationSearchScreen() {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [showDropdown, setShowDropdown] = useState(false);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<SuggestionItem[]>([]);
  const [toSuggestions, setToSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedFromLocation, setSelectedFromLocation] = useState<SuggestionItem | null>(null);
  const [selectedToLocation, setSelectedToLocation] = useState<SuggestionItem | null>(null);
  const [activeField, setActiveField] = useState<'pickup' | 'drop' | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [baseFare, setBaseFare] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleType[]>(initialVehicles);

  // Memoized responsive styles
  const responsiveStyles = useMemo(() => {
    const isSmallScreen = screenWidth < 375;
    const isLargeScreen = screenWidth >= 414;

    return {
      titleSize: isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-3xl' : 'text-2xl',
      subtitleSize: isSmallScreen ? 'text-sm' : 'text-base',
      modalTitleSize: isSmallScreen ? 'text-lg' : 'text-xl',
      inputTextSize: isSmallScreen ? 'text-sm' : 'text-base',
      vehicleTextSize: isSmallScreen ? 'text-xs' : 'text-sm',
      priceTextSize: isSmallScreen ? 'text-sm' : 'text-base',
      containerPadding: isSmallScreen ? 'px-4' : 'px-5',
      modalPadding: isSmallScreen ? 'p-4' : 'p-5',
      inputPadding: isSmallScreen ? 'p-2' : 'p-3',
      buttonPadding: isSmallScreen ? 'p-3' : 'p-4',
      iconSize: isSmallScreen ? 20 : 24,
      largeIconSize: isSmallScreen ? 24 : 28,
      modalWidth: isSmallScreen ? 'w-11/12' : 'w-10/12',
      modalMaxHeight: isSmallScreen ? 'max-h-3/4' : 'max-h-4/5',
      vehicleMinWidth: isSmallScreen ? 'min-w-[48%]' : 'min-w-[45%]',
      vehiclePadding: isSmallScreen ? 'p-2' : 'p-3',
      vehicleIconSize: isSmallScreen ? 20 : 24,
    };
  }, []);

  // Helper Functions
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getPriceMultiplier = (vehicleName: string): number => {
    const multipliers: { [key: string]: number } = {
      'Auto': 0.7,
      'Mini Car': 0.9,
      'Sedan': 1,
      'SUV': 1.2,
      '7-Seater': 1.5
    };
    return multipliers[vehicleName] || 1;
  };

  // API Functions
  const fetchLocationData = async (endpoint: string, errorMessage: string) => {
    try {
      const response = await api.get(endpoint);
      if (response.data?.success && response.data.data?.[0]) {
        return response.data.data[0];
      }
    } catch (error: any) {
      console.log(`❌ ${errorMessage}:`, error.message);
    }
    return null;
  };

  const fillCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      // Try backend first, then fallback to LocationIQ
      let locationData = await fetchLocationData(
        `/api/destination-search/search?query=${location.coords.latitude},${location.coords.longitude}`,
        'Backend reverse geocoding failed'
      );

      if (!locationData) {
        const response = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`
        );
        locationData = await response.json();
      }

      if (locationData?.display_name) {
        setPickup(locationData.display_name);
        setSelectedFromLocation({
          place_id: locationData.place_id,
          display_name: locationData.display_name,
          lat: locationData.lat,
          lon: locationData.lon
        });
      }
    } catch (error: any) {
      console.error('❌ Location error:', error.message);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const fetchSuggestions = async (text: string, setSuggestions: React.Dispatch<React.SetStateAction<SuggestionItem[]>>) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Try backend first
      const response = await api.get(`/api/destination-search/search?query=${encodeURIComponent(text)}`);
      if (response.data?.success && response.data.data) {
        setSuggestions(response.data.data);
        return;
      }
    } catch (error: any) {
      console.log('❌ Backend search failed:', error.message);
    }

    // Fallback to LocationIQ
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(text)}&format=json&limit=5`
      );
      const data: SuggestionItem[] = await response.json();
      setSuggestions(data);
    } catch (error: any) {
      console.error('❌ Fallback search failed:', error.message);
      setSuggestions([]);
    }
  };

  const calculateFareIfPossible = async (from: SuggestionItem | null, to: SuggestionItem | null) => {
    if (!from || !to) return;

    setCalculatingFare(true);

    try {
      // Try backend fare calculation
      const response = await api.post('/api/destination-search/calculate-fare', {
        fromLat: from.lat,
        fromLon: from.lon,
        toLat: to.lat,
        toLon: to.lon
      });

      if (response.data?.success && response.data.data) {
        const { distance: backendDistance, baseFare: backendBaseFare } = response.data.data;
        setDistance(parseFloat(backendDistance));
        setBaseFare(parseFloat(backendBaseFare));

        const updatedVehicles = vehicles.map(vehicle => {
          const backendVehicle = response.data.data.vehicles?.find((v: any) =>
            v.name.toLowerCase() === vehicle.name.toLowerCase()
          );
          return {
            ...vehicle,
            price: backendVehicle ? parseFloat(backendVehicle.price) : vehicle.price,
            selected: false
          };
        });
        setVehicles(updatedVehicles);
      }
    } catch (error: any) {
      // Client-side calculation fallback
      console.log('❌ Backend fare calculation failed, using client-side');
      const lat1 = parseFloat(from.lat);
      const lon1 = parseFloat(from.lon);
      const lat2 = parseFloat(to.lat);
      const lon2 = parseFloat(to.lon);

      const calculatedDistance = calculateDistance(lat1, lon1, lat2, lon2);
      const calculatedBaseFare = calculatedDistance * RATE_PER_KM;

      setDistance(parseFloat(calculatedDistance.toFixed(2)));
      setBaseFare(parseFloat(calculatedBaseFare.toFixed(2)));

      const updatedVehicles = vehicles.map(vehicle => ({
        ...vehicle,
        price: parseFloat((calculatedBaseFare * getPriceMultiplier(vehicle.name)).toFixed(2)),
        selected: false
      }));
      setVehicles(updatedVehicles);
    } finally {
      setCalculatingFare(false);
      setSelectedVehicle(null);
    }
  };

  // Event Handlers
  const handleFromLocationSearch = (text: string) => {
    setPickup(text);
    fetchSuggestions(text, setFromSuggestions);
    setActiveField('pickup');
  };

  const handleToLocationSearch = (text: string) => {
    setDrop(text);
    fetchSuggestions(text, setToSuggestions);
    setActiveField('drop');
  };

  const handleSelectFromLocation = async (item: SuggestionItem) => {
    setPickup(item.display_name);
    setSelectedFromLocation(item);
    setFromSuggestions([]);
    setActiveField(null);
    await calculateFareIfPossible(item, selectedToLocation);
  };

  const handleSelectToLocation = async (item: SuggestionItem) => {
    setDrop(item.display_name);
    setSelectedToLocation(item);
    setToSuggestions([]);
    setActiveField(null);
    await calculateFareIfPossible(selectedFromLocation, item);
  };

  const handleVehicleSelect = (vehicle: VehicleType) => {
    if (!distance || !baseFare) {
      Alert.alert('Error', 'Please select pickup and drop location first.');
      return;
    }

    const calculatedFare = distance * RATE_PER_KM * getPriceMultiplier(vehicle.name);
    const updatedVehicles = vehicles.map(v => ({
      ...v,
      selected: v.id === vehicle.id,
      price: v.id === vehicle.id ? parseFloat(calculatedFare.toFixed(2)) : v.price
    }));

    setVehicles(updatedVehicles);
    setSelectedVehicle({ ...vehicle, price: parseFloat(calculatedFare.toFixed(2)) });
  };

  const handleBookRide = async () => {
    if (!pickup || !drop || !selectedVehicle || !distance || selectedVehicle.price === 0) {
      Alert.alert('Error', 'Please complete all booking details and wait for price calculation');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        vehicleType: selectedVehicle.name,
        fromLocation: pickup,
        toLocation: drop,
        price: Number(selectedVehicle.price),
        distance: Number(distance),
        fromLat: selectedFromLocation?.lat || '0',
        fromLon: selectedFromLocation?.lon || '0',
        toLat: selectedToLocation?.lat || '0',
        toLon: selectedToLocation?.lon || '0',
      };

      const response = await api.post('/api/destination-search/book-ride', bookingData);

      if (response.data?.success) {
        Alert.alert(
          'Booking Confirmed!',
          `Your ${selectedVehicle.name} is booked!\nFrom: ${pickup}\nTo: ${drop}\nDistance: ${distance.toFixed(2)} km\nTotal Fare: ₹${selectedVehicle.price.toFixed(2)}`
        );

        navigation.navigate('BookingScreen', {
          vehicleType: selectedVehicle.name,
          fromLocation: pickup,
          toLocation: drop,
          price: selectedVehicle.price.toFixed(2),
          distance: distance.toFixed(2),
          bookingId: response.data.data.id
        });
        setShowDropdown(false);
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error.response?.data);
      Alert.alert('Booking Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  // Render Functions
  const renderSuggestions = (suggestions: SuggestionItem[], onSelect: (item: SuggestionItem) => void) => (
    <View className="bg-white border border-gray-300 rounded-lg mt-1 max-h-48 z-50 shadow-lg">
      <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
        {suggestions.map((item) => (
          <Pressable
            key={item.place_id}
            className="p-3 border-b border-gray-200 active:bg-gray-100"
            onPress={() => onSelect(item)}
          >
            <Text className={`text-gray-800 ${responsiveStyles.inputTextSize}`} numberOfLines={2}>
              {item.display_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderVehicleItem = (vehicle: VehicleType) => (
    <Pressable
      key={vehicle.id}
      className={`border-2 rounded-xl m-1 flex-1 ${responsiveStyles.vehicleMinWidth} ${responsiveStyles.vehiclePadding} ${vehicle.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
        } active:opacity-70`}
      onPress={() => handleVehicleSelect(vehicle)}
    >
      <View className="items-center">
        <Ionicons name={vehicle.icon as any} size={responsiveStyles.vehicleIconSize} color={vehicle.color} />
        <Text className={`font-bold text-gray-800 text-center mt-1 ${responsiveStyles.vehicleTextSize}`}>
          {vehicle.name}
        </Text>
        <Text className={`text-green-600 font-semibold ${responsiveStyles.priceTextSize}`}>
          ₹{vehicle.price.toFixed(2)}
        </Text>
        <Text className={`text-gray-500 ${responsiveStyles.vehicleTextSize}`}>{vehicle.seats}</Text>
        <Text className={`text-gray-400 ${responsiveStyles.vehicleTextSize}`}>{vehicle.time}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-white">
      <View className={`pt-16 ${responsiveStyles.containerPadding}`}>
        <Text className={`font-bold text-gray-800 mb-2 text-center ${responsiveStyles.titleSize}`}>
          🏙 Travelya
        </Text>
        <Text className={`text-gray-600 text-center mb-6 ${responsiveStyles.subtitleSize}`}>
          Nearby car rentals and trips inside your city
        </Text>

        <Pressable
          className="bg-white border border-gray-300 rounded-xl flex-row items-center shadow-sm active:bg-gray-50"
          onPress={() => setShowDropdown(true)}
        >
          <View className="pl-3">
            <Ionicons name="car-outline" size={responsiveStyles.largeIconSize} color="#374151" />
          </View>
          <Text className={`bg-gray-100 rounded-lg flex-1 ml-3 my-3 text-gray-600 ${responsiveStyles.inputPadding}`}>
            Search Your Destination
          </Text>
        </Pressable>
      </View>

      <Modal visible={showDropdown} transparent animationType="slide" onRequestClose={() => setShowDropdown(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className={`bg-white rounded-2xl ${responsiveStyles.modalWidth} ${responsiveStyles.modalMaxHeight} ${responsiveStyles.modalPadding}`}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <Text className={`font-bold text-gray-800 mb-5 text-center ${responsiveStyles.modalTitleSize}`}>
                Plan Your Ride
              </Text>

              {/* Pickup Field */}
              <View className="mb-4 z-50">
                <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
                  <Ionicons name="location-outline" size={responsiveStyles.iconSize} color="#374151" />
                  <TextInput
                    placeholder="Pickup Location"
                    className={`flex-1 ml-2 text-gray-800 ${responsiveStyles.inputTextSize}`}
                    placeholderTextColor="#9CA3AF"
                    value={pickup}
                    onFocus={() => setActiveField('pickup')}
                    onChangeText={handleFromLocationSearch}
                  />
                </View>
                {fromSuggestions.length > 0 && activeField === 'pickup' && renderSuggestions(fromSuggestions, handleSelectFromLocation)}
              </View>

              {/* Current Location Button */}
              <Pressable
                className="flex-row items-center bg-blue-50 rounded-lg mb-4 p-3 active:bg-blue-100"
                onPress={fillCurrentLocation}
              >
                <Ionicons name="locate-outline" size={responsiveStyles.iconSize} color="#2563EB" />
                <Text className={`ml-2 text-blue-600 font-semibold ${responsiveStyles.inputTextSize}`}>
                  Use Current Location
                </Text>
              </Pressable>

              {/* Drop Field */}
              <View className="mb-4 z-40">
                <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
                  <Ionicons name="flag-outline" size={responsiveStyles.iconSize} color="#374151" />
                  <TextInput
                    placeholder="Drop Location"
                    className={`flex-1 ml-2 text-gray-800 ${responsiveStyles.inputTextSize}`}
                    placeholderTextColor="#9CA3AF"
                    value={drop}
                    onFocus={() => setActiveField('drop')}
                    onChangeText={handleToLocationSearch}
                  />
                </View>
                {toSuggestions.length > 0 && activeField === 'drop' && renderSuggestions(toSuggestions, handleSelectToLocation)}
              </View>

              {/* Selected Locations & Fare Info */}
              {(selectedFromLocation || selectedToLocation) && (
                <View className="bg-gray-50 rounded-lg mb-4 p-3">
                  <Text className={`font-semibold text-gray-800 mb-2 ${responsiveStyles.inputTextSize}`}>
                    Selected Locations:
                  </Text>
                  {selectedFromLocation && (
                    <Text className={`text-gray-600 mb-1 ${responsiveStyles.vehicleTextSize}`} numberOfLines={2}>
                      From: {selectedFromLocation.display_name}
                    </Text>
                  )}
                  {selectedToLocation && (
                    <Text className={`text-gray-600 mb-1 ${responsiveStyles.vehicleTextSize}`} numberOfLines={2}>
                      To: {selectedToLocation.display_name}
                    </Text>
                  )}
                  {distance !== null && baseFare !== null && (
                    <View className="mt-2 pt-2 border-t border-gray-300">
                      <Text className={`text-green-600 font-semibold ${responsiveStyles.inputTextSize}`}>
                        Distance: {distance.toFixed(2)} km
                      </Text>
                      <Text className={`text-green-600 font-bold ${responsiveStyles.priceTextSize}`}>
                        Base Fare: ₹{baseFare.toFixed(2)}
                      </Text>
                      <Text className={`text-gray-500 mt-1 ${responsiveStyles.vehicleTextSize}`}>
                        Rate: ₹{RATE_PER_KM} per km
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Vehicle Selection */}
              {distance !== null && baseFare !== null && (
                <View className="mb-4">
                  <Text className={`font-semibold text-gray-800 mb-3 ${responsiveStyles.inputTextSize}`}>
                    Choose Your Vehicle:
                  </Text>
                  {calculatingFare ? (
                    <View className="items-center py-4">
                      <ActivityIndicator size="large" color="#3B82F6" />
                      <Text className="text-gray-500 mt-2">Calculating fares...</Text>
                    </View>
                  ) : (
                    <View className="flex-row flex-wrap justify-between">
                      {vehicles.map(renderVehicleItem)}
                    </View>
                  )}
                </View>
              )}

              {/* Selected Vehicle Display */}
              {selectedVehicle && (
                <View className="bg-green-50 rounded-lg mb-4 border border-green-200 p-3">
                  <View className="flex-row items-center justify-center">
                    <Ionicons name={selectedVehicle.icon as any} size={responsiveStyles.iconSize} color={selectedVehicle.color} />
                    <Text className={`text-green-800 font-semibold text-center ml-2 ${responsiveStyles.inputTextSize}`}>
                      Selected: {selectedVehicle.name} - ₹{selectedVehicle.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <Pressable
                className={`rounded-xl mt-2 ${responsiveStyles.buttonPadding} ${!pickup || !drop || !selectedVehicle || loading ? 'bg-gray-400' : 'bg-green-600 active:bg-green-700'
                  }`}
                onPress={handleBookRide}
                disabled={!pickup || !drop || !selectedVehicle || loading}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white text-center font-bold text-lg ml-2">Booking...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    ✅ Book {selectedVehicle?.name || 'Ride'}
                  </Text>
                )}
              </Pressable>

              <Pressable className="mt-3 active:opacity-70" onPress={() => setShowDropdown(false)}>
                <Text className={`text-blue-600 text-center font-semibold ${responsiveStyles.inputTextSize}`}>
                  Cancel
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}