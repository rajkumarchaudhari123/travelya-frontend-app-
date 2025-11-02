import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Location, DriverInfo } from '@/types/booking.types';
import { screenWidth, screenHeight } from '@/utils/constants';

interface LiveMapProps {
  expanded: boolean;
  mapRegion: any;
  userLocation: Location | null;
  driverLocation: Location | null;
  driverInfo: DriverInfo | null;
  distanceToDriver: string;
  liveEta: string;
  bookingStatus: string;
  onToggleExpanded: () => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  expanded,
  mapRegion,
  userLocation,
  driverLocation,
  driverInfo,
  distanceToDriver,
  liveEta,
  bookingStatus,
  onToggleExpanded
}) => {
  const MapContent = ({ isExpanded }: { isExpanded: boolean }) => (
    <View style={{
      width: isExpanded ? screenWidth : '100%',
      height: isExpanded ? screenHeight : 200
    }}>
      <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Your Location" description="Pickup point">
            <View className="bg-green-500 w-6 h-6 rounded-full border-2 border-white justify-center items-center">
              <Ionicons name="location" size={12} color="white" />
            </View>
          </Marker>
        )}

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

      <TouchableOpacity
        onPress={onToggleExpanded}
        className={`absolute ${isExpanded ? 'top-16 right-4' : 'top-2 right-2'} bg-black/70 rounded-full p-2`}
      >
        <Ionicons name={isExpanded ? 'contract' : 'expand'} size={20} color="white" />
      </TouchableOpacity>

      {!isExpanded && driverInfo && (
        <View className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-lg p-3 shadow">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-600 text-xs">Driver is</Text>
              <Text className="font-bold text-gray-800 text-sm">{distanceToDriver} away</Text>
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

  if (expanded) {
    return (
      <Modal visible={expanded} animationType="fade" statusBarTranslucent presentationStyle="fullScreen">
        <View className="flex-1 bg-black">
          <MapContent isExpanded={true} />
          <TouchableOpacity onPress={onToggleExpanded} className="absolute top-16 left-4 bg-black/70 rounded-full p-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
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
    );
  }

  return <MapContent isExpanded={false} />;
};