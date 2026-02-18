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
  
  const [scanning, setScanning] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  
  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('')

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

    if (!error) setLeads(data || [])
  }

  // --- SEARCH FILTER LOGIC ---
  const filteredLeads = leads.filter((lead) => {
    const name = lead.visitors?.full_name?.toLowerCase() || ''
    const firm = lead.visitors?.company_name?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || firm.includes(query)
  })

  const saveNote = async (leadId: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ notes: noteText })
      .eq('id', leadId)

    if (error) alert("Error saving note")
    else {
      alert("✅ NOTE SAVED")
      setEditingLead(null)
      fetchLeads(user.id)
    }
  }

  const exportToExcel = () => {
    if (filteredLeads.length === 0) return alert("No leads to export!")
    const dataToExport = filteredLeads.map(lead => ({
      'Date': new Date(lead.created_at).toLocaleDateString(),
      'Name': lead.visitors?.full_name || 'N/A',
      'Firm': lead.visitors?.company_name || 'N/A',
      'Phone': lead.visitors?.phone || 'N/A',
      'Notes': lead.notes || ''
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")
    XLSX.writeFile(workbook, `Filtered_Leads.xlsx`)
  }

  const handleScan = (text: string | null) => {
    if (text) {
      setScanning(false)
      saveLead(text)
    }
  }

  const saveLead = async (visitorId: string) => {
    const { error } = await supabase.from('leads').insert([{ exhibitor_id: user.id, visitor_id: visitorId }])
    if (error) alert("Lead already captured.")
    else {
      alert("✅ LEAD CAPTURED")
      fetchLeads(user.id)
    }
  }

  if (loading) return <div className="p-8 text-center font-black">Syncing...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{role === 'exhibitor' ? 'Lead Hub' : 'My Pass'}</h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-xs font-bold">LOGOUT</Button>
      </div>

      {role === 'exhibitor' && (
        <div className="space-y-4">
          
          {/* SCANNER TRIGGER */}
          {!scanning && (
            <Card className="border-0 shadow-xl bg-blue-600 text-white overflow-hidden active:scale-95 transition-transform" onClick={() => setScanning(true)}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black uppercase italic">Scan Visitor</h2>
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Instant Capture</p>
                </div>
                <div className="text-3xl">📷</div>
              </CardContent>
            </Card>
          )}

          {/* SEARCH BAR */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search by Name or Firm Name..."
              className="w-full p-4 pl-12 bg-white border-0 shadow-sm rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</div>
          </div>

          {scanning && (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
               <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-blue-500">
                <Scanner onScan={(res) => res?.[0] && handleScan(res[0].rawValue)} constraints={{ facingMode: 'environment' }} />
              </div>
              <Button variant="destructive" className="mt-8 px-12 py-6 text-lg font-black rounded-full" onClick={() => setScanning(false)}>CLOSE</Button>
            </div>
          )}

          {/* LEADS LIST */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connections ({filteredLeads.length})</h2>
                {filteredLeads.length > 0 && (
                  <Button onClick={exportToExcel} size="sm" className="bg-green-600 h-7 text-[9px] font-black uppercase px-3">Export</Button>
                )}
            </div>
            
            <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <Card key={lead.id} className="border-0 shadow-sm bg-white rounded-2xl">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-sm font-black text-white">{lead.visitors?.full_name?.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-900 uppercase text-sm leading-tight">{lead.visitors?.full_name}</h3>
                            <p className="text-[10px] text-blue-600 font-bold uppercase truncate">{lead.visitors?.company_name}</p>
                        </div>
                      </div>

                      {lead.notes && !editingLead && (
                        <p className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-600 italic border-l-2 border-blue-400 mb-2">"{lead.notes}"</p>
                      )}

                      {editingLead === lead.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea className="w-full p-3 text-xs border-2 border-slate-100 rounded-xl" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                          <div className="flex gap-2"><Button size="sm" className="h-7 text-[10px] font-bold" onClick={() => saveNote(lead.id)}>SAVE</Button><Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold" onClick={() => setEditingLead(null)}>CANCEL</Button></div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">📞 {lead.visitors?.phone || 'No Phone'}</span>
                          <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-blue-600 uppercase" onClick={() => { setEditingLead(lead.id); setNoteText(lead.notes || ''); }}>{lead.notes ? 'Edit Note' : '+ Note'}</Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}