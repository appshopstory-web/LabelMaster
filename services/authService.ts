import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  provider: 'google' | 'github';
}

/**
 * Realiza login com Google usando Supabase Auth
 */
export const signInWithGoogle = async (): Promise<{ user: AuthUser | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase não configurado') };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (error) throw error;
    
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Faz logout do usuário
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  if (!supabase) {
    return { error: new Error('Supabase não configurado') };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Obtém a sessão atual do usuário
 */
export const getSession = async (): Promise<{ user: AuthUser | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase não configurado') };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;

    if (data.session?.user) {
      const user: AuthUser = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'Usuário',
        avatar_url: data.session.user.user_metadata?.avatar_url || '',
        provider: (data.session.user.app_metadata?.provider as 'google' | 'github') || 'google',
      };
      return { user, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

/**
 * Monitora mudanças de estado de autenticação
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Usuário',
        avatar_url: session.user.user_metadata?.avatar_url || '',
        provider: (session.user.app_metadata?.provider as 'google' | 'github') || 'google',
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => {
    data?.subscription?.unsubscribe();
  };
};
