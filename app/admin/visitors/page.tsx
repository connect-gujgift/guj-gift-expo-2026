'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function VisitorManagementPage() {
  const router = useRouter()
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAdmin()
    fetchVisitors()
  }, [])

  // Security Check: Dual-Admin Access
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const allowedEmails = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']
    
    if (!user || !allowedEmails.includes(user.email || '')) {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  // Fetch all registered visitors
  const fetchVisitors = async () => {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setVisitors(data || [])
  }

  // Delete a visitor
  const deleteVisitor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove ${name} from the registry?`)) return
    const { error } = await supabase.from('visitors').delete().eq('id', id)
    if (!error) fetchVisitors()
  }

  // Upgraded Live Search Filter
  const filteredVisitors = visitors.filter(v => {
    const search = searchQuery.toLowerCase()
    return (
      (v.full_name && v.full_name.toLowerCase().includes(search)) ||
      (v.company_name && v.company_name.toLowerCase().includes(search)) ||
      (v.phone && v.phone.includes(search)) ||
      (v.email && v.email.toLowerCase().includes(search)) ||
      (v.city && v.city.toLowerCase().includes(search)) ||
      (v.business_type && v.business_type.toLowerCase().includes(search))
    )
  })

  // Professional CSV Export for Excel (Now includes Business Type)
  const exportToCSV = () => {
    const headers = ['Full Name', 'Company Name', 'Designation', 'Business Type', 'Phone Number', 'Email Address', 'City', 'Registration Date']
    const csvContent = [
      headers.join(','),
      ...filteredVisitors.map(v => 
        `"${v.full_name || ''}","${v.company_name || ''}","${v.designation || ''}","${v.business_type || ''}","${v.phone || ''}","${v.email || ''}","${v.city || ''}","${new Date(v.created_at).toLocaleDateString()}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `GGE_Visitors_Export_${new Date().toLocaleDateString()}.csv`
    link.click()
  }

  if (loading) return <div className="p-10 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] bg-slate-50 min-h-screen animate-pulse">Authorizing Access...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm gap-4 border-b-4 border-orange-500">
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none">Visitor Dept.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Master Attendee Database • {visitors.length} Registrations</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button onClick={exportToCSV} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-md transition-all">
               📥 Export CSV
             </Button>
             <Button variant="outline" onClick={() => router.push('/admin')} className="w-full md:w-auto font-bold border-2 border-slate-200 text-[#0b3d41] text-[10px] uppercase rounded-xl px-6">
               ← Back to Hub
             </Button>
          </div>
        </div>

        {/* LIVE SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
           <span className="text-xl ml-2 mr-4 opacity-40">🔍</span>
           <Input 
             placeholder="Search attendees by name, company, phone, email, city, or type..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="border-0 shadow-none text-sm font-bold bg-transparent focus-visible:ring-0 px-0 h-10 w-full"
           />
           <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase whitespace-nowrap hidden md:block">
              {filteredVisitors.length} Found
           </div>
        </div>

        {/* MASTER DATA TABLE */}
        <Card className="border-0 shadow-lg flex flex-col h-[700px] rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-6">
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <span>👥</span> Registered Attendees
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10 shadow-sm tracking-widest">
                <tr>
                  <th className="p-4 px-6">Profile</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Business Type</th>
                  <th className="p-4 text-right px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 px-6">
                      <p className="font-black text-[#0b3d41] uppercase text-sm group-hover:text-orange-600 transition-colors">{v.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">
                        {v.designation ? `${v.designation} at ` : ''}<span className="text-slate-900">{v.company_name}</span>
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Joined: {new Date(v.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{v.phone}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{v.email || 'No email provided'}</p>
                    </td>
                    <td className="p-4">
                       <span className="text-xs font-bold text-slate-600 uppercase">
                         {v.city || '-'}
                       </span>
                    </td>
                    <td className="p-4">
                      <Badge className={`uppercase text-[8px] font-black tracking-widest px-3 py-1 rounded-full border-0 ${
                        v.business_type === 'Corporate Buyer' ? 'bg-indigo-100 text-indigo-700' :
                        v.business_type === 'Distributor' ? 'bg-emerald-100 text-emerald-700' :
                        v.business_type === 'Retailer / Wholesaler' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {v.business_type || 'General'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right px-6">
                      <Button variant="ghost" size="sm" onClick={() => deleteVisitor(v.id, v.full_name)} className="h-8 text-slate-400 hover:text-red-600 font-black text-[9px] uppercase hover:bg-red-50 transition-all rounded-lg">
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredVisitors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center flex flex-col items-center justify-center space-y-3 text-slate-300 bg-slate-50">
                      <div className="text-5xl">📭</div>
                      <p className="font-black uppercase tracking-widest text-[10px] italic">No visitor records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}