'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner'
import * as XLSX from 'xlsx' // NEW: Import Excel tool

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

  const fetchLeads = async (exhibitorId: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        visitor_id,
        created_at,
        visitors!inner (
          full_name,
          company_name,
          phone,
          email
        )
      `)
      .eq('exhibitor_id', exhibitorId)
      .order('created_at', { ascending: false })

    if (!error) setLeads(data || [])
  }

  // NEW: EXPORT TO EXCEL FUNCTION
  const exportToExcel = () => {
    if (leads.length === 0) return alert("No leads to export!")
    
    // Format the data for Excel
    const dataToExport = leads.map(lead => ({
      'Date Scanned': new Date(lead.created_at).toLocaleDateString(),
      'Visitor Name': lead.visitors?.full_name || 'N/A',
      'Company': lead.visitors?.company_name || 'N/A',
      'Phone': lead.visitors?.phone || 'N/A',
      'Email': lead.visitors?.email || 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned Leads")
    
    // Download the file
    XLSX.writeFile(workbook, `Exhibitor_Leads_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleScan = (text: string | null) => {
    if (text) {
      setScanning(false)
      saveLead(text)
    }
  }

  const saveLead = async (visitorId: string) => {
    const { error } = await supabase
      .from('leads')
      .insert([{ exhibitor_id: user.id, visitor_id: visitorId }])

    if (error) alert("Lead already scanned.")
    else {
      alert("✅ LEAD CAPTURED!")
      fetchLeads(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center text-slate-400 font-black">Syncing...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 px-1">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            {role === 'exhibitor' ? 'Lead Manager' : 'My Pass'}
          </h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-xs font-bold border-2">EXIT</Button>
      </div>

      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {scanning ? (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
               <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                <Scanner 
                    onScan={(result) => { if (result && result.length > 0) handleScan(result[0].rawValue) }}
                    components={{ finder: false }}
                    constraints={{ facingMode: 'environment' }}
                />
              </div>
              <Button variant="destructive" className="mt-12 px-12 py-8 text-xl font-black rounded-full" onClick={() => setScanning(false)}>CLOSE</Button>
            </div>
          ) : (
            <Card className="border-4 border-blue-600 shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800 cursor-pointer" onClick={() => setScanning(true)}>
              <CardContent className="p-10 text-center text-white">
                <div className="mb-4 bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl backdrop-blur-md">📷</div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Tap to Scan</h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Capture Visitor Leads</p>
              </CardContent>
            </Card>
          )}

          {/* LEADS LIST & EXCEL BUTTON */}
          <div className="pt-4">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-tighter">Your Connections ({leads.length})</h2>
                {leads.length > 0 && (
                    <Button 
                        size="sm" 
                        onClick={exportToExcel}
                        className="bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
                    >
                        📥 Export Excel
                    </Button>
                )}
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-300 font-black uppercase text-xs">No leads found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="shadow-md border-0 bg-white overflow-hidden">
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-bold text-white uppercase">
                        {lead.visitors?.full_name?.charAt(0) || "!"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 truncate uppercase leading-tight">{lead.visitors?.full_name}</h3>
                        <p className="text-[10px] text-blue-600 font-bold uppercase truncate">{lead.visitors?.company_name}</p>
                        {lead.visitors?.phone && (
                            <div className="mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black inline-block">
                                📞 {lead.visitors.phone}
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

      {/* VISITOR VIEW - (Remains same as before) */}
      {role === 'visitor' && (
        <div className="grid gap-4">
          <Card className="border-l-8 border-orange-500 shadow-xl overflow-hidden">
            <CardHeader className="bg-orange-50/50 pb-2">
              <CardTitle className="text-orange-900 text-sm font-black uppercase">Your Digital Badge</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Button className="w-full bg-orange-600 font-black hover:bg-orange-700 py-8 text-lg shadow-lg" onClick={() => router.push('/badge')}>OPEN BADGE</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}