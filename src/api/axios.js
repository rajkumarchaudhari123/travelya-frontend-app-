import axios from "axios";
import { Platform } from "react-native";
import Config from "react-native-config"; // Import for environment variables

// Function to determine the correct API base URL
const getBaseURL = () => {
  console.log('🔧 Platform:', Platform.OS);

  // Use Expo environment variable if available
  if (Config.EXPO_PUBLIC_API_BASE) {
    console.log('🔧 Using EXPO_PUBLIC_API_BASE:', Config.EXPO_PUBLIC_API_BASE);
    return Config.EXPO_PUBLIC_API_BASE;
  }

  // Development environment logic based on the platform
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // For Android Emulator (use 10.42.129.195 for localhost)
      const url = 'http://10.42.129.195:10000/api'; 
      console.log('🔧 Using Android Emulator URL:', url);
      return url;
    }
    
    if (Platform.OS === 'ios') {
      // For iOS Simulator
      const url = 'http://localhost:10000/api';
      console.log('🔧 Using iOS Simulator URL:', url);
      return url;
    }

    // For physical devices, use your machine's local IP (replace with actual IP)
    const url = 'http://10.42.129.195:10000/api';
    console.log('🔧 Using Physical Device URL:', url);
    return url;
  }

  // Fallback for production
  console.log('🔧 Using Production URL');
  return 'http://localhost:10000/api';
};

// Create Axios instance with dynamically determined baseURL
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,  // Set a timeout of 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API Request:');
    console.log('   Method:', config.method?.toUpperCase());
    console.log('   URL:', config.url);
    console.log('   Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response Success:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received - Network Error');
      console.error('   Request was made to:', error.config?.baseURL + error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;
