'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

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

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        // --- ROLE-BASED REDIRECT LOGIC ---
        // Check if the user is staff or admin
        const { data: profile } = await supabase
          .from('exhibitors')
          .select('is_staff')
          .eq('id', data.user.id)
          .single()

        // Admin override: Replace with your actual admin email
        const isAdmin = data.user.email === 'connect@gujtravelexpo.com'

        if (isAdmin) {
          router.push('/admin')
        } else if (profile?.is_staff) {
          router.push('/staff')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
          <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
          <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Secure Access</CardTitle>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-70">Official Portal Login</p>
        </CardHeader>
        
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-xs font-bold uppercase">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Email</Label>
              <Input 
                type="email" 
                placeholder="email@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 border-0 h-12 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-0 h-12 font-medium"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-100 transition-all text-white"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
               For technical support or lost credentials, contact <br/>
               <span className="text-[#0b3d41]">Shree Balaji Event LLP Support</span>
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}