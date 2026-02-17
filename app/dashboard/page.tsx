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

  // --- FETCH LEADS WITH ERROR LOGGING ---
  const fetchLeads = async (exhibitorId: string) => {
    console.log("Attempting to fetch leads for:", exhibitorId)
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        visitor_id,
        created_at,
        visitors (
          full_name,
          company_name,
          mobile,
          email
        )
      `)
      .eq('exhibitor_id', exhibitorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Database Fetch Error:", error.message)
    } else {
      console.log("Leads received from DB:", data)
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
    // Basic UUID validation check
    if (visitorId.length < 20) return alert("Invalid QR Code Format")

    const { error } = await supabase
      .from('leads')
      .insert([{ exhibitor_id: user.id, visitor_id: visitorId }])

    if (error) {
      console.error("Save Error:", error.message)
      alert("Lead already scanned or Save failed.")
    } else {
      alert("✅ LEAD CAPTURED!")
      fetchLeads(user.id) // Refresh the list
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold uppercase">Syncing...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase leading-none">
            {role === 'exhibitor' ? 'Lead Manager' : 'My Pass'}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Guj Gift Expo 2026
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-xs h-8 font-bold border-2">EXIT</Button>
      </div>

      {/* VISITOR VIEW */}
      {role === 'visitor' && (
        <div className="grid gap-4">
          <Card className="border-l-8 border-orange-500 shadow-xl overflow-hidden">
            <CardHeader className="bg-orange-50/50 pb-2">
              <CardTitle className="text-orange-900 text-sm font-black uppercase">Your Digital Badge</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Button className="w-full bg-orange-600 font-black hover:bg-orange-700 py-8 text-lg shadow-lg shadow-orange-200" onClick={() => router.push('/badge')}>
                OPEN BADGE
              </Button>
            </CardContent>
          </Card>
          
          <Button variant="ghost" className="w-full text-slate-400 font-bold text-xs" onClick={() => router.push('/directory')}>
            VIEW EXHIBITOR DIRECTORY →
          </Button>
        </div>
      )}

      {/* EXHIBITOR VIEW */}
      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {/* SCANNER UI */}
          {scanning ? (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
               <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                <Scanner 
                    onScan={(result) => {
                        if (result && result.length > 0) handleScan(result[0].rawValue)
                    }}
                    components={{ finder: false }}
                    constraints={{ facingMode: 'environment' }}
                />
                <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400/50 rounded-2xl animate-pulse"></div>
              </div>
              <Button 
                variant="destructive" 
                className="mt-12 px-12 py-8 text-xl font-black rounded-full shadow-2xl"
                onClick={() => setScanning(false)}
              >
                CLOSE CAMERA
              </Button>
            </div>
          ) : (
            <Card 
              className="border-4 border-blue-600 shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800 cursor-pointer active:scale-95 transition-transform" 
              onClick={() => setScanning(true)}
            >
              <CardContent className="p-10 text-center">
                <div className="mb-4 bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner backdrop-blur-md">
                  📷
                </div>
                <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Tap to Scan</h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Capture Visitor Leads</p>
              </CardContent>
            </Card>
          )}

          {/* LEADS LIST */}
          <div className="pt-4">
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-tighter">Database Records ({leads.length})</h2>
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-300 font-black uppercase text-xs">No leads found in your account</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="shadow-md border-0 bg-white overflow-hidden active:bg-slate-50 transition-colors">
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl grayscale font-bold text-slate-400">
                        {lead.visitors?.full_name?.charAt(0) || "!"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 truncate uppercase leading-tight">
                            {lead.visitors?.full_name || "Unknown Visitor"}
                        </h3>
                        <p className="text-[10px] text-blue-600 font-bold uppercase truncate tracking-tight">
                            {lead.visitors?.company_name || `ID: ${lead.visitor_id.substring(0,8)}...`}
                        </p>
                        {lead.visitors?.mobile && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black">
                                   📞 {lead.visitors.mobile}
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