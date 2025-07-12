import { createClient } from './server'
import { redirect } from 'next/navigation'

// Server-side auth utilities
export const getUser = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const requireAuth = async () => {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

// Server action for sign out
export const signOutAction = async () => {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
} 