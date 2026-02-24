'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // 1. Check if Super Admin
    if (email === 'maulikshah.13@gmail.com') {
      router.push('/admin')
      return
    }

    // 2. Determine if Staff or Exhibitor
    const { data: profile } = await supabase
      .from('exhibitors')
      .select('is_staff')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_staff) {
      router.push('/staff') // Redirect to Staff Portal
    } else {
      router.push('/dashboard') // Redirect to Exhibitor Dashboard
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">Gift Connect Login</CardTitle>
          <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest mt-2">GGE 2026 Official Portal</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
            <Button type="submit" disabled={loading} className="w-full h-14 bg-[#ef6c33] hover:bg-[#d45a27] text-white font-black uppercase tracking-widest rounded-2xl">
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}