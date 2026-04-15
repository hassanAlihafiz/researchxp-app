import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type AuthContextValue = {
  email: string | null;
  isSignedIn: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const signIn = useCallback((nextEmail: string) => {
    setEmail(nextEmail);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(() => {
    setEmail(null);
    setIsSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      email,
      isSignedIn,
      signIn,
      signOut,
    }),
    [email, isSignedIn, signIn, signOut],
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
