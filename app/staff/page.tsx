'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StaffDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* LOGO */}
        <div className="bg-[#0b3d41] p-6 rounded-3xl inline-block shadow-lg">
           <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto object-contain" />
        </div>
        
        <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic">Staff Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guj Gift Expo 2026</p>
        </div>
        
        {/* MAIN ACTION CARD */}
        <Card 
          className="border-0 shadow-2xl bg-white active:scale-95 transition-all cursor-pointer rounded-[2rem] overflow-hidden group" 
          onClick={() => router.push('/admin/registration-desk')}
        >
          <CardContent className="p-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:bg-blue-100 transition-colors">
                🖨️
            </div>
            <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">Registration & Printing</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Spot Entry & Badge Printing</p>
          </CardContent>
        </Card>

        {/* LOGOUT */}
        <Button 
            variant="ghost" 
            onClick={() => router.push('/login')} 
            className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]"
        >
            ← Logout & Exit
        </Button>
      </div>
    </div>
  )
}