'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  
  // SCANNER & DATA STATES
  const [scanning, setScanning] = useState(false)
  const [leads, setLeads] = useState<any[]>([])

  // NOTES STATES
  const [editingLead, setEditingLead] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

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
        notes,
        visitors!inner (
          full_name,
          company_name,
          phone,
          email
        )
      `)
      .eq('exhibitor_id', exhibitorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Fetch Error:", error.message)
    } else {
      setLeads(data || [])
    }
  }

  // --- SAVE NOTE LOGIC ---
  const saveNote = async (leadId: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ notes: noteText })
      .eq('id', leadId)

    if (error) {
      alert("Error saving note: " + error.message)
    } else {
      alert("✅ NOTE SAVED")
      setEditingLead(null)
      fetchLeads(user.id)
    }
  }

  // --- EXPORT LOGIC ---
  const exportToExcel = () => {
    if (leads.length === 0) return alert("No leads to export!")
    
    const dataToExport = leads.map(lead => ({
      'Date Scanned': new Date(lead.created_at).toLocaleDateString(),
      'Visitor Name': lead.visitors?.full_name || 'N/A',
      'Company': lead.visitors?.company_name || 'N/A',
      'Phone': lead.visitors?.phone || 'N/A',
      'Email': lead.visitors?.email || 'N/A',
      'Notes': lead.notes || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Leads")
    XLSX.writeFile(workbook, `GiftExpo_Leads_${new Date().toISOString().split('T')[0]}.xlsx`)
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

    if (error) {
      alert("Lead already captured.")
    } else {
      alert("✅ LEAD CAPTURED")
      fetchLeads(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center text-slate-400 font-black uppercase">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            {role === 'exhibitor' ? 'Lead Manager' : 'My Pass'}
          </h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
            Guj Gift Expo 2026
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-xs font-bold border-2">EXIT</Button>
      </div>

      {/* EXHIBITOR SECTION */}
      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {/* CAMERA UI */}
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
              </div>
              <Button 
                variant="destructive" 
                className="mt-12 px-12 py-8 text-xl font-black rounded-full"
                onClick={() => setScanning(false)}
              >
                CLOSE CAMERA
              </Button>
            </div>
          ) : (
            <Card 
              className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800 cursor-pointer active:scale-95 transition-transform" 
              onClick={() => setScanning(true)}
            >
              <CardContent className="p-10 text-center">
                <div className="mb-4 bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner backdrop-blur-md text-white">
                  📷
                </div>
                <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight text-shadow">Tap to Scan</h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Capture Visitor Leads</p>
              </CardContent>
            </Card>
          )}

          {/* LEADS LIST */}
          <div className="pt-4">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-sm font-black text-slate-400 uppercase">Connections ({leads.length})</h2>
                {leads.length > 0 && (
                  <Button onClick={exportToExcel} size="sm" className="bg-green-600 text-[10px] font-black uppercase">📥 Export Excel</Button>
                )}
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No leads yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="shadow-md border-0 bg-white overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-bold text-white uppercase">
                            {lead.visitors?.full_name?.charAt(0) || "!"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-900 truncate uppercase leading-tight">{lead.visitors?.full_name}</h3>
                            <p className="text-[10px] text-blue-600 font-bold uppercase truncate">{lead.visitors?.company_name}</p>
                            {lead.visitors?.phone && (
                                <p className="text-[10px] text-green-600 font-bold mt-1 uppercase">📞 {lead.visitors.phone}</p>
                            )}
                        </div>
                      </div>

                      {/* NOTES DISPLAY & EDITOR */}
                      {editingLead === lead.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea 
                            className="w-full p-3 text-sm border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]"
                            placeholder="Add lead details (e.g. wants 500 bags)"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-blue-600 font-bold text-xs" onClick={() => saveNote(lead.id)}>SAVE NOTE</Button>
                            <Button size="sm" variant="ghost" className="font-bold text-xs" onClick={() => setEditingLead(null)}>CANCEL</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-slate-50">
                          {lead.notes ? (
                            <div className="bg-blue-50/50 p-3 rounded-xl mb-3 text-xs font-medium text-blue-900 italic border border-blue-100">
                              "{lead.notes}"
                            </div>
                          ) : null}
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-[10px] font-black h-8 px-4 rounded-full bg-slate-100 hover:bg-slate-200"
                            onClick={() => {
                              setEditingLead(lead.id)
                              setNoteText(lead.notes || '')
                            }}
                          >
                            {lead.notes ? 'EDIT NOTE' : '+ ADD NOTE'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  )
}