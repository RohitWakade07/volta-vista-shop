# Firebase Setup Guide for Ultron Shop

## Current Issue
The application is showing "400 Bad Request" errors when trying to connect to Firestore. This indicates that Firestore may not be properly enabled in your Firebase project.

## Steps to Fix Firestore Connection Issues

### 1. Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ultroninov-a6a1e`
3. In the left sidebar, click on **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose the closest to your users)
7. Click **"Done"**

### 2. Update Firestore Rules
1. In Firestore Database, go to the **"Rules"** tab
2. Replace the existing rules with the rules from `firestore.rules` file
3. Click **"Publish"**

### 3. Enable Authentication (if not already enabled)
1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** and **"Google"** providers
5. Add your domain to authorized domains

### 4. Test the Connection
1. Refresh your application
2. Check the browser console for Firebase initialization logs
3. Try to sign up/sign in
4. The 400 errors should be resolved

## Current Firebase Configuration
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAFW9DjjBB2fKQLAs-QkVrMBO1eWTPJoSE",
  authDomain: "ultroninov-a6a1e.firebaseapp.com",
  projectId: "ultroninov-a6a1e",
  storageBucket: "ultroninov-a6a1e.firebasestorage.app",
  messagingSenderId: "105295407471",
  appId: "1:105295407471:web:db0886b1c94aca05e1e09a",
  measurementId: "G-7C90BZK7MB"
};
```

## Troubleshooting
- If you still see 400 errors after enabling Firestore, check the browser console for specific error messages
- Make sure your Firebase project is on the Blaze (pay-as-you-go) plan if you need to use external APIs
- Verify that the project ID matches exactly: `ultroninov-a6a1e`

## Contact Information
- Email: ultron.inov@gmail.com
- Phone: +91 9156294374, +91 9307719509, +91 7517769211 