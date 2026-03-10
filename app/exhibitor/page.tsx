'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ExhibitorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [staffList, setStaffList] = useState<any[]>([])

  useEffect(() => {
    fetchExhibitorData()
  }, [])

  const fetchExhibitorData = async () => {
    // 1. Get Logged In User
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // 2. Fetch their specific Exhibitor Profile
    const { data: exhibitorData } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('email', user.email)
      .eq('is_staff', false)
      .single()

    if (exhibitorData) {
      setProfile(exhibitorData)
      
      // 3. Fetch their registered staff members (linked by company name)
      const { data: staffData } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('company_name', exhibitorData.company_name)
        .eq('is_staff', true)
        
      if (staffData) setStaffList(staffData)
    }
    
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] animate-pulse">Accessing Secure Portal...</div>

  if (!profile) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="text-4xl">⚠️</div>
      <h1 className="text-xl font-black uppercase text-[#0b3d41]">Profile Not Found</h1>
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Your email is not linked to an active exhibitor stall.</p>
      <Button onClick={handleLogout} variant="outline" className="mt-4 font-black uppercase tracking-widest text-[10px]">Return to Login</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-[#0b3d41] gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none">
              {profile.company_name}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Welcome, {profile.full_name} • Exhibitor Portal
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="font-black border-2 text-[10px] uppercase rounded-xl px-6 h-10 shadow-lg">
            Secure Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* STALL DETAILS CARD */}
          <Card className="md:col-span-1 border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-500">
                Stall Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stall Number</p>
                <p className="text-5xl font-black text-[#0b3d41]">{profile.stall_number || 'TBD'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tier</span>
                  <Badge className={`uppercase text-[9px] font-black tracking-widest px-3 py-1 ${
                    profile.stall_tier === 'Diamond' ? 'bg-purple-600' :
                    profile.stall_tier === 'Platinum' ? 'bg-indigo-600' :
                    profile.stall_tier === 'Gold' ? 'bg-amber-500' : 'bg-[#0b3d41]'
                  }`}>
                    {profile.stall_tier || 'Silver'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${profile.payment_status === 'Fully Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {profile.payment_status || 'Pending'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STAFF MANAGEMENT CARD */}
          <Card className="md:col-span-2 border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-[#0b3d41] text-white p-6 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-black uppercase tracking-widest">
                Registered Staff ({staffList.length})
              </CardTitle>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[9px] rounded-full px-4 h-8 shadow-md">
                + Register Staff
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-auto max-h-[400px]">
              {staffList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <div className="text-4xl">👷</div>
                  <p className="text-[10px] font-black uppercase tracking-widest italic">No staff registered yet.</p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase">Add your team members to generate their entry QR codes.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="p-4 px-6">Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4 text-right px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 px-6 font-bold text-sm text-slate-900 uppercase">{staff.full_name}</td>
                        <td className="p-4 text-xs font-medium text-slate-500">{staff.phone}</td>
                        <td className="p-4 text-right px-6">
                           <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50">Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}