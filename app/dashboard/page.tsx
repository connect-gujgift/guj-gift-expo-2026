'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isExhibitor, setIsExhibitor] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        
        // CHECK IF LOGGED-IN EMAIL MATCHES A PAID EXHIBITOR'S CONTACT_EMAIL
        const { data: exhibitorData } = await supabase
          .from('exhibitors')
          .select('id, contact_email')
          .eq('contact_email', user.email)
          .single()
        
        if (exhibitorData) {
          setIsExhibitor(true)
          
          // AUTO-LINK: If the ID in the table is empty, update it with this User's ID
          if (!exhibitorData.id || exhibitorData.id !== user.id) {
            await supabase
              .from('exhibitors')
              .update({ id: user.id })
              .eq('contact_email', user.email)
          }
        }
      }
      setLoading(false)
    }
    checkUserRole()
  }, [])

  if (loading) return <div className="p-10 text-center font-bold">Loading GUJ GIFT EXPO...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-xs">{userEmail}</p>
          </div>
          <div className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase">
            {isExhibitor ? 'Exhibitor' : 'Visitor'}
          </div>
        </div>

        {/* 1. EXHIBITOR PANEL (Only for Paid Stall Holders) */}
        {isExhibitor && (
          <Card className="border-t-8 border-t-green-600 shadow-lg bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                🏢 Stall Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">View and respond to B2B meeting requests for your stall.</p>
              <Link href="/exhibitor/meetings">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 font-bold text-md shadow-md">
                   📅 VIEW MY MEETINGS
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 2. VISITOR PASS (For Everyone) */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl uppercase tracking-tight">Your Entry Pass</h3>
                <p className="text-blue-100 text-xs opacity-90">Required for GMDC Entry</p>
              </div>
              <Link href="/badge">
                <Button className="bg-white text-blue-700 hover:bg-gray-100 font-black px-6">
                  VIEW BADGE
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 3. EVENT TOOLS */}
        <Card className="border-gray-200 shadow-sm border-t-4 border-t-orange-500">
          <CardHeader><CardTitle className="text-gray-700 text-md">Event Navigation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link href="/exhibitors">
              <Button variant="outline" className="w-full py-5 border-orange-200 text-orange-700 hover:bg-orange-50 font-bold">
                🏢 BROWSE DIRECTORY
              </Button>
            </Link>
            
            {/* ORGANIZER SCANNER (Hidden for regular users) */}
            {userEmail === 'connect@shreebalajievent.com' && (
              <Link href="/admin/scanner">
                <Button className="w-full bg-orange-600 text-white py-5 font-bold shadow-md mt-2">
                  🚀 OPEN GATE SCANNER
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
          GUJ GIFT EXPO 2026 • Shree Balaji Event LLP
        </p>
      </div>
    </div>
  )
}