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

  if (loading) return <div className="p-10 text-center font-bold">Loading GUJ GIFT EXPO Dashboard...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome, {userEmail}</p>
        </div>

        {/* 1. ADMIN SECTION - ONLY FOR ORGANIZER */}
        {userEmail === 'connect@shreebalajievent.com' && (
          <Card className="border-2 border-orange-500 bg-orange-50 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-800 text-lg flex items-center gap-2">
                🛡️ Organizer Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/scanner">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold shadow-lg">
                  🚀 OPEN GATE SCANNER
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 2. DIGITAL BADGE SECTION - VISIBLE TO ALL USERS */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl uppercase tracking-tight">Your Entry Pass</h3>
                <p className="text-blue-100 text-xs opacity-90">Required for GMDC Ground Entry</p>
              </div>
              <Link href="/badge">
                <Button className="bg-white text-blue-700 hover:bg-gray-100 font-black px-6 shadow-md">
                  VIEW BADGE
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 3. EVENT DIRECTORY */}
        <Card className="border-gray-200 shadow-sm border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-gray-700 text-md">Event Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/exhibitors">
              <Button variant="outline" className="w-full py-6 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold">
                🏢 BROWSE EXHIBITORS
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 4. NETWORKING */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-700 text-md">Networking</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <div className="text-4xl mb-2">🤝</div>
            <p className="text-gray-400 text-sm">Meeting requests will appear here soon.</p>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
           <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            GUJ GIFT EXPO 2026 • AHMEDABAD
          </p>
        </div>
      </div>
    </div>
  )
}