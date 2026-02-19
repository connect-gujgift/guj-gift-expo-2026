'use client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StaffDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <img src="/event-logo.png" alt="GGE 2026" className="h-24 mx-auto mb-6" />
        <h1 className="text-2xl font-black uppercase text-[#0b3d41] tracking-tighter">Staff Portal</h1>
        
        <Card className="border-0 shadow-xl bg-white active:scale-95 transition-all cursor-pointer" onClick={() => router.push('/admin/registration-desk')}>
          <CardContent className="p-10 flex flex-col items-center">
            <span className="text-5xl mb-4">🖨️</span>
            <h2 className="text-xl font-black uppercase text-slate-900">Registration & Printing</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Spot Entry & Badge Printing</p>
          </CardContent>
        </Card>

        <Button variant="ghost" onClick={() => router.push('/login')} className="text-slate-400 font-bold uppercase text-xs">Logout</Button>
      </div>
    </div>
  )
}