'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function VisitorManagementPage() {
  const router = useRouter()
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAdmin()
    fetchVisitors()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // Secure to Super Admin
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const fetchVisitors = async () => {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setVisitors(data || [])
  }

  const deleteVisitor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely remove ${name} from the registry?`)) return
    const { error } = await supabase.from('visitors').delete().eq('id', id)
    if (!error) fetchVisitors()
  }

  // Filter visitors based on search query
  const filteredVisitors = visitors.filter(v => {
    const search = searchQuery.toLowerCase()
    return (
      (v.full_name && v.full_name.toLowerCase().includes(search)) ||
      (v.company_name && v.company_name.toLowerCase().includes(search)) ||
      (v.phone && v.phone.includes(search)) ||
      (v.email && v.email.toLowerCase().includes(search))
    )
  })

  // Simple CSV Export Function
  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Designation', 'Phone', 'Email', 'City', 'Registered On']
    const csvContent = [
      headers.join(','),
      ...filteredVisitors.map(v => 
        `"${v.full_name || ''}","${v.company_name || ''}","${v.designation || ''}","${v.phone || ''}","${v.email || ''}","${v.city || ''}","${new Date(v.created_at).toLocaleDateString()}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `GGE_Visitors_${new Date().toLocaleDateString()}.csv`
    link.click()
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm bg-slate-50 min-h-screen">Verifying Clearance...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER WITH BACK BUTTON */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-[2rem] shadow-sm gap-4 border-b-4 border-blue-500">
          <div>
            <h1 className="text-3xl font-black uppercase text-blue-600 tracking-tighter italic leading-none">Visitor Dept.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Attendee Master Database</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button onClick={exportToCSV} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-md">
               📥 Export CSV
             </Button>
             <Button variant="outline" onClick={() => router.push('/admin')} className="w-full md:w-auto font-bold border-2 text-[10px] uppercase rounded-xl px-6">
               ← Hub
             </Button>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
           <span className="text-xl ml-2 mr-4 opacity-50">🔍</span>
           <Input 
             placeholder="Search by name, company, phone, or email..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="border-0 shadow-none text-sm font-bold bg-transparent focus-visible:ring-0 px-0 h-10 w-full"
           />
           <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase whitespace-nowrap hidden md:block">
              {filteredVisitors.length} Found
           </div>
        </div>

        {/* VISITOR DATA TABLE */}
        <Card className="border-0 shadow-md flex flex-col h-[700px] rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-800 text-white p-6">
             <CardTitle className="text-lg font-black uppercase tracking-tight">Registered Attendees</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-500 font-black uppercase text-[9px] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 px-6">Profile</th>
                  <th className="p-4">Firm / Designation</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 px-6">
                      <p className="font-black text-blue-700 uppercase text-sm">{v.full_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">Joined: {new Date(v.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 uppercase">{v.company_name || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{v.designation || 'Visitor'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-700">{v.phone}</p>
                      <p className="text-[10px] text-slate-500">{v.email || 'No email'}</p>
                    </td>
                    <td className="p-4">
                       <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                         {v.city || 'Unknown'}
                       </span>
                    </td>
                    <td className="p-4 text-right px-6">
                      <Button variant="ghost" size="sm" onClick={() => deleteVisitor(v.id, v.full_name)} className="h-7 text-slate-300 hover:text-red-500 font-black text-[9px] uppercase hover:bg-red-50">
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredVisitors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
                      No visitors found matching your search.
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