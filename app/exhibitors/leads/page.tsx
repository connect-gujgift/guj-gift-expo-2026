'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function LeadsContent() {
  const router = useRouter()
  const [exhibitor, setExhibitor] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    const initUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return router.push('/login')

      const { data: exhibitorData } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!exhibitorData) return router.push('/dashboard')

      setExhibitor(exhibitorData)
      fetchLeads(user.id)
    }
    initUser()
  }, [router])

  const fetchLeads = async (exhibitorId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select(`
          id,
          notes,
          created_at,
          visitors:visitor_id (*)
        `)
        .eq('exhibitor_id', exhibitorId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setLeads(data || [])
    } catch (err: any) {
      setError('FAILED TO LOAD LEADS.')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const visitor = lead.visitors || {}
    const searchStr = searchQuery.toLowerCase()
    return (
      visitor.full_name?.toLowerCase().includes(searchStr) ||
      visitor.company_name?.toLowerCase().includes(searchStr) ||
      visitor.phone?.includes(searchStr)
    )
  })

  const saveNote = async (id: string) => {
    try {
      const { error } = await supabase.from('leads').update({ notes: noteText }).eq('id', id)
      if (error) throw error
      setEditingId(null)
      fetchLeads(exhibitor.id) 
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  const downloadCSV = () => {
    if (leads.length === 0) return
    const headers = ['Date', 'Time', 'Name', 'Company', 'Phone', 'Email', 'Notes']
    const csvRows = leads.map(lead => {
      const dateObj = new Date(lead.created_at)
      const visitor = lead.visitors || {}
      return [
        dateObj.toLocaleDateString(),
        dateObj.toLocaleTimeString(),
        `"${visitor.full_name || ''}"`,
        `"${visitor.company_name || ''}"`,
        `"${visitor.phone || ''}"`,
        `"${visitor.email || ''}"`,
        `"${lead.notes || ''}"`
      ].join(',')
    })
    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${exhibitor?.company_name}_Leads.csv`
    link.click()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50">Syncing Hub...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900 pb-20">
      
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-slate-500 font-black uppercase text-[10px]">← Back</Button>
          <img src="/event-logo.png" alt="GGE 2026" className="h-8 opacity-40 grayscale" />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        <Card className="border-0 shadow-lg overflow-hidden rounded-[1.5rem] bg-white">
          <CardHeader className="bg-[#0b3d41] p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">My Leads</CardTitle>
              <p className="text-[10px] font-bold text-teal-200 uppercase mt-1">Stall {exhibitor?.stall_number} | {leads.length} Scans</p>
            </div>
            <Button onClick={downloadCSV} className="bg-[#ef6c33] hover:bg-black font-black uppercase text-[10px] px-6 py-5 rounded-xl shadow-xl transition-all w-full sm:w-auto">📥 Export Excel</Button>
          </CardHeader>
        </Card>

        {/* SEARCH BAR */}
        <div className="relative">
          <Input 
            placeholder="Search by name, company, or phone..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 rounded-2xl border-0 shadow-sm px-6 font-bold text-sm bg-white"
          />
          <div className="absolute right-5 top-4 opacity-30 text-xl">🔍</div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl">{error}</div>}

        <div className="flex flex-col gap-3">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{searchQuery ? 'No matches found' : 'No leads captured yet'}</p>
            </div>
          ) : (
            filteredLeads.map((lead, index) => {
              const visitor = lead.visitors || {}
              const phone = visitor.phone || ''
              // Clean phone for WhatsApp
              const cleanPhone = phone.replace(/\D/g, '')

              return (
                <Card key={index} className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-[#0b3d41] uppercase italic leading-none">{visitor.full_name}</h3>
                        <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest mt-1">{visitor.company_name}</p>
                      </div>
                      
                      {/* NEW: QUICK CONTACT BUTTONS */}
                      <div className="flex gap-2">
                        <a href={`tel:${phone}`}>
                          <Button size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl h-10 w-10 p-0 shadow-none transition-all">📞</Button>
                        </a>
                        <a href={`https://wa.me/${cleanPhone.length === 10 ? '91'+cleanPhone : cleanPhone}`} target="_blank">
                          <Button size="sm" className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl h-10 w-10 p-0 shadow-none transition-all">💬</Button>
                        </a>
                      </div>
                    </div>

                    <div className="text-[11px] font-bold text-slate-500 mb-4 px-1">
                      <p>Email: {visitor.email || 'N/A'}</p>
                    </div>

                    {lead.notes && !editingId && (
                      <div className="bg-slate-50 p-4 rounded-xl text-[11px] font-medium text-slate-600 italic mt-2 border-l-4 border-teal-400/30">"{lead.notes}"</div>
                    )}

                    {editingId === lead.id ? (
                      <div className="space-y-3 mt-3 pt-3 border-t">
                        <textarea className="w-full p-4 text-xs border-2 rounded-xl outline-none focus:border-teal-500 bg-white" value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="Follow-up notes..." />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNote(lead.id)} className="font-black bg-[#0b3d41] text-[10px] uppercase text-white px-6 rounded-lg">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="font-black text-[10px] uppercase text-slate-400">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-3">
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{new Date(lead.created_at).toLocaleDateString()}</span>
                        <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black text-[#0b3d41] uppercase bg-slate-50 hover:bg-teal-50 px-4 rounded-full" onClick={() => { setEditingId(lead.id); setNoteText(lead.notes || ''); }}>
                          {lead.notes ? 'Edit Note ✏️' : '+ Add Note'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExhibitorLeadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">LOADING...</div>}>
      <LeadsContent />
    </Suspense>
  )
}