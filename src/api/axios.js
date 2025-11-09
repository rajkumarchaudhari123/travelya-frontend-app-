// // api/axios.ts
// import axios from "axios";
// import { Platform } from "react-native";
// import Config from "react-native-config";

// // Function to determine the correct API base URL
// const getBaseURL = () => {
//   console.log('🔧 Platform:', Platform.OS);

//   // Use Expo environment variable if available
//   if (Config.EXPO_PUBLIC_API_BASE) {
//     console.log('🔧 Using EXPO_PUBLIC_API_BASE:', Config.EXPO_PUBLIC_API_BASE);
//     return Config.EXPO_PUBLIC_API_BASE;
//   }

//   // Development environment logic based on the platform
//   if (__DEV__) {
//     if (Platform.OS === 'android') {
//       const url = 'http://10.184.209.195:10000'; // REMOVED /api from here
//       console.log('🔧 Using Android Emulator URL:', url);
//       return url;
//     }
    
//     if (Platform.OS === 'ios') {
//       const url = 'http://localhost:10000'; // REMOVED /api from here
//       console.log('🔧 Using iOS Simulator URL:', url);
//       return url;
//     }

//     const url = 'http://10.184.209.195:10000'; // REMOVED /api from here
//     console.log('🔧 Using Physical Device URL:', url);
//     return url;
//   }

//   console.log('🔧 Using Production URL');
//   return 'http://localhost:10000'; // REMOVED /api from here
// };

// // Create Axios instance
// const api = axios.create({
//   baseURL: getBaseURL(),
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     console.log('🚀 Making API Request:');
//     console.log('   Method:', config.method?.toUpperCase());
//     console.log('   URL:', config.url);
//     console.log('   Full URL:', config.baseURL + config.url);
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error.message);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ Response Success:', response.status);
//     return response;
//   },
//   (error) => {
//     console.error('❌ Response Error:');
//     console.error('   Message:', error.message);
//     console.error('   Code:', error.code);
    
//     if (error.response) {
//       console.error('   Status:', error.response.status);
//       console.error('   Data:', error.response.data);
//     } else if (error.request) {
//       console.error('   No response received - Network Error');
//       console.error('   Request was made to:', error.config?.baseURL + error.config?.url);
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;








// yeha se apk file ke liye h 

// api/axios.ts
import axios from "axios";
import { Platform } from "react-native";
import Config from "react-native-config";

// ✅ Function to determine the correct API base URL
const getBaseURL = () => {
  const productionURL = "https://travelya-backend-app.onrender.com"; // 🔗 Render backend URL

  // 👉 If running inside Expo & env variable exists
  if (Config.EXPO_PUBLIC_API_BASE) {
    console.log("🌐 Using EXPO_PUBLIC_API_BASE:", Config.EXPO_PUBLIC_API_BASE);
    return Config.EXPO_PUBLIC_API_BASE;
  }

  // 👉 If in development mode
  if (__DEV__) {
    if (Platform.OS === "android") {
      const url = "http://10.184.209.195:10000"; // 🔧 Local IP (Android device)
      console.log("🔧 Using Android Local URL:", url);
      return url;
    }

    if (Platform.OS === "ios") {
      const url = "http://localhost:10000"; // 🔧 iOS local
      console.log("🔧 Using iOS Local URL:", url);
      return url;
    }

    const url = "http://10.184.209.195:10000"; // 🔧 Physical device (LAN)
    console.log("🔧 Using Physical Device URL:", url);
    return url;
  }

  // 👉 In production (APK build)
  console.log("🚀 Using Production URL:", productionURL);
  return productionURL;
};

// ✅ Create Axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Request interceptor (for logging requests)
api.interceptors.request.use(
  (config) => {
    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error.message);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor (for error/success handling)
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
