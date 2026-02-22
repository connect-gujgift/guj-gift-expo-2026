'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

function BareMetalPrintContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [person, setPerson] = useState<any>(null)
  const [role, setRole] = useState<string>('VISITOR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchPerson = async () => {
        let { data } = await supabase.from('visitors').select('*').eq('id', id).single()
        let userRole = 'VISITOR'

        if (!data) {
          const { data: exhibitorData } = await supabase.from('exhibitors').select('*').eq('id', id).single()
          if (exhibitorData) {
            data = exhibitorData
            userRole = exhibitorData.is_staff ? 'STAFF' : 'EXHIBITOR'
          }
        }

        if (data) {
          setPerson(data)
          setRole(userRole)
          // Fire print dialog immediately. 
          // 50ms is just enough for React to attach the text to the DOM.
          setTimeout(() => window.print(), 50)
        }
        setLoading(false)
      }
      fetchPerson()
    }
  }, [id])

  if (loading) return <p style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading pass...</p>
  if (!person) return <p style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>Not Found</p>

  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  return (
    <>
      {/* ULTRA-LIGHTWEIGHT PRINT CSS:
        No media queries to calculate. Forces the exact paper size and removes all margins.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @page { 
          size: 384px 680px; 
          margin: 0; 
        }
        html, body { 
          background: white; 
          margin: 0; 
          padding: 0; 
          color: black;
        }
        /* Hide everything if the user cancels the print, keeping the screen clean */
        @media screen {
           body { background: #f1f5f9; display: flex; justify-content: center; padding-top: 50px; }
        }
      `}} />

      {/* BARE-METAL DOM: 
        No logos. No hidden UI. Just pure data mapped to the blank spaces of your paper. 
      */}
      <div style={{ width: '384px', height: '680px', background: 'white', position: 'relative', fontFamily: 'sans-serif' }}>
          
          {/* EXACT SPACER: Pushes the QR code down past your pre-printed event logo and pill */}
          <div style={{ height: '150px', width: '100%' }}></div>

          {/* QR CODE & NAME SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
              
              {/* QR Code with simple black border */}
              <div style={{ padding: '8px', border: '4px solid black', borderRadius: '16px', background: 'white', display: 'inline-block' }}>
                  <QRCode value={person.id} size={140} fgColor="#000000" level="M" />
              </div>
              
              {/* Name & Role */}
              <div style={{ marginTop: '16px' }}>
                  <h2 style={{ fontSize: '30px', fontWeight: '900', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
                      {person.full_name}
                  </h2>
                  <p style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: '6px 0 0 0', letterSpacing: '2px' }}>
                      {role}
                  </p>
              </div>
          </div>

          {/* COMPANY & STALL SECTION */}
          <div style={{ padding: '0 24px', marginTop: '20px', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', letterSpacing: '1px', margin: '0 0 4px 0' }}>
                      {stallNumber ? `STALL: ${stallNumber}` : 'COMPANY / FIRM'}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', color: 'black', margin: '0', lineHeight: '1.1' }}>
                      {person.company_name || 'Individual'}
                  </p>
              </div>
          </div>

      </div>
    </>
  )
}

export default function BareMetalPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading...</div>}>
      <BareMetalPrintContent />
    </Suspense>
  )
}