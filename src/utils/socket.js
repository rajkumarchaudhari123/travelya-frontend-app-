// utils/socket.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Use your server IP or localhost
    const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://10.184.209.195:10000';
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  registerUser(userId, userType) {
    if (this.socket) {
      this.socket.emit('register_user', { userId, userType });
    }
  }

  updateLocation(userId, userType, latitude, longitude) {
    if (this.socket) {
      this.socket.emit('update_location', {
        userId,
        userType,
        latitude,
        longitude
      });
    }
  }

  requestRide(rideData) {
    if (this.socket) {
      this.socket.emit('request_ride', rideData);
    }
  }

  acceptRide(bookingId, driverId) {
    if (this.socket) {
      this.socket.emit('accept_ride', { bookingId, driverId });
    }
  }

  updateRideStatus(bookingId, status) {
    if (this.socket) {
      this.socket.emit('update_ride_status', { bookingId, status });
    }
  }

  cancelRideByDriver(bookingId, driverId) {
    if (this.socket) {
      this.socket.emit('driver_cancel_ride', { bookingId, driverId });
    }
  }

  cancelRideByRider(bookingId, riderId) {
    if (this.socket) {
      this.socket.emit('rider_cancel_ride', { bookingId, riderId });
    }
  }

  isConnected() {
    return this.isConnected;
  }
}

export default new SocketService();