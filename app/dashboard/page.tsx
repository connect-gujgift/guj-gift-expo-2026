'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    getUser()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Dashboard</h1>
      <p>Welcome back, {userEmail}</p>

      {/* ONLY SHOW THIS TO ADMIN */}
      {userEmail === 'connect@shreebalajievent.com' && (
        <div className="mt-10 p-6 border-2 border-orange-500 bg-orange-50 rounded-xl">
          <h2 className="text-orange-800 font-bold mb-4">Organizer Tools</h2>
          <Link href="/admin/scanner">
            <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold w-full">
              🚀 OPEN GATE SCANNER
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}