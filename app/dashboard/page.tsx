'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [scanning, setScanning] = useState(false)
  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [router])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)

    // Verify if this user is an Exhibitor
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

  // --- FETCH LEADS (MATCHED TO YOUR TABLE STRUCTURE) ---
  const fetchLeads = async (exhibitorId: string) => {
    console.log("Syncing leads for UID:", exhibitorId)
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        visitor_id,
        created_at,
        visitors (
          full_name,
          company_name,
          phone, -- Verified column name from your Supabase screenshot
          email
        )
      `)
      .eq('exhibitor_id', exhibitorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Fetch Error:", error.message)
    } else {
      console.log("Leads found in DB:", data)
      setLeads(data || [])
    }
  }

  const handleScan = (text: string | null) => {
    if (text) {
      setScanning(false)
      saveLead(text)
    }
  }

  const saveLead = async (visitorId: string) => {
    // Validating UUID length
    if (visitorId.length < 20) return alert("Invalid QR Code")

    const { error } = await supabase
      .from('leads')
      .insert([{ exhibitor_id: user.id, visitor_id: visitorId }])

    if (error) {
      alert("Lead already captured or network error.")
    } else {
      alert("✅ SUCCESS: LEAD CAPTURED")
      fetchLeads(user.id) // Reload the list immediately
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center text-slate-400 font-black">STARTING...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {role === 'exhibitor' ? 'Lead Hub' : 'Digital Pass'}
          </h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            Guj Gift Expo 2026
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-xs font-black border-2 border-slate-200">LOGOUT</Button>
      </div>

      {/* VISITOR SECTION */}
      {role === 'visitor' && (
        <div className="grid gap-4">
          <Card className="border-l-[12px] border-orange-500 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase mb-4">Official Entry Badge</h3>
              <Button 
                className="w-full bg-orange-600 font-black hover:bg-orange-700 py-10 text-xl shadow-lg shadow-orange-100" 
                onClick={() => router.push('/badge')}
              >
                SHOW MY QR
              </Button>
            </CardContent>
          </Card>
          
          <Button variant="link" className="text-slate-400 font-bold" onClick={() => router.push('/directory')}>
            VIEW EXHIBITOR LISTING →
          </Button>
        </div>
      )}

      {/* EXHIBITOR SECTION */}
      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {/* CAMERA UI */}
          {scanning ? (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
               <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative border-4 border-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.4)]">
                <Scanner 
                    onScan={(result) => {
                        if (result && result.length > 0) handleScan(result[0].rawValue)
                    }}
                    components={{ finder: false }}
                    constraints={{ facingMode: 'environment' }}
                />
                <div className="absolute inset-0 border-[30px] border-black/60 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-blue-400 rounded-3xl animate-pulse"></div>
              </div>
              <Button 
                variant="destructive" 
                className="mt-16 px-16 py-8 text-xl font-black rounded-full"
                onClick={() => setScanning(false)}
              >
                STOP SCANNING
              </Button>
            </div>
          ) : (
            <Card 
              className="border-0 shadow-2xl bg-gradient-to-br from-blue-700 to-indigo-900 active:scale-95 transition-all" 
              onClick={() => setScanning(true)}
            >
              <CardContent className="p-10 text-center text-white">
                <div className="mb-6 bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto text-5xl backdrop-blur-sm">
                  ⚡
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Scan Badge</h2>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-70">Instant Lead Capture</p>
              </CardContent>
            </Card>
          )}

          {/* DYNAMIC LEADS LIST */}
          <div className="pt-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
                Your Connections ({leads.length})
            </h2>
            
            {leads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-300 font-bold uppercase text-[10px]">No leads captured yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="border-0 shadow-md bg-white rounded-3xl overflow-hidden">
                    <div className="p-5 flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-black text-white">
                        {lead.visitors?.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 uppercase leading-tight truncate">
                            {lead.visitors?.full_name || "Unknown"}
                        </h3>
                        <p className="text-[10px] text-blue-600 font-black uppercase truncate mt-0.5">
                            {lead.visitors?.company_name || "Company Not Provided"}
                        </p>
                        
                        {/* Display Phone from DB */}
                        {lead.visitors?.phone && (
                            <div className="inline-flex items-center gap-2 mt-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <span className="text-[10px] text-green-700 font-black uppercase">
                                   📞 {lead.visitors.phone}
                                </span>
                            </div>
                        )}
                      </div>
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