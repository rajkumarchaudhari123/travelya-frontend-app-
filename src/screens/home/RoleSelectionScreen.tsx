import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen({ navigation }: Props) {
    const handleRoleSelect = (role: 'rider' | 'driver') => {
        if (role === 'driver') {
            navigation.navigate('DriverRegister'); // navigate to DriverRegisterScreen
        } else {
            navigation.navigate('RiderRegister'); // navigate to RiderRegisterScreen
        }
    };

    return (
        <View style={s.container}>
            <Text style={s.title}>Select Your Role</Text>
            <Text style={s.subtitle}>Choose whether you want to register as a Rider or Driver</Text>

            <TouchableOpacity
                style={[s.button, s.riderButton]}
                onPress={() => handleRoleSelect('rider')}
            >
                <Text style={s.buttonText}>Register as Rider</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[s.button, s.driverButton]}
                onPress={() => handleRoleSelect('driver')}
            >
                <Text style={s.buttonText}>Register as Driver</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        width: '80%',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    riderButton: {
        backgroundColor: '#4CAF50', // Green for rider
    },
    driverButton: {
        backgroundColor: '#2196F3', // Blue for driver
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
