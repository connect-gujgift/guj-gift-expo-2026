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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {userEmail}</p>
        </div>

        {/* 1. ADMIN SECTION - ONLY VISIBLE TO ORGANIZER */}
        {userEmail === 'connect@shreebalajievent.com' && (
          <Card className="border-2 border-orange-500 bg-orange-50 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="text-orange-800 text-lg flex items-center gap-2">
                🛡️ Organizer Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-orange-700 mb-4 font-medium">
                Entry Gate Management for GMDC Ground.
              </p>
              <Link href="/admin/scanner">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold shadow-lg">
                  🚀 OPEN GATE SCANNER
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 2. VISITOR EXPLORATION - VISIBLE TO EVERYONE */}
        <Card className="border-gray-200 shadow-sm mb-6 border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-gray-700 text-md">Event Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Explore participating companies and their stall locations.
            </p>
            <Link href="/exhibitors">
              <Button variant="outline" className="w-full py-6 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold">
                🏢 BROWSE EXHIBITORS
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. NETWORKING SECTION */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-700 text-md">Networking</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10 bg-white rounded-b-xl">
            <div className="text-4xl mb-2">🤝</div>
            <p className="text-gray-400 text-sm">Meeting requests will appear here soon.</p>
          </CardContent>
        </Card>

        <div className="mt-10 text-center">
           <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            GUJ GIFT EXPO 2026 • Ahmedabad
          </p>
        </div>
      </div>
    </div>
  )
}