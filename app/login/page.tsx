'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

type Role = 'admin' | 'staff' | 'exhibitor' | 'visitor' | null

export default function GlobalLoginHub() {
  const router = useRouter()
  
  // State to track which portal the user selected
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  
  // Form State
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
        // Fetch the profile to check the staff flag
        const { data: profile } = await supabase
          .from('exhibitors')
          .select('is_staff')
          .eq('id', data.user.id)
          .single()

        // Set your exact Super Admin email here
        const isAdmin = data.user.email === 'connect@gujtravelexpo.com'

        // --- STRICT ROLE VALIDATION ---
        if (selectedRole === 'admin') {
          if (!isAdmin) throw new Error("Unauthorized: Super Admin credentials required.")
          router.push('/admin')
        } 
        else if (selectedRole === 'staff') {
          if (!profile?.is_staff && !isAdmin) throw new Error("Unauthorized: Staff access required.")
          router.push('/staff')
        } 
        else if (selectedRole === 'exhibitor') {
          if (profile?.is_staff || isAdmin) throw new Error("Please use your dedicated portal.")
          router.push('/dashboard')
        }
        else if (selectedRole === 'visitor') {
          throw new Error("Visitor portal is currently under construction.")
        }
      }
    } catch (err: any) {
      // If validation fails, strictly log them out to prevent bad sessions
      await supabase.auth.signOut()
      setError(err.message || 'Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  // --- VIEW 1: GLOBAL PORTAL SELECTION ---
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-2xl text-center space-y-6">
          <img src="/event-logo.png" alt="GGE 2026" className="h-20 mx-auto object-contain drop-shadow-md" />
          
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic">Global Access Hub</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Select your portal to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group" onClick={() => setSelectedRole('visitor')}>
              <CardContent className="p-8 flex flex-col items-center justify-center bg-white group-hover:bg-slate-50 rounded-xl">
                <span className="text-4xl mb-3">🎟️</span>
                <h2 className="text-lg font-black uppercase tracking-tight">Visitor Portal</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Retrieve Pass & Info</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group" onClick={() => setSelectedRole('exhibitor')}>
              <CardContent className="p-8 flex flex-col items-center justify-center bg-white group-hover:bg-orange-50 rounded-xl">
                <span className="text-4xl mb-3">🎪</span>
                <h2 className="text-lg font-black text-[#ef6c33] uppercase tracking-tight">Exhibitor Login</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Manage Scans & Leads</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group" onClick={() => setSelectedRole('staff')}>
              <CardContent className="p-8 flex flex-col items-center justify-center bg-white group-hover:bg-blue-50 rounded-xl">
                <span className="text-4xl mb-3">🖨️</span>
                <h2 className="text-lg font-black text-blue-600 uppercase tracking-tight">Staff Login</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Registration Desk</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group" onClick={() => setSelectedRole('admin')}>
              <CardContent className="p-8 flex flex-col items-center justify-center bg-white group-hover:bg-teal-50 rounded-xl">
                <span className="text-4xl mb-3">⚙️</span>
                <h2 className="text-lg font-black text-[#0b3d41] uppercase tracking-tight">Super Admin</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Command Center</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // --- VIEW 2: DYNAMIC LOGIN FORM ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      <div className="w-full max-w-[400px] mb-6">
        <Button 
          variant="ghost" 
          onClick={() => { setSelectedRole(null); setError(''); }}
          className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]"
        >
          ← Back to Portal Selection
        </Button>
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-3xl bg-white">
        <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
          <CardTitle className="text-xl font-black uppercase tracking-tight italic">
            {selectedRole} Portal
          </CardTitle>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-70">Secure Authentication</p>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered Email</Label>
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
              className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
            >
              {loading ? 'Authenticating...' : 'Access System'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}