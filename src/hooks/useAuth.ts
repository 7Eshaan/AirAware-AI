import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  authMessage: string | null;
  isConfigured: boolean;
}

interface LocalStoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

const LOCAL_USERS_KEY = 'airaware_local_auth_users';
const LOCAL_SESSION_KEY = 'airaware_local_auth_session';

function getLocalUsers(): LocalStoredAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalStoredAccount[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save local auth users', e);
  }
}

function getLocalSession(): { user: User; session: Session } | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalSession(data: { user: User; session: Session } | null): void {
  try {
    if (data) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Failed to save local auth session', e);
  }
}

export function useAuth() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(() => (!configured ? getLocalSession()?.user ?? null : null));
  const [session, setSession] = useState<Session | null>(() => (!configured ? getLocalSession()?.session ?? null : null));
  const [isLoading, setIsLoading] = useState<boolean>(configured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1. If Supabase is NOT configured, local session is already initialized
    if (!configured) return;

    // 2. If Supabase IS configured, connect to live Supabase Auth
    async function initializeSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        }
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Failed to retrieve Supabase auth session:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setAuthError(null);
      setAuthMessage(null);
      setIsLoading(true);

      const trimmedEmail = email.trim().toLowerCase();
      const name = displayName || trimmedEmail.split('@')[0];

      // --- Local Dev Mode Fallback ---
      if (!configured) {
        await new Promise((r) => setTimeout(r, 400));
        const users = getLocalUsers();
        const existing = users.find((u) => u.email === trimmedEmail);

        if (existing) {
          const err = 'An account with this email already exists. Please sign in.';
          setAuthError(err);
          setIsLoading(false);
          return { data: null, error: new Error(err) };
        }

        const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newAccount: LocalStoredAccount = {
          id: newId,
          email: trimmedEmail,
          passwordHash: btoa(password),
          displayName: name,
          createdAt: new Date().toISOString(),
        };

        saveLocalUsers([...users, newAccount]);

        const mockUser: User = {
          id: newId,
          app_metadata: { provider: 'local' },
          user_metadata: { display_name: name },
          aud: 'authenticated',
          confirmation_sent_at: '',
          recovery_sent_at: '',
          email_change_sent_at: '',
          new_email: '',
          invited_at: '',
          action_link: '',
          email: trimmedEmail,
          phone: '',
          created_at: newAccount.createdAt,
          confirmed_at: newAccount.createdAt,
          email_confirmed_at: newAccount.createdAt,
          phone_confirmed_at: '',
          last_sign_in_at: newAccount.createdAt,
          role: 'authenticated',
          updated_at: newAccount.createdAt,
        };

        const mockSession: Session = {
          access_token: `mock_jwt_${newId}`,
          refresh_token: `mock_refresh_${newId}`,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        };

        saveLocalSession({ user: mockUser, session: mockSession });
        setUser(mockUser);
        setSession(mockSession);
        setIsLoading(false);
        setAuthMessage('Account created successfully (Local Dev Mode)!');
        return { data: { user: mockUser, session: mockSession }, error: null };
      }

      // --- Live Supabase Cloud Sign Up ---
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          return { data: null, error };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setAuthMessage('Signed in successfully!');
        } else if (data.user) {
          setAuthMessage('Account created! Please check your email to confirm registration.');
        }

        return { data, error: null };
      } catch (err: any) {
        const message = err?.message || 'Failed to sign up';
        setAuthError(message);
        return { data: null, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [configured]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      setAuthMessage(null);
      setIsLoading(true);

      const trimmedEmail = email.trim().toLowerCase();

      // --- Local Dev Mode Fallback ---
      if (!configured) {
        await new Promise((r) => setTimeout(r, 400));
        const users = getLocalUsers();
        const account = users.find((u) => u.email === trimmedEmail);

        if (!account || account.passwordHash !== btoa(password)) {
          const err = 'Invalid email or password. If you are new, click Create Account.';
          setAuthError(err);
          setIsLoading(false);
          return { data: null, error: new Error(err) };
        }

        const mockUser: User = {
          id: account.id,
          app_metadata: { provider: 'local' },
          user_metadata: { display_name: account.displayName },
          aud: 'authenticated',
          confirmation_sent_at: '',
          recovery_sent_at: '',
          email_change_sent_at: '',
          new_email: '',
          invited_at: '',
          action_link: '',
          email: account.email,
          phone: '',
          created_at: account.createdAt,
          confirmed_at: account.createdAt,
          email_confirmed_at: account.createdAt,
          phone_confirmed_at: '',
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        };

        const mockSession: Session = {
          access_token: `mock_jwt_${account.id}`,
          refresh_token: `mock_refresh_${account.id}`,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        };

        saveLocalSession({ user: mockUser, session: mockSession });
        setUser(mockUser);
        setSession(mockSession);
        setIsLoading(false);
        setAuthMessage('Signed in successfully (Local Dev Mode)!');
        return { data: { user: mockUser, session: mockSession }, error: null };
      }

      // --- Live Supabase Cloud Sign In ---
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setAuthError(error.message);
          return { data: null, error };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }

        return { data, error: null };
      } catch (err: any) {
        const message = err?.message || 'Failed to sign in';
        setAuthError(message);
        return { data: null, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [configured]
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    setAuthMessage(null);

    if (!configured) {
      saveLocalSession(null);
      setUser(null);
      setSession(null);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
        return { error };
      }
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to sign out');
      return { error: err };
    }
  }, [configured]);

  const clearError = useCallback(() => {
    setAuthError(null);
    setAuthMessage(null);
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: Boolean(user),
    authError,
    authMessage,
    isConfigured: configured,
    signUp,
    signIn,
    signOut,
    clearError,
  };
}
