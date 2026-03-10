'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StaffDeptPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
    fetchStaff()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    // Fetch only people where is_staff is true
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('is_staff', true)
      .order('full_name', { ascending: true })
    
    if (!error) setStaff(data || [])
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-amber-500 uppercase tracking-widest text-[10px] animate-pulse">Accessing Staff Database...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-amber-500 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-amber-600 tracking-tighter italic leading-none">Staff Dept.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
              Manage internal event personnel
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6 h-10">
            ← Hub
          </Button>
        </div>

        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span>👷</span> Registered Personnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 sticky top-0">
                <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="p-4 px-8">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role/Company</th>
                  <th className="p-4 text-right px-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 px-8 font-black text-slate-900 uppercase text-sm">{s.full_name}</td>
                    <td className="p-4 text-[10px] font-bold text-slate-500 tracking-widest">{s.phone}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="uppercase text-[8px] font-black tracking-widest bg-amber-50 border-amber-200 text-amber-700">
                        {s.company_name || 'Event Staff'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right px-8">
                      <span className="text-[9px] font-black uppercase text-emerald-500">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staff.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] italic">
                No staff members registered yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}