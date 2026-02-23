'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey)

export async function createExhibitorAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string // NEW: Capture phone
  const isStaff = formData.get('is_staff') === 'true'
  
  // NEW: Logic to extract Stall and Company from the dropdown selection
  const stallSelection = formData.get('stall_selection') as string
  let finalCompanyName = formData.get('company_name') as string // Used for Staff
  let finalStallNumber = ''

  if (!isStaff && stallSelection) {
    const [stallNo, company] = stallSelection.split('|')
    finalStallNumber = stallNo
    finalCompanyName = company
  }

  try {
    // 1. Create the Auth User securely via Service Role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) return { success: false, message: authError.message }

    // 2. Insert into Exhibitors table with all new fields
    const { error: dbError } = await supabaseAdmin
      .from('exhibitors')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        phone: phone, // Saved to DB
        company_name: isStaff ? (finalCompanyName || "REGISTRATION TEAM") : finalCompanyName,
        stall_number: finalStallNumber, // Automatically linked
        is_staff: isStaff,
        email: email
      })

    if (dbError) {
      // Cleanup auth if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: dbError.message }
    }

    return { success: true, message: isStaff ? "Staff Added Successfully!" : "Exhibitor Account Created & Linked!" }
    
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}