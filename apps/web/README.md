# Manga Reader Web App

A Next.js manga reader application with Supabase authentication and database integration.

## Getting Started

### Environment Variables

Copy the `.env.example` file to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

## Supabase Setup

### Client-side Usage

```typescript
import { createClient } from '@/lib/supabase/client'

// In React components
const supabase = createClient()
```

### Server-side Usage

```typescript
import { createServerClient } from '@/lib/supabase/server'

// In Server Components, Route Handlers, or Server Actions
const supabase = await createServerClient()
```

### Authentication Examples

```typescript
import { signIn, signUp, signOut, getUser } from '@/lib/supabase/auth'

// Sign up
const { data, error } = await signUp('user@example.com', 'password')

// Sign in
const { data, error } = await signIn('user@example.com', 'password')

// Sign out
await signOut()

// Get current user (server-side)
const user = await getUser()
```

### Database Types

Update `src/lib/supabase/types.ts` with your database schema types. You can generate these automatically using:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

## Features

- 🔐 Authentication with Supabase Auth
- 📱 PWA support
- 🌙 Dark mode
- 📖 Manga reading interface
- 🔄 Offline support
- 📊 Reading progress tracking

## Architecture

- **Framework**: Next.js 13+ with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI
- **State Management**: React Query (TanStack Query)
- **Type Safety**: TypeScript throughout 