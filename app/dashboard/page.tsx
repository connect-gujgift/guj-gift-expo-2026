'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (exhibitor) {
        setRole('exhibitor')
      } else {
        setRole('visitor')
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center font-bold text-slate-400">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">
            {role === 'exhibitor' ? 'Exhibitor Panel' : 'My Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 font-medium">Welcome back</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-xs h-8">
          Sign Out
        </Button>
      </div>

      {/* --- VISITOR VIEW --- */}
      {role === 'visitor' && (
        <div className="grid gap-4">
          <Card className="border-l-4 border-orange-500 shadow-sm">
            <CardHeader>
              <CardTitle>My Entry Pass</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 font-bold hover:bg-orange-700 py-6" onClick={() => router.push('/badge')}>
                VIEW MY BADGE
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full font-bold" onClick={() => router.push('/directory')}>
                FIND STALL NUMBERS
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- EXHIBITOR VIEW (Now Focused on Scanning) --- */}
      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {/* THE BIG ACTION BUTTON */}
          <Card className="border-4 border-blue-600 shadow-lg bg-blue-50">
            <CardContent className="p-6 text-center">
              <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
                📷
              </div>
              <h2 className="text-xl font-black text-blue-900 mb-2">SCAN VISITOR BADGE</h2>
              <p className="text-sm text-blue-700 mb-6 font-medium">
                Scan QR codes to collect leads instantly.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 text-xl shadow-xl"
                onClick={() => alert("Scanner Feature Coming Next!")} // WE WILL BUILD THIS NEXT
              >
                START SCANNING
              </Button>
            </CardContent>
          </Card>

          {/* Scanned Leads Count (Placeholder) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-black text-slate-900">0</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Leads Scanned</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
              <Button variant="ghost" className="text-xs text-blue-600 font-bold w-full h-full">
                View All Leads →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}