'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SecureScannerPage() {
  const router = useRouter()
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // 1. SECURITY LAYER: Check if user is the Admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
     // ENTER YOUR ACTUAL EMAIL HERE
const adminEmail = 'connect@shreebalajievent.com'

      if (!user || user.email !== adminEmail) {
        alert("Access Denied: Only authorized organizers can access the scanner.")
        router.push('/')
      } else {
        setIsAdmin(true)
      }
    }
    checkAdminStatus()
  }, [router])

  // 2. SCANNER LOGIC: Only starts if user is verified as Admin
  useEffect(() => {
    if (!isAdmin) return

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      async (decodedText) => {
        scanner.clear() 
        verifyVisitor(decodedText)
      },
      (err) => { /* Ignore constant scanning logs */ }
    )

    return () => {
      scanner.clear().catch(e => console.error("Scanner clear error", e))
    }
  }, [isAdmin])

  // 3. DATABASE VERIFICATION
  const verifyVisitor = async (id: string) => {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError("Invalid Badge: This QR code does not match any registered visitor.")
    } else {
      setScanResult(data)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setError(null)
    window.location.reload() 
  }

  if (!isAdmin) return <div className="p-10 text-center">Verifying Admin Permissions...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Gate Entry Scanner</h1>
        <p className="text-sm text-orange-600 font-bold">GUJ GIFT EXPO 2026 - GMDC Ground</p>
      </div>

      {!scanResult && !error && (
        <Card className="w-full max-w-md overflow-hidden shadow-lg border-2 border-orange-100">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-xs text-center text-orange-800 uppercase tracking-widest">
              Ready to Scan Badge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div id="reader" className="w-full"></div>
          </CardContent>
        </Card>
      )}

      {/* VERIFIED VISITOR VIEW */}
      {scanResult && (
        <Card className="w-full max-w-md border-4 border-green-500 bg-white text-center p-8 shadow-2xl">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-black text-gray-900 uppercase leading-tight mb-2">
            {scanResult.full_name}
          </h2>
          <p className="text-blue-700 text-xl font-bold mb-1">
            {scanResult.company_name}
          </p>
          <p className="text-gray-500 font-medium mb-6">
            {scanResult.designation}
          </p>
          <div className="bg-green-600 text-white py-3 rounded-xl font-black text-lg tracking-widest">
            ENTRY PERMITTED
          </div>
          <Button onClick={resetScanner} className="mt-8 w-full py-6 text-lg" variant="outline">
            Scan Next Visitor
          </Button>
        </Card>
      )}

      {/* INVALID BADGE VIEW */}
      {error && (
        <Card className="w-full max-w-md border-4 border-red-500 bg-white text-center p-8 shadow-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">{error}</h2>
          <Button onClick={resetScanner} className="mt-4 w-full bg-red-600 text-white py-6 text-lg">
            Try Again
          </Button>
        </Card>
      )}
      
      <div className="mt-10 text-gray-400 text-[10px] uppercase font-bold">
        Organized by Shree Balaji Event LLP
      </div>
    </div>
  )
}