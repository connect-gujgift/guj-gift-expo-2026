import { createClient } from '@supabase/supabase-js'

// Use fallback strings to prevent build crashes if env vars are temporarily missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qbedmtszalyidduqnjun.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZWRtdHN6YWx5aWRkdXFuanVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjQwNTcsImV4cCI6MjA4NjY0MDA1N30.3nWMx05zMzW8rj6FH6PTK9FyJj9iKC8mK4evgVKIZAY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)