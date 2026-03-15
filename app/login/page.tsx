'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Invalid login credentials. Please try again.")
      setLoading(false)
      return
    }

    // Check if they are Super Admin or standard Exhibitor/Staff
    const allowedAdmins = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']
    if (allowedAdmins.includes(email)) {
      router.push('/admin')
    } else {
      router.push('/exhibitor') // Your layout will handle specific routing if they are staff
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Title Section */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative h-16 w-32 mx-auto mb-4">
          <Image src="/event-logo.png" alt="Guj Gift Expo" fill className="object-contain" priority />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0b3d41] italic">Portal Access</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Personnel Only</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border-0 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#0f172a] p-6 text-center border-b-4 border-orange-500">
          <h2 className="text-white font-black uppercase tracking-widest text-sm">Secure Login</h2>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registered Email</Label>
              <Input 
                required 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="company@domain.com" 
                className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold px-4 focus-visible:ring-orange-500 focus-visible:border-orange-500" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
              <Input 
                required 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold px-4 focus-visible:ring-orange-500 focus-visible:border-orange-500" 
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-14 bg-[#0b3d41] hover:bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 mt-4">
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </Button>
          </form>
        </div>
      </div>

      {/* CORRECTED CONTACT LINK */}
      <div className="mt-8 text-center animate-in fade-in duration-700">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Need Access? <a href="mailto:connect@gujgiftexpo.in?subject=Guj%20Gift%20Expo%20-%20Portal%20Access%20Request" className="text-orange-500 hover:text-orange-600 ml-1 transition-colors underline decoration-orange-500/30 underline-offset-4">Contact Organizers</a>
        </p>
      </div>

    </div>
  )
}