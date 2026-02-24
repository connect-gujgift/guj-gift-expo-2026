'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function VisitorHubContent() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState('')
  const [visitorPass, setVisitorPass] = useState<any>(null)

  useEffect(() => {
    const activeVisitor = localStorage.getItem('activeVisitor')
    const loginTimestamp = localStorage.getItem('visitorLoginTime')

    if (activeVisitor && loginTimestamp) {
      const now = new Date().getTime()
      const oneDay = 24 * 60 * 60 * 1000 

      if (now - parseInt(loginTimestamp) > oneDay) {
        handleLogout()
      } else {
        try {
          setVisitorPass(JSON.parse(activeVisitor))
        } catch (e) {
          handleLogout()
        }
      }
    }
    setIsInitializing(false)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '')
    const { data, error } = await supabase.from('visitors').select('*').eq('phone', cleanPhone).single()
    
    if (error || !data) {
      setError('No pass found for this number. Please register at the desk.')
    } else {
      setVisitorPass(data)
      localStorage.setItem('activeVisitor', JSON.stringify(data))
      localStorage.setItem('visitorLoginTime', new Date().getTime().toString())
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('activeVisitor')
    localStorage.removeItem('visitorLoginTime')
    setVisitorPass(null)
    setPhone('')
  }

  if (isInitializing) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Verifying Access...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20">
      {!visitorPass ? (
        <div className="w-full max-w-[400px]">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]">← Back to Hub</Button>
          </div>
          <Card className="border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
              <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
              <CardTitle className="text-xl font-black uppercase tracking-tight italic">Visitor Portal</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSearch} className="space-y-6">
                {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl">{error}</div>}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Registered Phone Number</Label>
                  <Input type="text" placeholder="Enter 10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-slate-50 border-0 h-12 text-center font-bold text-lg" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl text-white">
                  {loading ? 'Searching...' : 'Access My Hub'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="text-center mb-4"><h1 className="text-3xl font-black uppercase italic text-[#0b3d41]">Visitor Hub</h1></div>
          
          {/* UPDATED: Now routes to the dedicated perfect badge page */}
          <Card 
            className="border-0 shadow-xl bg-[#0b3d41] hover:bg-black transition-colors text-white rounded-[2rem] p-6 cursor-pointer" 
            onClick={() => router.push(`/visitor/badge?id=${visitorPass.id}`)}
          >
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-black uppercase italic">My Entry Pass</h2><p className="text-[10px] font-bold text-teal-300 uppercase mt-2">View Official Badge</p></div>
              <div className="text-4xl opacity-80">🎫</div>
            </div>
          </Card>
          
          <div className="flex gap-3 mt-2">
              <Button onClick={() => router.push('/visitor/scanner')} className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 font-black uppercase text-white rounded-2xl">📷 Scan Stall</Button>
              <Button onClick={() => router.push('/visitor/connections')} className="flex-1 bg-white text-blue-600 border-2 border-blue-600/20 hover:bg-blue-50 h-14 font-black uppercase rounded-2xl">📋 Saved</Button>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-400 font-bold uppercase text-[10px] mt-6 mx-auto hover:text-red-500">← Logout</Button>
        </div>
      )}
    </div>
  )
}

export default function VisitorPortal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center font-black uppercase text-[10px] tracking-widest">Loading Portal...</div>}>
      <VisitorHubContent />
    </Suspense>
  )
}