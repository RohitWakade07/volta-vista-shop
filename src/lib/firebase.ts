import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAFW9DjjBB2fKQLAs-QkVrMBO1eWTPJoSE",
  authDomain: "ultroninov-a6a1e.firebaseapp.com",
  projectId: "ultroninov-a6a1e",
  storageBucket: "ultroninov-a6a1e.firebasestorage.app",
  messagingSenderId: "105295407471",
  appId: "1:105295407471:web:db0886b1c94aca05e1e09a",
  measurementId: "G-7C90BZK7MB"
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let analytics;

try {
  console.log('Initializing Firebase...'); // Debug log
  console.log('Firebase config:', firebaseConfig); // Debug log
  
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized'); // Debug log
  
  auth = getAuth(app);
  console.log('Firebase auth initialized'); // Debug log
  
  // Initialize Firestore with error handling
  try {
    db = getFirestore(app);
    console.log('Firebase db initialized'); // Debug log
  } catch (firestoreError) {
    console.error('Firestore initialization error:', firestoreError);
    console.warn('Firestore may not be enabled in your Firebase project. Please enable Firestore in the Firebase Console.');
    db = null;
  }
  
  // Initialize Storage with error handling
  try {
    storage = getStorage(app);
    console.log('Firebase storage initialized'); // Debug log
  } catch (storageError) {
    console.error('Storage initialization error:', storageError);
    storage = null;
  }
  
  // Initialize Analytics with error handling
  try {
    analytics = getAnalytics(app);
    console.log('Firebase analytics initialized'); // Debug log
  } catch (analyticsError) {
    console.error('Analytics initialization error:', analyticsError);
    analytics = null;
  }
  
  console.log('Firebase initialized successfully'); // Debug log
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.error('Firebase config used:', firebaseConfig);
  // Create fallback objects to prevent crashes
  app = null;
  auth = null;
  db = null;
  storage = null;
  analytics = null;
}

// Initialize Firebase services
export { auth, db, storage, analytics };
export default app; 