import { useState, useEffect } from 'react';
import { DriverInfo, Location, BookingStatus } from '@/types/booking.types';
import { calculateDistance, calculateETA, simulateDriverLocation } from '@/utils/locationUtils';
import { TRACKING_INTERVAL } from '@/utils/constants';
export const useDriverTracking = (
  bookingData: any,
  userLocation: Location | null,
  bookingStatus: BookingStatus,
  setBookingStatus: (status: BookingStatus) => void
) => {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [distanceToDriver, setDistanceToDriver] = useState<string>('Calculating...');
  const [liveEta, setLiveEta] = useState<string>('Calculating...');

  // Initialize driver info when booking data changes
  useEffect(() => {
    if (bookingData?.driverId && userLocation) {
      console.log('🚗 Driver FOUND in booking data');
      
      const driverData: DriverInfo = {
        id: bookingData.driverId,
        name: bookingData.driverName || 'Driver',
        phone: bookingData.driver?.phone || 'Not available',
        vehicleNumber: bookingData.driver?.vehicleNumber || 'Not available',
        rating: '4.8'
      };

      console.log('👨‍🚀 Driver Data to display:', driverData);
      setDriverInfo(driverData);
      setBookingStatus('driver_assigned');

      const driverLoc = simulateDriverLocation(userLocation.latitude, userLocation.longitude);
      setDriverLocation(driverLoc);

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        driverLoc.latitude,
        driverLoc.longitude
      );
      setDistanceToDriver(distance);

      const distanceInKm = parseFloat(distance.replace(' km', '')) || 2.0;
      const eta = calculateETA(distanceInKm);
      setLiveEta(eta);
    }
  }, [bookingData, userLocation]);

  // Track driver location in real-time
  useEffect(() => {
    if (!driverInfo || !userLocation || !driverLocation) return;

    let interval: ReturnType<typeof setInterval>;

    const trackDriverLocation = async () => {
      try {
        const currentDistance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          driverLocation.latitude,
          driverLocation.longitude
        );

        const distanceInKm = parseFloat(currentDistance.replace(' km', '')) || 2.0;

        if (distanceInKm > 0.1) {
          const newDriverLat = driverLocation.latitude + (userLocation.latitude - driverLocation.latitude) * 0.1;
          const newDriverLng = driverLocation.longitude + (userLocation.longitude - driverLocation.longitude) * 0.1;

          const newDriverLocation = { latitude: newDriverLat, longitude: newDriverLng };
          setDriverLocation(newDriverLocation);

          const newDistance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            newDriverLat,
            newDriverLng
          );
          setDistanceToDriver(newDistance);

          const newDistanceInKm = parseFloat(newDistance.replace(' km', '')) || 0;
          const newEta = calculateETA(newDistanceInKm);
          setLiveEta(newEta);

          if (newDistanceInKm < 0.5) {
            setBookingStatus('arriving');
          }
        }
      } catch (error) {
        console.log('Error tracking driver location:', error);
      }
    };

    interval = setInterval(trackDriverLocation, TRACKING_INTERVAL);
    return () => clearInterval(interval);
  }, [driverInfo, userLocation, driverLocation]);

  return {
    driverInfo,
    driverLocation,
    distanceToDriver,
    liveEta,
    setDriverInfo,
    setDriverLocation
  };
};