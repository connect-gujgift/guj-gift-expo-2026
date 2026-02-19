'use client'

import { createClient } from '@supabase/supabase-js'

// --- INITIALIZE ADMIN CLIENT ---
// We use the Service Role Key here because standard client cannot create Auth users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is in your .env.local
)

export async function createExhibitorAction(prevState: any, formData: FormData) {
  // 1. Extract data from form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string // Captured from the new field
  const companyName = formData.get('company_name') as string
  const stallNumber = formData.get('stall_number') as string
  const category = formData.get('category') as string

  try {
    // 2. Create the User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      return { success: false, message: `Auth Error: ${authError.message}` }
    }

    // 3. Create the Profile in the 'exhibitors' table
    const { error: dbError } = await supabaseAdmin
      .from('exhibitors')
      .insert({
        id: authData.user.id,
        full_name: fullName, // Saved to the new column
        company_name: companyName,
        stall_number: stallNumber,
        category: category,
        email: email
      })

    if (dbError) {
      // Cleanup: Delete the auth user if the DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: `Database Error: ${dbError.message}` }
    }

    return { success: true, message: `Successfully onboarded ${companyName}!` }

  } catch (err: any) {
    return { success: false, message: `System Error: ${err.message}` }
  }
}