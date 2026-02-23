'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ExhibitorLeadsPage() {
  const router = useRouter()
  const [exhibitor, setExhibitor] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Note editing states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  // 1. Authenticate & Fetch Leads via Supabase Auth
  useEffect(() => {
    const initUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      const { data: exhibitorData } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!exhibitorData) {
         router.push('/dashboard')
         return
      }

      setExhibitor(exhibitorData)
      fetchLeads(user.id)
    }

    initUser()
  }, [router])

  const fetchLeads = async (exhibitorId: string) => {
    try {
      // Added 'id' and 'notes' to the query!
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select(`
          id,
          notes,
          created_at,
          visitors (*)
        `)
        .eq('exhibitor_id', exhibitorId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error("Supabase Error Details:", fetchError)
        throw fetchError
      }

      setLeads(data || [])
    } catch (err: any) {
      console.error('Error fetching leads:', err)
      setError('FAILED TO LOAD LEADS. PLEASE TRY AGAIN.')
    } finally {
      setLoading(false)
    }
  }

  // Save Note Function
  const saveNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: noteText })
        .eq('id', id)

      if (error) throw error
      
      setEditingId(null)
      fetchLeads(exhibitor.id) // Refresh data to show new note
    } catch (err: any) {
      alert("Error saving note: " + err.message)
    }
  }

  // 2. Export to CSV (Excel) Function
  const downloadCSV = () => {
    if (leads.length === 0) return

    // Added 'Notes' to the headers
    const headers = ['Scan Date', 'Time', 'Visitor Name', 'Company', 'Phone Number', 'Email', 'City', 'Notes']
    
    const csvRows = leads.map(lead => {
      const dateObj = new Date(lead.created_at)
      const date = dateObj.toLocaleDateString()
      const time = dateObj.toLocaleTimeString()
      const visitor = lead.visitors || {}

      return [
        date,
        time,
        `"${visitor.full_name || 'N/A'}"`,
        `"${visitor.company_name || 'N/A'}"`,
        `"${visitor.phone || 'N/A'}"`,
        `"${visitor.email || 'N/A'}"`,
        `"${visitor.city || 'N/A'}"`,
        `"${lead.notes || ''}"` // Added notes to the export row
      ].join(',')
    })

    const csvContent = [headers.join(','), ...csvRows].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${exhibitor?.company_name?.replace(/\s+/g, '_') || 'Exhibitor'}_Leads.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest bg-slate-50">Loading Leads...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900 pb-20">
      
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-slate-500 hover:text-[#0b3d41] hover:bg-slate-200 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full transition-all">
             ← Back to Dashboard
          </Button>
          <img src="/event-logo.png" alt="GGE 2026" className="h-8 object-contain grayscale opacity-50" />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Header Card */}
        <Card className="border-0 shadow-lg overflow-hidden rounded-[1.5rem] bg-white">
          <CardHeader className="bg-[#0b3d41] p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">My Leads</CardTitle>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1 opacity-80">
                Stall {exhibitor?.stall_number} | {leads.length} Total Scans
              </p>
            </div>
            <Button 
              onClick={downloadCSV}
              disabled={leads.length === 0}
              className="bg-[#ef6c33] hover:bg-[#d45a27] font-black uppercase tracking-widest text-[10px] px-6 py-5 rounded-xl shadow-lg shadow-orange-900/20 transition-all w-full sm:w-auto"
            >
              📥 Export to Excel
            </Button>
          </CardHeader>
        </Card>

        {/* Error Message */}
        {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight rounded-r-xl">
              {error}
            </div>
        )}

        {/* Leads List */}
        <div className="flex flex-col gap-3">
          {leads.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-[1.5rem] border border-dashed border-slate-300">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No leads captured yet.</p>
              <p className="text-slate-400 text-[10px] mt-2">Use the scanner to add visitors.</p>
            </div>
          ) : (
            leads.map((lead, index) => {
              const visitor = lead.visitors || {}
              return (
                <Card key={index} className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-black text-[#0b3d41] uppercase leading-tight">
                          {visitor.full_name || 'Unknown Visitor'}
                        </h3>
                        <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest mt-1">
                          {visitor.company_name || 'Individual'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1 sm:text-right text-[11px] font-bold text-slate-600">
                        <p>📞 {visitor.phone || 'N/A'}</p>
                        {visitor.email && <p>✉️ {visitor.email}</p>}
                      </div>
                    </div>

                    {/* Notes Display */}
                    {lead.notes && !editingId && (
                      <div className="bg-slate-50 p-3 rounded-xl text-[11px] font-medium text-slate-600 italic mt-3 border-l-4 border-teal-200">
                        "{lead.notes}"
                      </div>
                    )}

                    {/* Note Editor */}
                    {editingId === lead.id ? (
                      <div className="space-y-3 mt-3 pt-3 border-t border-slate-100">
                        <textarea 
                          className="w-full p-3 text-xs border-2 rounded-xl outline-none focus:border-teal-400 transition-colors bg-white" 
                          placeholder="Add details about what you discussed..." 
                          value={noteText} 
                          onChange={(e) => setNoteText(e.target.value)} 
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNote(lead.id)} className="font-bold bg-[#0b3d41] hover:bg-slate-800 text-[10px] uppercase text-white px-4 rounded-lg">Save Note</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="font-bold text-[10px] uppercase text-slate-400 hover:bg-slate-100 px-4 rounded-lg">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Scanned: {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-black text-[#0b3d41] uppercase bg-teal-50 hover:bg-teal-100 px-4 rounded-full transition-colors" 
                          onClick={() => { setEditingId(lead.id); setNoteText(lead.notes || ''); }}
                        >
                          {lead.notes ? 'Edit Note ✏️' : '+ Add Private Note'}
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