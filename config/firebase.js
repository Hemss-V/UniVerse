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
apiKey: "AIzaSyC7YToioK8NsaAhpx5LBvwJL14WlQQQXrU",
  authDomain: "universe-19eae.firebaseapp.com",
  projectId: "universe-19eae",
  storageBucket: "universe-19eae.appspot.com",
  messagingSenderId: "788889906721",
  appId: "1:788889906721:web:8d9f9ead158a3f9a293d60"
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