'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"

export default function ExhibitorPortal() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExhibitorData()
  }, [])

  const fetchExhibitorData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 1. Fetch Exhibitor Profile
    const { data: exhibitorData } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!exhibitorData) {
      router.push('/login')
      return
    }
    setProfile(exhibitorData)

    // 2. Fetch their registered staff
    const { data: staffData } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('company_name', exhibitorData.company_name)
      .eq('is_staff', true)
    
    setStaff(staffData || [])

    // 3. Fetch their Collected Leads
    const { data: leadsData } = await supabase
      .from('leads')
      .select(`
        created_at,
        visitors (
          full_name,
          company_name,
          designation,
          phone,
          city,
          business_type
        )
      `)
      .eq('exhibitor_id', exhibitorData.id)
      .order('created_at', { ascending: false })

    setLeads(leadsData || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // The EXCEL EXPORT Function
  const exportLeadsCSV = () => {
    if (leads.length === 0) return alert("No leads to export yet.")
    
    const headers = ["Scan Date", "Name", "Company", "Designation", "Phone", "City", "Business Type"]
    const rows = leads.map(lead => [
      new Date(lead.created_at).toLocaleDateString(),
      lead.visitors?.full_name || '',
      lead.visitors?.company_name || '',
      lead.visitors?.designation || '',
      lead.visitors?.phone || '',
      lead.visitors?.city || '',
      lead.visitors?.business_type || ''
    ])

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${profile?.company_name}_Leads_GGE2026.csv`
    link.click()
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] animate-pulse">Loading Portal...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-[2rem] p-6 border-b-4 border-[#0b3d41] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none">
              {profile?.company_name}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Welcome, {profile?.full_name} • Exhibitor Portal
            </p>
          </div>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-6 h-10 shadow-md transition-all">
            Secure Logout
          </Button>
        </div>

        {/* TOP ROW: STALL & STAFF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-orange-500 p-4 font-black uppercase tracking-widest text-[10px] text-center">
              Stall Allocation
            </div>
            <div className="p-8 flex-1 flex flex-col items-center justify-center bg-slate-50/50 m-4 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Stall Number</p>
              <h2 className="text-6xl font-black text-[#0b3d41] tracking-tighter">{profile?.stall_number?.[0] || 'TBA'}</h2>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tier</span>
               <span className="bg-[#0b3d41] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{profile?.stall_tier || 'Standard'}</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="bg-[#0b3d41] text-white p-4 font-black uppercase tracking-widest text-[10px] flex justify-between items-center">
              <span>Registered Staff ({staff.length}/{profile?.badge_limit || 2})</span>
            </div>
            <div className="p-0 overflow-auto max-h-[250px] flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-4 font-black text-slate-900 uppercase text-xs">{s.full_name}</td>
                      <td className="p-4 text-[10px] font-bold text-slate-500">{s.phone}</td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                     <tr><td colSpan={2} className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">No staff registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: LEAD RETRIEVAL & EXPORT */}
        <div className="bg-white rounded-[2rem] shadow-lg border-2 border-orange-500 overflow-hidden">
          <div className="bg-orange-500 text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest italic leading-none">Lead Retrieval</h2>
              <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest mt-1">Total Scanned: {leads.length}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Button to open the camera */}
              <Button onClick={() => router.push('/exhibitors/scanner')} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-6 h-12 shadow-xl hover:scale-105 transition-all">
                📷 Scan Visitor Pass
              </Button>
              {/* Button to export to Excel/CSV */}
              <Button onClick={exportLeadsCSV} variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-6 h-12">
                📥 Export CSV
              </Button>
            </div>
          </div>
          
          <div className="p-0 overflow-auto max-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-orange-50 sticky top-0 z-10">
                <tr className="text-[9px] font-black uppercase text-orange-800 tracking-widest">
                  <th className="p-4">Time</th>
                  <th className="p-4">Visitor Name</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-[9px] font-bold text-slate-400">
                      {new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 font-black text-slate-900 uppercase text-xs">{lead.visitors?.full_name}</td>
                    <td className="p-4 text-[10px] font-bold text-slate-600 uppercase">{lead.visitors?.company_name}</td>
                    <td className="p-4 text-[10px] font-bold text-slate-500">{lead.visitors?.phone}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                        {lead.visitors?.business_type || 'Visitor'}
                      </span>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                      No leads scanned yet. Click "Scan Visitor Pass" to capture your first lead!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}