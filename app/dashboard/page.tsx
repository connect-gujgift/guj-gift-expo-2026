'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Dashboard</h1>
        <p className="text-gray-500 mb-8 text-sm">Welcome back, {userEmail}</p>

        {/* ADMIN SECTION - ONLY VISIBLE TO YOU */}
        {userEmail === 'connect@shreebalajievent.com' && (
          <Card className="border-2 border-orange-500 bg-orange-50 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="text-orange-800 text-lg">Organizer Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-orange-700 mb-4">
                Use the tool below to scan visitor badges at the entry gate.
              </p>
              <Link href="/admin/scanner">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold">
                  🚀 OPEN GATE SCANNER
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* REGULAR DASHBOARD CONTENT */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-700 text-md">Meeting Requests</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <p className="text-gray-400 text-sm">No meetings requested yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}