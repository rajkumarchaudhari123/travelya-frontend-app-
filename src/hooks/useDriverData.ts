import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DriverData } from '@/types/navigation.types';

export const useDriverData = () => {
    const route = useRoute();
    const [currentDriver, setCurrentDriver] = useState<DriverData | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    const loadDriverData = async () => {
        try {
            const routeParams = route.params as any;
            
            if (routeParams?.driverData) {
                setCurrentDriver(routeParams.driverData);
                setIsOnline(true);
                await AsyncStorage.setItem('driverData', JSON.stringify(routeParams.driverData));
                return;
            }

            const storedDriverData = await AsyncStorage.getItem('driverData');
            if (storedDriverData) {
                const driverData = JSON.parse(storedDriverData);
                setCurrentDriver(driverData);
                setIsOnline(true);
            }
        } catch (error) {
            console.error('Error loading driver data:', error);
        }
    };

    const toggleOnlineStatus = () => {
        if (!currentDriver) {
            return false;
        }
        setIsOnline(!isOnline);
        return true;
    };

    useEffect(() => {
        loadDriverData();
    }, []);

    return {
        currentDriver,
        isOnline,
        setIsOnline,
        toggleOnlineStatus
    };
};