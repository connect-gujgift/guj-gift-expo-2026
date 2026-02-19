'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey)

export async function createExhibitorAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const company_name = formData.get('company_name') as string
  const isStaff = formData.get('is_staff') === 'true' // Handle the staff flag

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) return { success: false, message: authError.message }

    const { error: dbError } = await supabaseAdmin
      .from('exhibitors')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        company_name: isStaff ? "REGISTRATION TEAM" : company_name,
        is_staff: isStaff, // Save the role
        email: email
      })

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: dbError.message }
    }

    return { success: true, message: isStaff ? "Staff Added!" : "Exhibitor Added!" }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}