'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StallManagementPage() {
  const router = useRouter()
  const [stalls, setStalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stallNumber, setStallNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [badgeLimit, setBadgeLimit] = useState('5')
  const [isPaid, setIsPaid] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAdmin()
    fetchStalls()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const fetchStalls = async () => {
    const { data } = await supabase.from('stalls').select('*').order('stall_number', { ascending: true })
    if (data) setStalls(data)
  }

  const handleAddStall = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('stalls').insert([{ 
      stall_number: stallNumber.toUpperCase(), 
      company_name: companyName, 
      badge_limit: parseInt(badgeLimit), 
      is_paid: isPaid 
    }])
    if (!error) {
      setStallNumber(''); setCompanyName(''); fetchStalls()
    }
    setSaving(false)
  }

  const updateBadgeLimit = async (id: string, current: number, inc: number) => {
    const next = current + inc;
    if (next >= 0) {
      await supabase.from('stalls').update({ badge_limit: next }).eq('id', id)
      fetchStalls()
    }
  }

  if (loading) return <div className="p-10 text-center font-black uppercase text-xs text-slate-400">Verifying Admin...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-teal-600">
          <h1 className="text-2xl font-black uppercase text-teal-700 italic">Stall Registry</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6">
              ← Back to Admin Hub
            </Button>
            <Button variant="destructive" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold text-[10px] uppercase rounded-xl">Logout</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <Card className="md:col-span-4 rounded-[2rem] overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-teal-700 text-white p-6"><CardTitle className="text-lg font-black uppercase">Register Stall</CardTitle></CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddStall} className="space-y-4">
                <Input placeholder="Stall #" value={stallNumber} onChange={(e) => setStallNumber(e.target.value)} required />
                <Input placeholder="Firm Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                <Input type="number" value={badgeLimit} onChange={(e) => setBadgeLimit(e.target.value)} required />
                <Button type="submit" disabled={saving} className="w-full bg-teal-600 font-black uppercase tracking-widest text-white h-14 rounded-2xl">Add Stall</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-8 rounded-[2rem] overflow-hidden border-0 shadow-md bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                <tr><th className="p-4">Stall</th><th className="p-4">Firm</th><th className="p-4 text-center">Badges</th><th className="p-4 text-right">Action</th></tr>
              </thead>
              <tbody className="text-xs divide-y">
                {stalls.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-black text-teal-700">{s.stall_number}</td>
                    <td className="p-4 font-bold">{s.company_name}</td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => updateBadgeLimit(s.id, s.badge_limit, -1)} className="w-6 h-6 bg-slate-200 rounded-full">-</button>
                        <span className="font-black w-6 text-center">{s.badge_limit}</span>
                        <button onClick={() => updateBadgeLimit(s.id, s.badge_limit, 1)} className="w-6 h-6 bg-slate-200 rounded-full">+</button>
                      </div>
                    </td>
                    <td className="p-4 text-right"><Button variant="ghost" className="text-red-500 text-[10px] font-black" onClick={() => supabase.from('stalls').delete().eq('id', s.id).then(fetchStalls)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  )
}