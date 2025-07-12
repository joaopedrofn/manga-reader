#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Setting up Supabase for your project...\n')

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists')
} else {
  // Copy .env.example to .env.local
  const examplePath = path.join(process.cwd(), '.env.example')
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath)
    console.log('✅ Created .env.local from .env.example')
  } else {
    console.log('❌ .env.example not found')
  }
}

console.log('\n📋 Next steps:')
console.log('1. Create a new project at https://supabase.com/dashboard')
console.log('2. Go to Settings > API in your Supabase project')
console.log('3. Copy your project URL and API keys')
console.log('4. Update your .env.local file with:')
console.log('   - NEXT_PUBLIC_SUPABASE_URL=your_project_url')
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
console.log('   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
console.log('\n🔧 Optional: Generate TypeScript types')
console.log('   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts')
console.log('\n📚 Documentation:')
console.log('   - Authentication: https://supabase.com/docs/guides/auth')
console.log('   - Database: https://supabase.com/docs/guides/database')
console.log('   - Next.js Integration: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs')
console.log('\n✨ Your Supabase setup is ready! Happy coding!') 