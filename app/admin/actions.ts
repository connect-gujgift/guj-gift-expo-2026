'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createExhibitorAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const companyName = formData.get('company_name') as string
  const stallNumber = formData.get('stall_number') as string
  const category = formData.get('category') as string

  // 1. Validation: Check if the email is already in use before trying to create
  const { data: existingUser } = await supabaseAdmin.from('exhibitors').select('id').eq('email', email).single()
  if (existingUser) {
    return { success: false, message: 'Error: An exhibitor with this email already exists.' }
  }

  // 2. Create the Auth User (Login)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true 
  })

  if (authError) {
    return { success: false, message: 'Auth Error: ' + authError.message }
  }

  if (!authData.user) {
    return { success: false, message: 'User creation failed unknown error' }
  }

  // 3. Create the Exhibitor Profile (Database)
  const { error: dbError } = await supabaseAdmin
    .from('exhibitors')
    .insert({
      id: authData.user.id, 
      company_name: companyName,
      stall_number: stallNumber,
      category: category,
      email: email 
    })

  if (dbError) {
    // Cleanup: If DB fails, delete the auth user so we can try again
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { success: false, message: 'Database Error: ' + dbError.message }
  }

  return { success: true, message: `✅ Created Exhibitor: ${companyName}` }
}