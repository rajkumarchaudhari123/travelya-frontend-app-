import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BookingStatus } from '@/types/booking.types';
import { getStatusColor, getStatusText } from '@/utils/bookingUtils';
import { screenWidth } from '@/utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DestinationSearch'>;

interface BookingHeaderProps {
  navigation: NavigationProp;
  bookingId: string;
  bookingStatus: BookingStatus;
  progress: Animated.Value;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  navigation,
  bookingId,
  bookingStatus,
  progress
}) => {
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth >= 414;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={['#10B981', '#059669']} className="pt-16 pb-6 rounded-b-3xl">
      <View className="flex-row items-center px-5">
        <Pressable className="p-2 mr-3" onPress={() => navigation.navigate('DestinationSearch')}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View className="flex-1">
          <Text className={`text-white font-bold ${isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-2xl' : 'text-xl'}`}>
            {getStatusText(bookingStatus)}
          </Text>
          <Text className="text-green-100 text-sm mt-1">Booking ID: {bookingId}</Text>
        </View>
      </View>

      <View className="h-1 bg-green-400/30 mx-5 mt-4 rounded-full overflow-hidden">
        <Animated.View
          className={`h-full rounded-full ${getStatusColor(bookingStatus)}`}
          style={{ width: progressWidth }}
        />
      </View>
    </LinearGradient>
  );
};