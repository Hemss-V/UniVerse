// config/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native'; // <--- Import Platform check

// Import Auth functions
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence,
  getAuth 
} from 'firebase/auth';

// Import Storage (for Mobile)
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// --- YOUR CONFIGURATION ---
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize App
const app = initializeApp(firebaseConfig);

// Initialize Database
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Auth (Platform Specific Logic)
let auth;

if (Platform.OS === 'web') {
  // IF WINDOWS/WEB: Use standard browser storage
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  // IF MOBILE (Android/iOS): Use the native storage we installed
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { auth };
export default app;