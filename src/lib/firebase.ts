import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,   // v9 exports this from "firebase/auth"
  setPersistence,
  browserSessionPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration from the data
const firebaseConfig = {
  apiKey: 'AIzaSyAYgioTZ6XA7_78dQ2huZLvnZ68WfM7-gc',
  authDomain: 'probey-chat-app.firebaseapp.com',
  projectId: 'probey-chat-app',
  storageBucket: 'probey-chat-app.appspot.com',
  messagingSenderId: '111330920089',
  appId: '1:111330920089:android:6b83a7ca6d2ead8a1ada08', // Ensure correct appId is selected based on platform
};

// Initialize Firebase app
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Keep a module-scoped singleton (avoid multiple inits)
let authInstance: Auth | undefined;

if (!authInstance) {
  if (Platform.OS === 'web') {
    const a = getAuth(app);
    setPersistence(a, browserSessionPersistence).catch(() => {});
    authInstance = a;
  } else {
    try {
      // IMPORTANT: register RN persistence BEFORE anyone calls getAuth()
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // if already initialized (fast refresh), reuse it
      authInstance = getAuth(app);
    }
  }
}

export const auth = authInstance!;
export const db = getFirestore(app);
