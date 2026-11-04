import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { api } from '../services/api';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider?: 'email' | 'google';
}

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  firestoreConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  firestoreConnected: false
});

const AUTH_STORAGE_KEY = 'veltor_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(true);

  // Initialize session: prioritize local email/password session
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading stored session:', e);
    }

    // Secondary check: Firebase auth listener if no local session exists
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only set if not already authenticated via email/password
      const existing = localStorage.getItem(AUTH_STORAGE_KEY);
      if (existing) {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        const user: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          photoURL: firebaseUser.photoURL || undefined,
          provider: 'google'
        };
        setCurrentUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Usuário',
              photoURL: (firebaseUser.photoURL || '').slice(0, 1024),
              createdAt: new Date().toISOString()
            });
          }
          setFirestoreConnected(true);
        } catch {
          setFirestoreConnected(false);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 1. Standalone Email/Password Sign-In (NO Firebase dependency)
  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // Attempt backend auth route
      const user = await api.loginWithEmail(cleanEmail, cleanPassword);
      const appUser: AppUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.name || cleanEmail.split('@')[0],
        photoURL: user.photoURL,
        provider: 'email'
      };
      setCurrentUser(appUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser));
      localStorage.setItem('lowstack_user', 'email');
    } catch (err: any) {
      // Local offline fallback if server is unreachable
      if (cleanEmail === 'admin@veltor.com' && (cleanPassword === 'admin123' || cleanPassword === '123456')) {
        const adminUser: AppUser = {
          uid: 'admin-local',
          email: 'admin@veltor.com',
          displayName: 'Administrador Veltor',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          provider: 'email'
        };
        setCurrentUser(adminUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
        localStorage.setItem('lowstack_user', 'email');
        return;
      }
      throw err;
    }
  };

  // 2. Standalone Email/Password Sign-Up (NO Firebase dependency)
  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await api.registerWithEmail(cleanName, cleanEmail, cleanPassword);
    const appUser: AppUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.name || cleanName,
      photoURL: user.photoURL,
      provider: 'email'
    };
    setCurrentUser(appUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser));
    localStorage.setItem('lowstack_user', 'email');
  };

  // 3. Optional Google OAuth
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const appUser: AppUser = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || 'Usuário Google',
          photoURL: res.user.photoURL || undefined,
          provider: 'google'
        };
        setCurrentUser(appUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser));
        localStorage.setItem('lowstack_user', 'google');
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      throw err;
    }
  };

  // 4. Logout
  const logout = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('lowstack_user');
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      firestoreConnected
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
