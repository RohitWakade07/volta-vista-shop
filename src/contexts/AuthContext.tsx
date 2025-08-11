import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalEarnings: number;
  createdAt: Date;
  lastLogin: Date;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect running...'); // Debug log
    
    // Check if Firebase is initialized
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user'); // Debug log
        setCurrentUser(user);
        if (user) {
          // Fetch user profile from Firestore
          try {
            if (!db) {
              console.error('Firebase db is not initialized');
              setUserProfile(null);
              return;
            }
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setUserProfile(userDoc.data() as UserProfile);
            }
          } catch (firestoreError: any) {
            console.error('Error fetching user profile:', firestoreError);
            // Don't crash the app if Firestore fails
            // Just set userProfile to null and continue
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // Don't crash the app, just set loading to false
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not initialized. Please refresh the page.');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      if (db) {
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: new Date()
        });
      }
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'An error occurred during sign in.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile for Google sign-in
        const newReferralCode = generateReferralCode();
        
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          role: 'user',
          referralCode: newReferralCode,
          referralCount: 0,
          totalEarnings: 0,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        try {
          // Save user profile to Firestore
          await setDoc(doc(db, 'users', result.user.uid), userProfile);
          
          // Save referral code mapping
          await setDoc(doc(db, 'users', 'referralCodes', newReferralCode), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          });

          setUserProfile(userProfile);
        } catch (firestoreError: any) {
          // Handle Firestore permission errors
          if (firestoreError.code === 'permission-denied') {
            throw new Error('Database access denied. Please contact support to configure proper permissions.');
          }
          throw new Error('Failed to create user profile. Please try again.');
        }
      } else {
        try {
          // Update last login for existing user
          await updateDoc(doc(db, 'users', result.user.uid), {
            lastLogin: new Date()
          });
        } catch (firestoreError: any) {
          // Handle Firestore permission errors
          if (firestoreError.code === 'permission-denied') {
            throw new Error('Database access denied. Please contact support to configure proper permissions.');
          }
          // Continue with sign-in even if update fails
          console.warn('Failed to update last login:', firestoreError);
        }
      }
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'An error occurred during sign in.';
      
      switch (error.code) {
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-in is not enabled. Please contact support.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many sign-in attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, referralCode?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Generate referral code
      const newReferralCode = generateReferralCode();
      
      // Create user profile
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email,
        displayName,
        role: 'user',
        referralCode: newReferralCode,
        referralCount: 0,
        totalEarnings: 0,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      try {
        // If referral code provided, validate and update
        if (referralCode) {
          const referrerDoc = await getDoc(doc(db, 'users', 'referralCodes', referralCode));
          if (referrerDoc.exists()) {
            const referrerData = referrerDoc.data();
            userProfile.referredBy = referrerData.uid;
            
            // Update referrer's referral count
            await updateDoc(doc(db, 'users', referrerData.uid), {
              referralCount: referrerData.referralCount + 1
            });
          }
        }

        // Save user profile to Firestore
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        
        // Save referral code mapping
        await setDoc(doc(db, 'users', 'referralCodes', newReferralCode), {
          uid: result.user.uid,
          email,
          displayName
        });

        setUserProfile(userProfile);
      } catch (firestoreError: any) {
        // Handle Firestore permission errors
        if (firestoreError.code === 'permission-denied') {
          throw new Error('Database access denied. Please contact support to configure proper permissions.');
        }
        throw new Error('Failed to create user profile. Please try again.');
      }
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'An error occurred during account creation.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Account creation is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear user profile state
      setUserProfile(null);
      setCurrentUser(null);
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'An error occurred during logout.';
      
      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many logout attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), data);
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    logout,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 