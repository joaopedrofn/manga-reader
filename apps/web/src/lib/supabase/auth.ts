import { createClient } from './client'

// Client-side auth utilities
export const signUp = async (email: string, password: string) => {
  const supabase = createClient()
  return await supabase.auth.signUp({ email, password })
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

export const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
  const supabase = createClient()
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
} 