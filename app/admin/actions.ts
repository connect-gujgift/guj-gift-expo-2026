'use server'

import { createClient } from '@supabase/supabase-js'

// --- BUILD-SAFE ADMIN CLIENT INITIALIZATION ---
// Fallback strings prevent Next.js from throwing "supabaseKey is required" during deployment builds.
const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey)

export async function createExhibitorAction(prevState: any, formData: FormData) {
  // 1. Extract data from form submission
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string // The new person name field
  const companyName = formData.get('company_name') as string
  const stallNumber = formData.get('stall_number') as string
  const category = formData.get('category') as string

  // Failsafe: Prevent action from running if real keys are missing in production
  if (supabaseAdminUrl === 'https://placeholder.supabase.co' || supabaseServiceKey === 'placeholder-service-key') {
    return { success: false, message: 'Server Configuration Error: Missing Supabase Environment Variables in your hosting platform.' }
  }

  try {
    // 2. Create the User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirms their email so they can log in immediately
    })

    if (authError) {
      return { success: false, message: `Auth Error: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, message: 'Auth Error: Failed to generate user ID.' }
    }

    // 3. Create the Profile in the 'exhibitors' table
    const { error: dbError } = await supabaseAdmin
      .from('exhibitors')
      .insert({
        id: authData.user.id,
        full_name: fullName, 
        company_name: companyName,
        stall_number: stallNumber,
        category: category,
        email: email
      })

    if (dbError) {
      // Cleanup: Delete the auth user if the DB insert fails so you don't end up with ghost accounts
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: `Database Error: ${dbError.message}` }
    }

    return { success: true, message: `Successfully onboarded ${fullName} from ${companyName}!` }

  } catch (err: any) {
    return { success: false, message: `System Error: ${err.message}` }
  }
}