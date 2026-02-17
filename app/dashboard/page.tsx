'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner' // IMPORT THE NEW SCANNER

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  
  // SCANNER STATES
  const [scanning, setScanning] = useState(false)
  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [router])

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
      fetchLeads(user.id)
    } else {
      setRole('visitor')
    }
    setLoading(false)
  }

  const fetchLeads = async (exhibitorId: string) => {
    const { data } = await supabase
      .from('leads')
      .select('*, visitors(full_name, company_name, email, mobile)')
      .eq('exhibitor_id', exhibitorId)
      .order('created_at', { ascending: false })
    
    if (data) setLeads(data)
  }

  // --- NEW SCANNER LOGIC ---
  const handleScan = (text: string | null) => {
      if (text) {
        setScanning(false) // Close camera immediately
        saveLead(text)
      }
  }

  const saveLead = async (visitorId: string) => {
    if (visitorId.length < 10) return alert("Invalid QR Code")

    const { error } = await supabase
      .from('leads')
      .insert([
        { exhibitor_id: user.id, visitor_id: visitorId }
      ])

    if (error) {
      // 99% of errors are "duplicate key" (already scanned)
      alert("You have already scanned this visitor!")
    } else {
      alert("✅ LEAD CAPTURED!")
      fetchLeads(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900 uppercase">
          {role === 'exhibitor' ? 'Lead Scanner' : 'My Dashboard'}
        </h1>
        <Button variant="outline" onClick={handleLogout} className="text-xs h-8">Sign Out</Button>
      </div>

      {role === 'visitor' && (
        <div className="grid gap-4">
          <Card className="border-l-4 border-orange-500 shadow-sm">
            <CardHeader><CardTitle>My Entry Pass</CardTitle></CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 font-bold hover:bg-orange-700 py-6" onClick={() => router.push('/badge')}>
                VIEW MY BADGE
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Directory</CardTitle></CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full font-bold" onClick={() => router.push('/directory')}>
                FIND STALL NUMBERS
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {/* CAMERA SECTION */}
          {scanning ? (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-sm bg-black rounded-xl overflow-hidden relative border-2 border-slate-700">
                
                    {/* THE NEW SCANNER COMPONENT */}
                <Scanner 
                    onScan={(result) => {
                        if (result && result.length > 0) {
                            handleScan(result[0].rawValue)
                        }
                    }}
                    onError={(error) => console.log(error)}
                    // FIX: Removed 'audio' which caused the error
                    components={{ finder: false }} 
                    constraints={{ facingMode: 'environment' }} // Force Back Camera
                />

                {/* Our Custom Overlay */}
                <div className="absolute inset-0 border-4 border-blue-500/50 pointer-events-none animate-pulse"></div>
                <p className="absolute bottom-4 left-0 right-0 text-center text-white font-bold bg-black/50 py-2">
                  Scanning...
                </p>
              </div>
              
              <Button 
                variant="destructive" 
                className="mt-8 px-8 py-6 text-lg font-bold w-full max-w-sm"
                onClick={() => setScanning(false)}
              >
                CANCEL SCAN
              </Button>
            </div>
          ) : (
            <Card className="border-4 border-blue-600 shadow-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setScanning(true)}>
              <CardContent className="p-8 text-center">
                <div className="mb-4 bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
                  📷
                </div>
                <h2 className="text-2xl font-black text-blue-900 mb-2">SCAN VISITOR BADGE</h2>
                <p className="text-blue-700 font-medium">Tap here to open camera</p>
              </CardContent>
            </Card>
          )}

          {/* LEADS LIST */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-4 uppercase">Scanned Leads ({leads.length})</h2>
            {leads.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed text-slate-400">
                No leads scanned yet.
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <Card key={lead.id} className="shadow-sm border-l-4 border-l-green-500">
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900">{lead.visitors?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-slate-500">{lead.visitors?.company_name}</p>
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        📞 {lead.visitors?.mobile || 'No Mobile'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}