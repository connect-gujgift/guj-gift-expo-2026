'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from 'qrcode.react'

export default function RegistrationDesk() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successPass, setSuccessPass] = useState<any>(null)

  // Auth Check (Ensure only staff/admins can access this page)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    designation: '',
    city: '',
    businessType: 'Corporate Buyer'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Standardize phone format (add +91 if missing)
    let formattedPhone = formData.phone.trim()
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`
    }

    // 1. Check if they already exist to prevent duplicate errors
    const { data: existing } = await supabase
      .from('visitors')
      .select('*')
      .eq('phone', formattedPhone)
      .single()

    if (existing) {
      setSuccessPass(existing)
      setLoading(false)
      return
    }

    // 2. Insert new walk-in visitor
    const { data: newVisitor, error: insertError } = await supabase
      .from('visitors')
      .insert([{
        full_name: formData.fullName,
        phone: formattedPhone,
        email: formData.email || null,
        company_name: formData.companyName,
        designation: formData.designation,
        city: formData.city,
        business_type: formData.businessType
      }])
      .select()
      .single()

    if (insertError) {
      setError("Registration failed: " + insertError.message)
    } else {
      setSuccessPass(newVisitor)
    }
    
    setLoading(false)
  }

  const resetDesk = () => {
    setSuccessPass(null)
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      companyName: '',
      designation: '',
      city: '',
      businessType: 'Corporate Buyer'
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      
      {/* Top Bar for Staff */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <div>
          {/* UPDATED HEADER TEXT STYLING HERE */}
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-white">GGE 2026 Registration Desk</h1>
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-1">Authorized Staff Only</p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px]">
          Exit to Dashboard
        </Button>
      </div>

      {!successPass ? (
        /* RAPID REGISTRATION FORM */
        <Card className="w-full max-w-4xl border-0 shadow-2xl rounded-[2rem] bg-white overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-[#0b3d41] p-6 text-white flex flex-row justify-between items-center border-b-4 border-orange-500">
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-widest">Walk-In Registration</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center rounded-xl">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name *</Label>
                  <Input required name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Rahul Patel" className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-orange-500 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number *</Label>
                  <Input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-orange-500 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name *</Label>
                  <Input required name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Enterprise Ltd" className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-orange-500 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City *</Label>
                  <Input required name="city" value={formData.city} onChange={handleInputChange} placeholder="Ahmedabad" className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-orange-500 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Designation</Label>
                  <Input name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Purchase Manager" className="h-14 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-orange-500 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Type</Label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="flex h-14 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="Corporate Buyer">Corporate Buyer</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-xl text-lg shadow-xl hover:scale-[1.02] transition-all">
                  {loading ? 'Processing...' : 'Generate Entry Pass →'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      ) : (

        /* SUCCESS VIEW (Instantly clearable) */
        <Card className="w-full max-w-lg border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden animate-in zoom-in duration-300">
          <div className="bg-emerald-500 text-white text-center py-6 px-4 border-b-4 border-emerald-600">
             <h2 className="text-2xl font-black uppercase tracking-widest italic">Pass Activated</h2>
             <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">Please ask attendee to photograph this QR</p>
          </div>
          
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="space-y-1 w-full border-b border-slate-100 pb-6">
              <p className="text-3xl font-black text-slate-900 uppercase leading-none">{successPass.full_name}</p>
              <p className="text-md font-bold text-slate-500 mt-2 uppercase">{successPass.company_name}</p>
            </div>
            
            <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-slate-100">
              <QRCodeSVG value={`GGE2026-VISITOR-${successPass.id}`} size={250} level="H" includeMargin={false} fgColor="#0f172a" />
            </div>
            
            <Button onClick={resetDesk} className="w-full h-16 mt-8 bg-[#0b3d41] hover:bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl text-lg shadow-xl active:scale-95 transition-all">
              Next Visitor →
            </Button>
          </div>
        </Card>
      )}

    </div>
  )
}