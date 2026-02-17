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
  
  // NOTES STATE
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

  const saveNote = async (leadId: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ notes: noteText })
      .eq('id', leadId)

    if (error) alert("Error saving note")
    else {
      setEditingLead(null)
      fetchLeads(user.id)
    }
  }

  const exportToExcel = () => {
    if (leads.length === 0) return alert("No leads to export!")
    const dataToExport = leads.map(lead => ({
      'Date': new Date(lead.created_at).toLocaleDateString(),
      'Name': lead.visitors?.full_name || 'N/A',
      'Company': lead.visitors?.company_name || 'N/A',
      'Phone': lead.visitors?.phone || 'N/A',
      'Email': lead.visitors?.email || 'N/A',
      'Notes': lead.notes || ''
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")
    XLSX.writeFile(workbook, `Exhibitor_Leads.xlsx`)
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

  if (loading) return <div className="p-8 text-center font-black">Syncing...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 px-1">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{role === 'exhibitor' ? 'Lead Manager' : 'My Pass'}</h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-xs font-bold">EXIT</Button>
      </div>

      {role === 'exhibitor' && (
        <div className="space-y-6">
          {scanning ? (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
               <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                <Scanner onScan={(res) => res?.[0] && handleScan(res[0].rawValue)} constraints={{ facingMode: 'environment' }} />
              </div>
              <Button variant="destructive" className="mt-12 px-12 py-8 text-xl font-black rounded-full" onClick={() => setScanning(false)}>CLOSE</Button>
            </div>
          ) : (
            <Card className="border-4 border-blue-600 shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800" onClick={() => setScanning(true)}>
              <CardContent className="p-10 text-center text-white">
                <div className="mb-4 bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl">📷</div>
                <h2 className="text-2xl font-black uppercase">Tap to Scan</h2>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-sm font-black text-slate-400 uppercase">Connections ({leads.length})</h2>
                <Button size="sm" onClick={exportToExcel} className="bg-green-600 text-[10px] font-black uppercase">📥 Export</Button>
            </div>
            
            <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="shadow-md border-0 bg-white">
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-bold text-white uppercase">{lead.visitors?.full_name?.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 uppercase truncate leading-tight">{lead.visitors?.full_name}</h3>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">{lead.visitors?.company_name}</p>
                        </div>
                      </div>

                      {/* NOTES SECTION */}
                      {editingLead === lead.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea 
                            className="w-full p-3 text-sm border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none"
                            placeholder="Add lead details (e.g., wants 500 bags)"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-blue-600 font-bold" onClick={() => saveNote(lead.id)}>SAVE NOTE</Button>
                            <Button size="sm" variant="ghost" className="font-bold" onClick={() => setEditingLead(null)}>CANCEL</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {lead.notes ? (
                            <div className="bg-blue-50 p-3 rounded-xl mb-2 text-xs font-medium text-blue-800 italic">
                              "{lead.notes}"
                            </div>
                          ) : null}
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-[10px] font-bold h-7 px-3 rounded-lg"
                            onClick={() => {
                              setEditingLead(lead.id);
                              setNoteText(lead.notes || '');
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
          </div>
        </div>
      )}
    </div>
  )
}