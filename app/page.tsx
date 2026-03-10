'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-orange-500 selection:text-white">
      
      {/* HERO SECTION - NO NAVIGATION HERE */}
      <section className="relative h-[700px] flex items-center justify-center text-center text-white bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.jpg" 
            alt="Guj Gift Expo Hall" 
            fill 
            className="object-cover brightness-[0.4] scale-105"
            priority 
            sizes="100vw" 
            quality={90} 
          />
        </div>

        <div className="relative z-10 max-w-5xl px-6 space-y-8 animate-in fade-in zoom-in duration-700">
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-2xl leading-none italic uppercase">
            The Future of <br/>
            <span className="text-orange-500">Corporate Gifting</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Join Gujarat's most influential B2B exhibition. Discover 2026 trends, connect with global suppliers, and scale your sourcing.
          </p>
          
          {/* MAIN CENTER BUTTONS */}
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-sm px-10 py-8 bg-orange-600 hover:bg-orange-700 font-black uppercase tracking-widest shadow-2xl shadow-orange-900/40 rounded-2xl transition-all active:scale-95">
                Register as Visitor
              </Button>
            </Link>
            
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm px-10 py-8 bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-md font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">
                Exhibitor Login
              </Button>
            </Link>
          </div>

          {/* EVENT DETAILS GRID */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
             <Detail label="DATE" value="12 - 24 AUG 2026" />
             <Detail label="CITY" value="AHMEDABAD" />
             <Detail label="VENUE" value="GMDC UNIVERSITY HALL" />
             <Detail label="TIER" value="PREMIUM" />
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <FeatureCard icon="🏢" title="500+ Exhibitors" desc="Direct access to India's leading manufacturers and brand owners." />
          <FeatureCard icon="🤝" title="Smart Networking" desc="Use our integrated app tools to schedule one-on-one B2B meetings." />
          <FeatureCard icon="🚀" title="2026 Collections" desc="Experience the world premiere of next season's gifting innovations." />
        </div>
      </section>
    </div>
  )
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <p className="text-[9px] font-black tracking-[0.3em] text-orange-500 mb-1">{label}</p>
      <p className="text-xs font-bold tracking-widest uppercase">{value}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="group p-8 bg-slate-50 rounded-[2.5rem] border-b-4 border-transparent hover:border-orange-500 transition-all duration-300">
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  )
}