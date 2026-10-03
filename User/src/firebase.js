import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "sgbountyhunt-2663c.firebaseapp.com",
  projectId: "sgbountyhunt-2663c",
  storageBucket: "sgbountyhunt-2663c.firebasestorage.app",
  messagingSenderId: "667084431113",
  appId: "1:667084431113:web:8d99d124ada6273c8afdd8"
};

// Optionally include measurementId for Analytics (set via EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID)
const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '';
if (measurementId) {
  firebaseConfig.measurementId = measurementId;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics only on web and if measurementId is provided
export let analytics = null;
try {
  if (typeof window !== 'undefined' && measurementId) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  // ignore analytics init errors (e.g., running in non-browser or missing browser features)
}

export default app;
