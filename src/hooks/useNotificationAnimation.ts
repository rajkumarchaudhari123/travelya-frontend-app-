import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { NOTIFICATION_TIMEOUT, VIBRATION_PATTERN } from '@/utils/constants';

export const useNotificationAnimation = () => {
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [countdown, setCountdown] = useState(NOTIFICATION_TIMEOUT);
    const slideAnim = useRef(new Animated.Value(1000)).current;

    const showNotification = () => {
        setCountdown(NOTIFICATION_TIMEOUT);
        setNotificationVisible(true);

        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
    };

    const hideNotification = () => {
        Animated.timing(slideAnim, {
            toValue: 1000,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setNotificationVisible(false);
            setCountdown(NOTIFICATION_TIMEOUT);
        });
    };

    return {
        notificationVisible,
        setNotificationVisible,
        countdown,
        setCountdown,
        slideAnim,
        showNotification,
        hideNotification
    };
};