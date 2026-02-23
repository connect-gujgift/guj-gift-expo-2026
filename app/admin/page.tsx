'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExhibitorAction } from './actions'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

const initialState = { success: false, message: '' }

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [stalls, setStalls] = useState<any[]>([]) // Fetching all stalls for quota check
  const [paidStalls, setPaidStalls] = useState<any[]>([])
  const [visitorCount, setVisitorCount] = useState(0)
  
  const [activeTab, setActiveTab] = useState<'exhibitors' | 'staff'>('exhibitors')
  const [formType, setFormType] = useState<'exhibitor' | 'staff'>('exhibitor')

  const [state, formAction] = useFormState(createExhibitorAction, initialState)

  useEffect(() => { checkAdmin() }, [])

  useEffect(() => {
    if (state.message) {
      alert(state.message)
      if (state.success) fetchDashboardData()
    }
  }, [state])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      fetchDashboardData()
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    // 1. Fetch Stalls for Quota logic
    const { data: stallData } = await supabase.from('stalls').select('*')
    setStalls(stallData || [])
    setPaidStalls(stallData?.filter(s => s.is_paid) || [])

    // 2. Fetch Users
    const { data: userData } = await supabase
        .from('exhibitors')
        .select('*')
        .order('created_at', { ascending: false })
    setUsers(userData || [])

    // 3. Fetch Visitors
    const { count: visCount } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
    setVisitorCount(visCount || 0)
  }

  // Helper: Count badges used per stall
  const getBadgeUsage = (stallNo: string) => {
    const used = users.filter(u => u.stall_number === stallNo).length
    const allotted = stalls.find(s => s.stall_number === stallNo)?.badge_limit || 0
    return { used, allotted }
  }

  const deleteUser = async (id: string) => {
    if(!confirm("Delete this profile permanently?")) return;
    await supabase.from('exhibitors').delete().eq('id', id)
    fetchDashboardData()
  }

  const exportList = () => {
    const filtered = users.filter(u => activeTab === 'staff' ? u.is_staff : !u.is_staff)
    if (filtered.length === 0) return alert("No data to export.")
    
    const dataToExport = filtered.map(u => ({
      'Name': u.full_name || 'N/A',
      'Phone': u.phone || 'N/A',
      'Email': u.email || 'N/A',
      'Company/Role': u.company_name || (u.is_staff ? 'Registration Staff' : 'N/A'),
      'Stall': u.stall_number || 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab.toUpperCase())
    XLSX.writeFile(workbook, `GGE_2026_${activeTab}_List.xlsx`)
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm">Verifying Admin...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm gap-4 border-b-4 border-[#0b3d41]">
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none">Command Center</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Super Admin Access</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push('/admin/stalls')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase px-4 rounded-xl shadow-md border-2 border-teal-500">Manage Stalls 🎪</Button>
            <Button onClick={() => router.push('/admin/registration-desk')} className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px] uppercase px-4 rounded-xl shadow-md">Desk 🖨️</Button>
            <Button onClick={() => router.push('/admin/analytics')} className="bg-[#ef6c33] hover:bg-[#d45a27] font-bold text-[10px] uppercase px-4 rounded-xl shadow-md">Analytics 📈</Button>
            <Button variant="outline" className="font-bold border-2 text-[10px] uppercase rounded-xl" onClick={() => router.push('/dashboard')}>Exit</Button>
          </div>
        </div>

        {/* STATS WITH BADGE TRACKER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#0b3d41] text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-blue-200">Exhibitor Badges</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{users.filter(u => !u.is_staff).length}</p>
                    <p className="text-[8px] font-bold uppercase mt-2 text-teal-300">Total Issued Personnel</p>
                </CardContent>
            </Card>
            <Card className="bg-blue-500 text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Staff</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{users.filter(u => u.is_staff).length}</p>
                    <p className="text-[8px] font-bold uppercase mt-2">Active Admin Team</p>
                </CardContent>
            </Card>
            <Card className="bg-[#ef6c33] text-white border-0 shadow-md col-span-2">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-orange-100">Visitor Count</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{visitorCount}</p>
                    <p className="text-[8px] font-bold uppercase mt-2">Registered Footfall</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* FORM */}
          <Card className="md:col-span-4 border-0 shadow-md h-fit overflow-hidden rounded-[2rem]">
            <div className="flex bg-slate-900 text-white">
              <button onClick={() => setFormType('exhibitor')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${formType === 'exhibitor' ? 'bg-[#ef6c33]' : 'hover:bg-slate-800'}`}>+ Exhibitor</button>
              <button onClick={() => setFormType('staff')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${formType === 'staff' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>+ Staff</button>
            </div>
            <CardContent className="p-6">
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="is_staff" value={formType === 'staff' ? 'true' : 'false'} />
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Full Name</Label>
                  <Input name="full_name" placeholder="Person's Name" className="font-medium bg-slate-50 border-0" required />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Phone</Label>
                  <Input name="phone" placeholder="10-digit Mobile" className="font-medium bg-slate-50 border-0" required />
                </div>

                {formType === 'exhibitor' ? (
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Link to Paid Stall</Label>
                    <select name="stall_selection" required className="w-full h-12 bg-slate-50 border-0 rounded-md px-3 font-medium text-sm outline-none">
                      <option value="">-- Choose Firm --</option>
                      {paidStalls.map(s => {
                        const usage = getBadgeUsage(s.stall_number);
                        const isFull = usage.used >= usage.allotted;
                        return (
                          <option key={s.stall_number} value={`${s.stall_number}|${s.company_name}`} disabled={isFull}>
                            [{s.stall_number}] {s.company_name} ({usage.used}/{usage.allotted} Badges)
                          </option>
                        )
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Role</Label>
                    <Input name="company_name" placeholder="Registration Desk" className="font-medium bg-slate-50 border-0" required />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Email & Password</Label>
                  <Input name="email" type="email" placeholder="user@email.com" className="bg-slate-50 border-0 mb-2" required />
                  <Input name="password" type="text" defaultValue="Expo@2026" className="bg-slate-50 border-0" required />
                </div>

                <Button type="submit" className={`w-full font-black uppercase tracking-widest mt-4 py-6 rounded-2xl shadow-lg ${formType === 'staff' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-[#ef6c33] hover:bg-[#d45a27] shadow-orange-100'}`}>Create Account</Button>
              </form>
            </CardContent>
          </Card>

          {/* DIRECTORY TABLE */}
          <Card className="md:col-span-8 border-0 shadow-md flex flex-col h-[700px] rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b py-2 px-6">
              <div className="flex justify-between items-center">
                <div className="flex border-b">
                   <button onClick={() => setActiveTab('exhibitors')} className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'exhibitors' ? 'border-[#ef6c33] text-[#ef6c33]' : 'border-transparent text-slate-400'}`}>Exhibitors</button>
                   <button onClick={() => setActiveTab('staff')} className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'staff' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}>Staff</button>
                </div>
                <Button size="sm" variant="ghost" className="font-bold text-[10px] uppercase text-slate-400" onClick={exportList}>Export Excel</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 px-6">Name & Mobile</th>
                    <th className="p-4">Stall / Badges</th> {/* NEW BADGE INFO */}
                    <th className="p-4 text-right px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.filter(u => activeTab === 'staff' ? u.is_staff : !u.is_staff).map((u) => {
                    const usage = getBadgeUsage(u.stall_number);
                    return (
                      <tr key={u.id} className="hover:bg-white transition-colors bg-white/50">
                        <td className="p-4 px-6">
                          <p className="font-black text-slate-900 uppercase leading-none">{u.full_name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{u.phone} • {u.email}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                             <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase ${activeTab === 'staff' ? 'bg-blue-100 text-blue-600' : 'bg-[#0b3d41] text-white'}`}>
                               {activeTab === 'staff' ? u.company_name : u.stall_number}
                             </span>
                             {!u.is_staff && (
                               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                 Stall Quota: {usage.used}/{usage.allotted} Badges
                               </p>
                             )}
                          </div>
                        </td>
                        <td className="p-4 text-right px-6">
                          <Button variant="destructive" size="sm" onClick={() => deleteUser(u.id)} className="h-7 text-[9px] font-black px-3 rounded-lg">REMOVE</Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}