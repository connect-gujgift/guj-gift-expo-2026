import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[600px] flex items-center justify-center text-center text-white">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.jpg" 
            alt="Guj Gift Expo Hall" 
            fill 
            className="object-cover brightness-50" // Darkens image so text pops
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl px-6 space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-md">
            The Future of <br/>
            <span className="text-orange-500">Corporate Gifting</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Join Gujarat's biggest B2B exhibition. Connect with premium suppliers, discover trends, and grow your business.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
             {/* Primary Call to Action */}
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-orange-600 hover:bg-orange-700 font-bold">
                Register as Visitor
              </Button>
            </Link>
            
            {/* Secondary Call to Action */}
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white">
                Already Registered? Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-2">📅 500+ Exhibitors</h3>
            <p className="text-gray-600">Meet top manufacturers and suppliers from across India under one roof.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-2">🤝 B2B Networking</h3>
            <p className="text-gray-600">Schedule meetings directly through this app and build lasting partnerships.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-2">🚀 Exclusive Trends</h3>
            <p className="text-gray-600">Be the first to see the 2026 corporate gifting collection before anyone else.</p>
          </div>
        </div>
      </section>

    </div>
  )
}