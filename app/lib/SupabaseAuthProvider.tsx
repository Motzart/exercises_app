import type { Session, User } from '@supabase/supabase-js';
import { createContext, useEffect, useState } from 'react';
import { supabaseClient } from './supabaseClient';

type AuthState = {
  user: User | null | undefined;
  session: Session | null | undefined;
  isAuthenticating: boolean;
};

export const SupabaseAuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isAuthenticating: true,
});

const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    function syncAuthState(nextSession: Session | null) {
      if (!isMounted) return;
      setUser(nextSession?.user ?? null);
      setSession(nextSession);
      setIsAuthenticating(false);
    }

    supabaseClient.auth
      .getSession()
      .then(({ data }) => syncAuthState(data.session))
      .catch(() => setIsAuthenticating(false));

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, nextSession) => syncAuthState(nextSession),
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseAuthContext.Provider value={{ user, session, isAuthenticating }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export { SupabaseAuthProvider };
