import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBiJ6V-mz6vBEyXCu4jGexCdmpmISYoKRU",
  authDomain: "ekart-e973c.firebaseapp.com",
  projectId: "ekart-e973c",
  storageBucket: "ekart-e973c.firebasestorage.app",
  messagingSenderId: "389632569201",
  appId: "1:389632569201:web:f91fb23af2d5d65e4a10d0",
  measurementId: "G-PCE3XT16KC"
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
  
  db = getFirestore(app);
  console.log('Firebase db initialized'); // Debug log
  
  storage = getStorage(app);
  console.log('Firebase storage initialized'); // Debug log
  
  analytics = getAnalytics(app);
  console.log('Firebase analytics initialized'); // Debug log
  
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