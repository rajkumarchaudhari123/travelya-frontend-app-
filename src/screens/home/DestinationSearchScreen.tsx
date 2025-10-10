import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your navigation types
type RootStackParamList = {
  DestinationSearchScreen: undefined;
  BookingScreen: { vehicleType: string; fromLocation: string; toLocation: string };
  // Add other screens as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DestinationSearchScreen'>;

// Example data for available vehicles
const availableVehicles = [
  { id: 1, type: 'Car', available: true },
  { id: 2, type: 'Auto', available: false },
  { id: 3, type: 'Car', available: true },
  { id: 4, type: 'Bike', available: true },
];

const DestinationSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [selectedFromLocation, setSelectedFromLocation] = useState<any>(null);
  const [selectedToLocation, setSelectedToLocation] = useState<any>(null);
  const [availableVehicleList, setAvailableVehicleList] = useState(availableVehicles);

  // Your LocationIQ API key
  const LOCATIONIQ_KEY = 'your_locationiq_api_key_here'; // Replace with your actual key

  // Search locations using LocationIQ API
  const searchLocations = async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Location search error:', error);
      Alert.alert('Error', 'Failed to search locations');
    }
  };

  const handleFromLocationSearch = (text: string) => {
    setFromLocation(text);
    searchLocations(text, setFromSuggestions);
  };

  const handleToLocationSearch = (text: string) => {
    setToLocation(text);
    searchLocations(text, setToSuggestions);
  };

  const handleSelectFromLocation = (location: any) => {
    setFromLocation(location.display_name);
    setSelectedFromLocation(location);
    setFromSuggestions([]);
  };

  const handleSelectToLocation = (location: any) => {
    setToLocation(location.display_name);
    setSelectedToLocation(location);
    setToSuggestions([]);
  };

  const handleSearchRoute = () => {
    if (!fromLocation || !toLocation) {
      return Alert.alert('Error', 'Please provide both start and destination locations.');
    }

    if (!selectedFromLocation || !selectedToLocation) {
      return Alert.alert('Error', 'Please select locations from the suggestions.');
    }

    // Filter available vehicles
    setAvailableVehicleList(availableVehicles.filter(vehicle => vehicle.available));

    Alert.alert('Success', `Route from ${fromLocation} to ${toLocation} found!`);
  };

  const handleBookVehicle = (vehicleType: string) => {
    navigation.navigate('BookingScreen', { 
      vehicleType, 
      fromLocation: fromLocation, 
      toLocation: toLocation 
    });
  };

  const renderSuggestionItem = (item: any, onSelect: (location: any) => void) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.suggestionText} numberOfLines={2}>
        {item.display_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* From Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            value={fromLocation}
            onChangeText={handleFromLocationSearch}
          />
          {fromSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={fromSuggestions}
                keyExtractor={(item) => item.place_id.toString()}
                renderItem={({ item }) => renderSuggestionItem(item, handleSelectFromLocation)}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* To Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            value={toLocation}
            onChangeText={handleToLocationSearch}
          />
          {toSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={toSuggestions}
                keyExtractor={(item) => item.place_id.toString()}
                renderItem={({ item }) => renderSuggestionItem(item, handleSelectToLocation)}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Search Route Button */}
        <TouchableOpacity onPress={handleSearchRoute} style={styles.searchButton}>
          <Text style={styles.buttonText}>Search Route</Text>
        </TouchableOpacity>

        {/* Selected Locations Display */}
        {(selectedFromLocation || selectedToLocation) && (
          <View style={styles.selectedLocations}>
            <Text style={styles.selectedTitle}>Selected Locations:</Text>
            {selectedFromLocation && (
              <Text style={styles.selectedText}>
                From: {selectedFromLocation.display_name}
              </Text>
            )}
            {selectedToLocation && (
              <Text style={styles.selectedText}>
                To: {selectedToLocation.display_name}
              </Text>
            )}
          </View>
        )}

        {/* Available Vehicles */}
        <Text style={styles.vehiclesTitle}>Available Vehicles</Text>
        <FlatList
          data={availableVehicleList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleBookVehicle(item.type)} 
              style={[
                styles.vehicleItem,
                item.available ? styles.vehicleAvailable : styles.vehicleUnavailable
              ]}
              disabled={!item.available}
            >
              <Text style={styles.vehicleText}>
                {item.type} {!item.available && '(Not Available)'}
              </Text>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  searchButton: { 
    backgroundColor: '#007bff', 
    padding: 16, 
    marginTop: 8, 
    alignItems: 'center', 
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  selectedLocations: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  selectedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  vehiclesTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12,
    color: '#333',
  },
  vehicleItem: { 
    padding: 16, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8,
  },
  vehicleAvailable: {
    backgroundColor: '#f9f9f9',
  },
  vehicleUnavailable: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  vehicleText: { 
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DestinationSearchScreen;