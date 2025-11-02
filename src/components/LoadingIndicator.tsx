import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingIndicatorProps {
    loading: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ loading }) => {
    if (!loading) return null;

    return (
        <View className="mt-4 flex-row items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-blue-600 ml-2">Checking for rides...</Text>
        </View>
    );
};