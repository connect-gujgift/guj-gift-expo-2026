'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function DeskContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({ visitors: [], exhibitors: [], staff: [] })

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'maulikshah.13@gmail.com') router.push('/login')
    }
    check()
  }, [router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const [visRes, exhRes] = await Promise.all([
      supabase.from('visitors').select('*').or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`),
      supabase.from('exhibitors').select('*').or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    ])
    setResults({
      visitors: visRes.data || [],
      exhibitors: (exhRes.data || []).filter(e => !e.is_staff),
      staff: (exhRes.data || []).filter(e => e.is_staff)
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600">
                <h1 className="text-2xl font-black uppercase text-blue-900 italic">Registration Desk</h1>
                <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold text-[10px] uppercase">← Back</Button>
            </div>
            <Card className="border-0 shadow-lg rounded-[1.5rem] overflow-hidden">
                <CardContent className="p-6 bg-[#0b3d41]">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <Input placeholder="Search Name, Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/10 text-white" />
                        <Button type="submit" disabled={loading} className="bg-blue-500 font-black uppercase text-[10px] text-white px-8">Search</Button>
                    </form>
                </CardContent>
            </Card>
            {/* ... rest of the results display logic from previous code ... */}
        </div>
    </div>
  )
}

export default function RegistrationDeskPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black uppercase text-xs">Loading Search...</div>}>
      <DeskContent />
    </Suspense>
  )
}