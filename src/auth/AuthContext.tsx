import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyProfile } from '../api/memberProfile';
import type { RegisteredAppUser } from '../api/registerMember';
import { appLog, tokenPreview } from '../utils/appLog';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const SESSION_KEY = '@researchxp/auth_session';

/** Cleared on sign-out. Add keys here if we persist other member-specific data. */
const USER_RELATED_ASYNC_STORAGE_KEYS = [SESSION_KEY] as const;

export type AuthSession = {
  email: string;
  token: string;
  /** Set when signing in from login / verify; omitted in older stored sessions. */
  user?: RegisteredAppUser;
};

function userFromStorage(raw: unknown): RegisteredAppUser | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.email !== 'string' || typeof o.name !== 'string') {
    return null;
  }
  return raw as RegisteredAppUser;
}

type AuthContextValue = {
  email: string | null;
  token: string | null;
  /** Profile from the last successful login or verify; null if not stored yet. */
  user: RegisteredAppUser | null;
  isSignedIn: boolean;
  /** Hydration finished (AsyncStorage read). */
  ready: boolean;
  signInWithSession: (session: AuthSession) => Promise<void>;
  /**
   * Persists the latest profile to memory and storage (e.g. after PATCH /me
   * or a background profile fetch). Requires an active email + token.
   */
  updateSessionUser: (next: RegisteredAppUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<RegisteredAppUser | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  /** Prevents a slow initial profile fetch from writing after sign-out / account deletion. */
  const activeTokenRef = useRef<string | null>(null);

  const signOut = useCallback(async () => {
    appLog('auth', 'signOut (clearing user session storage)');
    activeTokenRef.current = null;
    await AsyncStorage.removeMany([...USER_RELATED_ASYNC_STORAGE_KEYS]);
    setEmail(null);
    setToken(null);
    setUser(null);
    setIsSignedIn(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<AuthSession>;
          if (parsed?.email && parsed?.token) {
            const profile = userFromStorage(parsed.user);
            activeTokenRef.current = parsed.token;
            setEmail(parsed.email);
            setToken(parsed.token);
            setUser(profile);
            setIsSignedIn(true);
            appLog('auth', 'restored session from storage', {
              email: parsed.email,
              token: tokenPreview(parsed.token),
              hasUserProfile: Boolean(profile),
            });
            if (!profile) {
              const tokenAtFetchStart = parsed.token;
              void fetchMyProfile(parsed.token)
                .then(fetched => {
                  if (cancelled) {
                    return;
                  }
                  if (fetched === 'account_disabled') {
                    appLog('auth', 'session cleared: account suspended on server');
                    void signOut();
                    return;
                  }
                  if (!fetched) {
                    return;
                  }
                  if (activeTokenRef.current !== tokenAtFetchStart) {
                    appLog('auth', 'ignored stale profile fetch (session cleared)');
                    return;
                  }
                  setUser(fetched);
                  return AsyncStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                      email: parsed.email,
                      token: parsed.token,
                      user: fetched,
                    }),
                  );
                })
                .catch(() => {
                  /* offline or token expired */
                });
            }
          } else {
            appLog('auth', 'session JSON missing email or token');
          }
        } else if (!cancelled) {
          appLog('auth', 'no session in storage (signed out or first launch)');
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
  }, [signOut]);

  const signInWithSession = useCallback(async (session: AuthSession) => {
    appLog('auth', 'signInWithSession', {
      email: session.email,
      token: tokenPreview(session.token),
    });
    activeTokenRef.current = session.token;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setEmail(session.email);
    setToken(session.token);
    setUser(session.user ?? null);
    setIsSignedIn(true);
  }, []);

  const updateSessionUser = useCallback(
    async (next: RegisteredAppUser) => {
      if (!email || !token) {
        return;
      }
      setUser(next);
      const session: AuthSession = { email, token, user: next };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },
    [email, token],
  );

  const value = useMemo(
    () => ({
      email,
      token,
      user,
      isSignedIn,
      ready,
      signInWithSession,
      updateSessionUser,
      signOut,
    }),
    [email, token, user, isSignedIn, ready, signInWithSession, updateSessionUser, signOut],
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
