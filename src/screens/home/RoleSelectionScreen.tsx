import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen({ navigation }: Props) {
    const handleRoleSelect = (role: 'rider' | 'driver') => {
        if (role === 'driver') {
            navigation.navigate('DriverRegister');
        } else {
            navigation.navigate('RiderRegister');
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 px-4">
            <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
                Select Your Role
            </Text>

            <Text className="text-lg text-gray-600 mb-10 text-center">
                Choose whether you want to register as a Rider or Driver
            </Text>

            <TouchableOpacity
                className="w-4/5 bg-green-500 py-4 rounded-lg mb-5 items-center justify-center active:bg-green-600"
                onPress={() => handleRoleSelect('rider')}
            >
                <Text className="text-lg font-semibold text-white">
                    Register as Rider
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-4/5 bg-blue-500 py-4 rounded-lg mb-5 items-center justify-center active:bg-blue-600"
                onPress={() => handleRoleSelect('driver')}
            >
                <Text className="text-lg font-semibold text-white">
                    Register as Driver
                </Text>
            </TouchableOpacity>
        </View>
    );
}