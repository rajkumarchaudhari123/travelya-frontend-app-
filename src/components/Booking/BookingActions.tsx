import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingActionsProps {
  onCancelBooking: () => void;
  onHelp: () => void;
}

export const BookingActions: React.FC<BookingActionsProps> = ({
  onCancelBooking,
  onHelp
}) => (
  <View className="bg-white border-t border-gray-200 px-4 py-4 flex-row space-x-3">
    <Pressable
      className="flex-1 flex-row items-center justify-center py-4 rounded-xl border border-red-200 bg-red-50 space-x-2"
      onPress={onCancelBooking}
    >
      <Ionicons name="close-circle" size={20} color="#EF4444" />
      <Text className="text-red-600 font-semibold text-base">Cancel Ride</Text>
    </Pressable>

    <Pressable
      className="flex-1 flex-row items-center justify-center py-4 rounded-xl bg-green-500 space-x-2"
      onPress={onHelp}
    >
      <Ionicons name="help-circle" size={20} color="white" />
      <Text className="text-white font-semibold text-base">Help</Text>
    </Pressable>
  </View>
);