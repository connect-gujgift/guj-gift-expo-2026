'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Scanner } from '@yudiel/react-qr-scanner'

export default function SecurityDeptPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [scanInput, setScanInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  
  // Camera State
  const [useCamera, setUseCamera] = useState(false)
  const [lastScanned, setLastScanned] = useState('')

  // Status of the current scan
  const [scanResult, setScanResult] = useState<any | null>(null)
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'GRANTED' | 'VIP' | 'DENIED'>('IDLE')
  
  // Session history for the guard
  const [scanHistory, setScanHistory] = useState<any[]>([])

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  // Core Processing Logic (Used by both Manual Input and Camera)
  const processScan = async (inputStr: string) => {
    if (!inputStr.trim() || isScanning) return
    setIsScanning(true)
    setScanStatus('IDLE')
    
    let foundUser = null
    let userType = ''

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputStr)

    if (isUUID) {
      const { data: vData } = await supabase.from('visitors').select('*').eq('id', inputStr).maybeSingle()
      if (vData) { foundUser = vData; userType = 'VISITOR' }
      
      if (!foundUser) {
        const { data: eData } = await supabase.from('exhibitors').select('*').eq('id', inputStr).maybeSingle()
        if (eData) { foundUser = eData; userType = eData.is_staff ? 'STAFF' : 'EXHIBITOR' }
      }
    } else {
      const { data: vData } = await supabase.from('visitors').select('*').eq('phone', inputStr).maybeSingle()
      if (vData) { foundUser = vData; userType = 'VISITOR' }
      
      if (!foundUser) {
        const { data: eData } = await supabase.from('exhibitors').select('*').eq('phone', inputStr).maybeSingle()
        if (eData) { foundUser = eData; userType = eData.is_staff ? 'STAFF' : 'EXHIBITOR' }
      }
    }

    if (foundUser) {
      const resultData = { ...foundUser, type: userType, timestamp: new Date() }
      setScanResult(resultData)
      setScanStatus(foundUser.is_vip ? 'VIP' : 'GRANTED')
      setScanHistory(prev => [resultData, ...prev].slice(0, 10))
    } else {
      setScanResult(null)
      setScanStatus('DENIED')
    }

    setScanInput('') 
    setIsScanning(false)
    
    // If using camera, close it temporarily to show the result
    if (useCamera) {
      setUseCamera(false)
    }
  }

  // Handler for manual form submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processScan(scanInput)
  }

  // Handler for live camera scan
  const handleCameraScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const text = detectedCodes[0].rawValue;
      if (text && text !== lastScanned) {
        setLastScanned(text)
        processScan(text)
      }
    }
  }

  const upgradeToVIP = async () => {
    if (!scanResult) return
    const table = (scanResult.type === 'VISITOR') ? 'visitors' : 'exhibitors'
    const { error } = await supabase.from(table).update({ is_vip: true }).eq('id', scanResult.id)
    if (!error) {
      setScanResult({ ...scanResult, is_vip: true })
      setScanStatus('VIP')
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-red-500 tracking-widest uppercase text-[10px] animate-pulse">Securing Terminal...</div>

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-20 font-sans text-white selection:bg-red-600 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-[2rem] shadow-2xl gap-4 border-b-4 border-red-600">
          <div>
            <h1 className="text-3xl font-black uppercase text-red-500 tracking-tighter italic leading-none">Security Dept</h1>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                 Live Mobile Scanner
               </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px] uppercase rounded-xl px-6 h-10 w-full md:w-auto">
            ← Hub
          </Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* SCANNER CONSOLE */}
          <div className="md:col-span-7 space-y-6">
            <Card className="border-0 shadow-2xl rounded-[2rem] bg-slate-800 overflow-hidden">
              <CardContent className="p-8">
                
                {useCamera ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="rounded-2xl overflow-hidden border-4 border-red-500 shadow-xl relative aspect-square md:aspect-video bg-black">
                       <Scanner onScan={handleCameraScan} formats={['qr_code']} />
                    </div>
                    <Button onClick={() => setUseCamera(false)} variant="outline" className="w-full h-14 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 font-black uppercase tracking-widest rounded-2xl">
                      Cancel Camera
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">
                      Scan QR Code or Enter Phone No.
                    </label>
                    <div className="flex gap-3">
                      <Input 
                        autoFocus
                        placeholder="Scanner input..." 
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="h-16 bg-slate-900 border-2 border-slate-700 text-white font-bold px-6 rounded-2xl focus-visible:ring-red-500 text-lg"
                      />
                      <Button type="submit" disabled={isScanning} className="h-16 px-8 bg-slate-900 border border-slate-700 hover:bg-slate-700 font-black uppercase tracking-widest rounded-2xl text-white shadow-lg">
                        {isScanning ? '...' : 'Go'}
                      </Button>
                    </div>
                    
                    <div className="relative py-4 flex items-center">
                      <div className="flex-grow border-t border-slate-700"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">OR</span>
                      <div className="flex-grow border-t border-slate-700"></div>
                    </div>

                    <Button type="button" onClick={() => { setUseCamera(true); setScanStatus('IDLE'); }} className="w-full h-16 bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest rounded-2xl text-white shadow-xl flex items-center justify-center gap-3">
                      <span className="text-2xl">📷</span> Activate Phone Camera
                    </Button>
                  </form>
                )}

              </CardContent>
            </Card>

            {/* GIANT STATUS DISPLAY */}
            {scanStatus !== 'IDLE' && !useCamera && (
              <div className={`p-10 rounded-[2rem] border-4 shadow-2xl flex flex-col items-center justify-center text-center transition-all animate-in zoom-in-95 ${
                scanStatus === 'VIP' ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                scanStatus === 'GRANTED' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                'bg-red-500/10 border-red-600 text-red-500'
              }`}>
                
                <div className="text-7xl mb-4">
                  {scanStatus === 'VIP' ? '🌟' : scanStatus === 'GRANTED' ? '✅' : '🚫'}
                </div>
                
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                  {scanStatus === 'VIP' ? 'VIP ACCESS' : scanStatus === 'GRANTED' ? 'GRANTED' : 'DENIED'}
                </h2>

                {scanResult ? (
                  <div className="space-y-2 text-white mt-4 w-full">
                    <p className="text-3xl font-black uppercase">{scanResult.full_name}</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                      {scanResult.company_name || 'Independent'} • {scanResult.type}
                    </p>
                    
                    {scanStatus === 'GRANTED' && (
                      <Button onClick={upgradeToVIP} variant="outline" className="mt-6 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-full h-10 px-8">
                        Upgrade to VIP
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-2">
                    Invalid Pass or Record Not Found
                  </p>
                )}
              </div>
            )}
            
            {scanStatus === 'IDLE' && !useCamera && (
              <div className="h-[250px] border-4 border-dashed border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-slate-600">
                <span className="text-6xl mb-4">🛡️</span>
                <p className="font-black uppercase tracking-widest text-sm">Awaiting Scan</p>
              </div>
            )}
          </div>

          {/* REAL-TIME SESSION LOG */}
          <div className="md:col-span-5">
            <Card className="border-0 shadow-2xl rounded-[2rem] bg-slate-800 h-[600px] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-black uppercase tracking-widest text-xs text-slate-300">Session Log</h3>
                <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-[9px] font-bold">Last 10 Scans</span>
              </div>
              <CardContent className="p-0 flex-1 overflow-auto">
                <div className="divide-y divide-slate-700/50">
                  {scanHistory.map((log, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                      <div>
                        <p className="font-black uppercase text-sm text-white leading-none">{log.full_name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                          {log.type} {log.is_vip ? '• VIP' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${log.is_vip ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                          {log.is_vip ? 'VIP' : 'OK'}
                        </span>
                        <p className="text-[8px] text-slate-500 mt-1 font-mono">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {scanHistory.length === 0 && (
                    <div className="p-10 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">No scans recorded yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}