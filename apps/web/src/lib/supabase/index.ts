// Client exports
export { createClient } from './client'

// Server exports
export { createClient as createServerClient } from './server'

// Client-side auth utilities
export {
  signUp,
  signIn,
  signOut,
  signInWithOAuth,
} from './auth'

// Server-side auth utilities
export {
  getUser,
  getSession,
  requireAuth,
  signOutAction,
} from './server-auth'

// Types
export type { Database } from './types'

// Middleware
export { updateSession } from './middleware' 