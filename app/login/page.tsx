'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    // Traffic Controller Logic
    if (data.user?.email === 'maulikshah.13@gmail.com') {
      router.push('/admin') // Super Admin route
    } else {
      router.push('/exhibitor') // Exhibitor Portal route
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-orange-500 selection:text-white">
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* LOGO & BRANDING */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-48 h-20">
            <Image 
              src="/event-logo.png" 
              alt="Guj Gift Expo 2026" 
              fill 
              className="object-contain" 
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[#0b3d41] italic">
              Portal Access
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Authorized Personnel Only
            </p>
          </div>
        </div>

        {/* LOGIN CARD */}
        <Card className="border-0 shadow-2xl rounded-[2rem] bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-6 text-center border-b-4 border-orange-500">
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Secure Login
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Registered Email
                  </label>
                  <Input 
                    type="email" 
                    placeholder="company@domain.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 bg-slate-50 border-2 rounded-xl px-4 font-bold focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Password
                  </label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 bg-slate-50 border-2 rounded-xl px-4 font-bold focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-[#0b3d41] hover:bg-[#082a2d] text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
              >
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FOOTER TEXT */}
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Need access? <a href="mailto:support@gujgiftexpo.in" className="text-orange-500 hover:underline">Contact Organizers</a>
        </p>

      </div>
    </div>
  )
}