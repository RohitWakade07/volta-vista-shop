# Firebase Setup Guide

## 🔧 Fixing "Missing or insufficient permissions" Error

The error you're seeing is due to Firestore security rules not being properly configured. Follow these steps to fix it:

### Step 1: Deploy Firestore Security Rules

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```bash
   firebase init firestore
   ```
   - Select your project: `ekart-e973c`
   - Use existing rules file: `firestore.rules`
   - Use existing indexes file: `firestore.indexes.json`

4. **Deploy the security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 2: Enable Google Authentication

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `ekart-e973c`
3. **Navigate to Authentication**: Left sidebar → Authentication
4. **Go to Sign-in method**: Click the "Sign-in method" tab
5. **Enable Google**:
   - Click on "Google" provider
   - Toggle it ON
   - Add your project support email
   - Add authorized domains:
     - `localhost` (for development)
     - Your production domain (when ready)
   - Save changes

### Step 3: Verify Firestore Database

1. **Go to Firestore Database**: Left sidebar → Firestore Database
2. **Create database** (if not exists):
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location (choose closest to your users)

### Step 4: Test the Application

After deploying the rules and enabling Google auth:

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Google Sign-In**:
   - Go to http://localhost:8083/auth/login
   - Click "Sign in with Google"
   - The authentication should now work

### 🔒 Security Rules Explanation

The `firestore.rules` file includes:

- **Users**: Users can read/write their own data, admins can read all
- **Referral Codes**: Anyone can read, authenticated users can write
- **Products**: Anyone can read, only admins can write
- **Orders**: Users can manage their own orders, admins can see all
- **Admin Collections**: Only admins have access

### 🚨 Troubleshooting

**If you still get permission errors:**

1. **Check Firebase Console**:
   - Go to Firestore Database → Rules
   - Verify the rules are deployed correctly

2. **Check Authentication**:
   - Go to Authentication → Users
   - Verify users are being created

3. **Check Console Logs**:
   - Open browser developer tools
   - Look for specific error messages

4. **Test with Test Mode** (temporary):
   ```javascript
   // In firestore.rules, temporarily use:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   ⚠️ **Warning**: This allows full access - only use for testing!

### 📞 Support

If you continue to have issues:

1. Check the Firebase Console for specific error messages
2. Verify your Firebase project configuration in `src/lib/firebase.ts`
3. Ensure your domain is added to authorized domains in Firebase Console

The application should now work with proper authentication and database permissions! 