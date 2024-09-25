import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8HmOQP0uYytYVt0BPj6-aZIITAJGm70E",
  authDomain: "fir-b5-lab2.firebaseapp.com",
  projectId: "fir-b5-lab2",
  storageBucket: "fir-b5-lab2.appspot.com",
  messagingSenderId: "882811418455",
  appId: "1:882811418455:web:5f0447155a4aa99359f012",
  measurementId: "G-YQBXZTFTYW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };
