import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SESSION_KEY = '@researchxp/auth_session';

export type AuthSession = {
  email: string;
  token: string;
};

type AuthContextValue = {
  email: string | null;
  token: string | null;
  isSignedIn: boolean;
  /** Hydration finished (AsyncStorage read). */
  ready: boolean;
  signInWithSession: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<AuthSession>;
          if (parsed?.email && parsed?.token) {
            setEmail(parsed.email);
            setToken(parsed.token);
            setIsSignedIn(true);
          }
        }
      } catch {
        /* ignore corrupt storage */
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithSession = useCallback(async (session: AuthSession) => {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setEmail(session.email);
    setToken(session.token);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setEmail(null);
    setToken(null);
    setIsSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      email,
      token,
      isSignedIn,
      ready,
      signInWithSession,
      signOut,
    }),
    [email, token, isSignedIn, ready, signInWithSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
