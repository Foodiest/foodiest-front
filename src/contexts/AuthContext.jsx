import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [needsSocialSignup, setNeedsSocialSignup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) fetchProfile(session);
      else {
        setProfile(null);
        setNeedsSocialSignup(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(session) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    setNeedsSocialSignup(false);
    setProfile(data ?? null);
  }

  const isLoading = session === undefined;
  const isLoggedIn = !!session;

  return (
    <AuthContext.Provider value={{ session, profile, isLoading, isLoggedIn, needsSocialSignup, refreshProfile: () => fetchProfile(session) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
