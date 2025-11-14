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
// api/axios.ts
// api/axios.ts
import axios from "axios";
import { Platform } from "react-native";

// ✅ Use Expo public env variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE;

// ✅ Function to determine base URL
const getBaseURL = () => {
  const productionURL = "https://travelya-backend-app.onrender.com"; // 👈 NOTE: /api added here

  if (API_BASE_URL) {
    console.log("🌐 Using EXPO_PUBLIC_API_BASE:", API_BASE_URL);
    return API_BASE_URL;
  }

  if (__DEV__) {
    if (Platform.OS === "android") return "http://10.184.209.195:10000/";
    if (Platform.OS === "ios") return "http://localhost:10000/";
    return "http://10.184.209.195:10000/api";
  }

  console.log("🚀 Using Production URL:", productionURL);
  return productionURL;
};

// ✅ Axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Interceptors for logging
api.interceptors.request.use(
  (config) => {
    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
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
