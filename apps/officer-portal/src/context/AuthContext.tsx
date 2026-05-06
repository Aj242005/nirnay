import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AuthUser, UserRole } from '@nirnay/shared-types';

interface FirebaseUser {
  displayName: string | null;
  email: string | null;
  uid: string;
  photoURL: string | null;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<{ claims: Record<string, any> }>;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  token: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode; requiredRole: UserRole }> = ({
  children,
  requiredRole,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInstance, setAuthInstance] = useState<any>(null);
  const [providerInstance, setProviderInstance] = useState<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (!apiKey || !projectId) {
      console.error('Firebase config not provided. Auth will fail.');
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const { initializeApp } = await import('firebase/app');
        const { getAuth, GoogleAuthProvider, onAuthStateChanged } = await import('firebase/auth');
        const app = initializeApp({
          apiKey,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
          projectId,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        });
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        setAuthInstance(auth);
        setProviderInstance(provider);

        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const idToken = await fbUser.getIdToken();
            const tokenResult = await fbUser.getIdTokenResult();
            const role = (tokenResult.claims.role as UserRole) || 'officer';
            localStorage.setItem('nirnay_token', idToken);
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName,
              role,
              avatarUrl: fbUser.photoURL || undefined,
            });
            setToken(idToken);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('nirnay_token');
          }
          setLoading(false);
        });
      } catch (e) {
        console.warn('Firebase init failed:', e);
        localStorage.removeItem('nirnay_token');
        setLoading(false);
      }
    };
    init();
  }, [requiredRole]);

  const signInWithGoogle = async () => {
    if (!authInstance || !providerInstance) {
      alert('Firebase not configured.');
      return;
    }
    const { signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(authInstance, providerInstance);
  };

  const logout = async () => {
    if (authInstance) {
      const { signOut } = await import('firebase/auth');
      await signOut(authInstance);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('nirnay_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
