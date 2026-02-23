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

  // 1. Authenticate & Fetch Leads
  useEffect(() => {
    const sessionData = localStorage.getItem('activeExhibitor')
    if (!sessionData) {
      router.push('/dashboard')
      return
    }

    const currentExhibitor = JSON.parse(sessionData)
    setExhibitor(currentExhibitor)
    fetchLeads(currentExhibitor.id)
  }, [router])

  const fetchLeads = async (exhibitorId: string) => {
    try {
      // Fetch leads and join with the visitors table to get their details
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select(`
          created_at,
          visitors (
            full_name,
            company_name,
            phone,
            email,
            city
          )
        `)
        .eq('exhibitor_id', exhibitorId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setLeads(data || [])
    } catch (err: any) {
      console.error('Error fetching leads:', err)
      setError('Failed to load leads. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Export to CSV (Excel) Function
  const downloadCSV = () => {
    if (leads.length === 0) return

    // Define the CSV headers
    const headers = ['Scan Date', 'Time', 'Visitor Name', 'Company', 'Phone Number', 'Email', 'City']
    
    // Map the lead data into rows
    const csvRows = leads.map(lead => {
      const dateObj = new Date(lead.created_at)
      const date = dateObj.toLocaleDateString()
      const time = dateObj.toLocaleTimeString()
      const visitor = lead.visitors || {}

      return [
        date,
        time,
        `"${visitor.full_name || 'N/A'}"`, // Quotes prevent issues if names have commas
        `"${visitor.company_name || 'N/A'}"`,
        `"${visitor.phone || 'N/A'}"`,
        `"${visitor.email || 'N/A'}"`,
        `"${visitor.city || 'N/A'}"`
      ].join(',')
    })

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n')
    
    // Create a downloadable file link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${exhibitor.company_name.replace(/\s+/g, '_')}_Leads.csv`)
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
                  <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-[#0b3d41] uppercase leading-tight">
                        {visitor.full_name || 'Unknown Visitor'}
                      </h3>
                      <p className="text-[10px] font-bold text-[#ef6c33] uppercase tracking-widest mt-1">
                        {visitor.company_name || 'Individual'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1 sm:text-right border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <p className="text-[11px] font-bold text-slate-600">
                        📞 {visitor.phone || 'N/A'}
                      </p>
                      {visitor.email && (
                        <p className="text-[11px] font-bold text-slate-600">
                          ✉️ {visitor.email}
                        </p>
                      )}
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Scanned: {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
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