'use client'

import { useEffect, useState, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

function BareMetalPrintContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [person, setPerson] = useState<any>(null)
  const [role, setRole] = useState<string>('VISITOR')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Wait for the page to mount so we can safely use the React Portal
  useEffect(() => {
    setMounted(true)
  }, [])

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
          // Fire print dialog 100ms after data loads
          setTimeout(() => window.print(), 100)
        }
        setLoading(false)
      }
      fetchPerson()
    }
  }, [id])

  if (loading) return <div style={{ padding: '20px', background: 'white', position: 'fixed', inset: 0, zIndex: 9999 }}>Loading pass...</div>
  if (!person) return <div style={{ padding: '20px', color: 'red', background: 'white', position: 'fixed', inset: 0, zIndex: 9999 }}>Badge Not Found</div>

  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  // The actual badge HTML extracted so we can Portal it
  const badgeMarkup = (
    <div id="takeover-wrapper" style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#e2e8f0', zIndex: 9999999, display: 'flex',
        flexDirection: 'column', alignItems: 'center', paddingTop: '2rem', overflow: 'hidden'
    }}>
      <button 
          id="manual-print-btn"
          onClick={() => window.print()} 
          style={{
              marginBottom: '20px', padding: '12px 24px', background: '#ef6c33',
              color: 'white', fontWeight: '900', textTransform: 'uppercase',
              letterSpacing: '1px', borderRadius: '12px', cursor: 'pointer',
              border: 'none', fontSize: '14px', boxShadow: '0 4px 10px rgba(239, 108, 51, 0.3)'
          }}
      >
          🖨️ Click Here to Print Pass
      </button>

      <div id="printable-badge" style={{ 
          width: '384px', height: '680px', background: 'white', 
          position: 'relative', fontFamily: 'sans-serif',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
      }}>
          {/* EXACT SPACER: Pushes the QR code down past your pre-printed event logo and pill */}
          <div style={{ height: '150px', width: '100%' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
              <div style={{ padding: '8px', border: '4px solid black', borderRadius: '16px', background: 'white', display: 'inline-block' }}>
                  <QRCode value={person.id} size={140} fgColor="#000000" level="M" />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                  <h2 style={{ fontSize: '30px', fontWeight: '900', textTransform: 'uppercase', margin: '0', lineHeight: '1', color: 'black' }}>
                      {person.full_name}
                  </h2>
                  <p style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: '6px 0 0 0', letterSpacing: '2px', color: 'black' }}>
                      {role}
                  </p>
              </div>
          </div>

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
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: 384px 680px; margin: 0; }
          html, body { width: 384px !important; height: 680px !important; margin: 0 !important; padding: 0 !important; background: transparent !important; }
          
          /* ========================================================= */
          /* THE NUCLEAR OPTION: This instantly deletes the entire heavy 
             Next.js application from the printer's memory, bypassing 
             all loading delays. */
          /* ========================================================= */
          body > *:not(#takeover-wrapper) {
              display: none !important;
          }

          /* Strip the wrapper down to bare metal for printing */
          #takeover-wrapper {
              position: absolute !important; left: 0 !important; top: 0 !important;
              width: 384px !important; height: 680px !important; margin: 0 !important;
              padding: 0 !important; background: transparent !important; display: block !important;
          }
          
          #printable-badge {
              position: absolute !important; left: 0 !important; top: 0 !important;
              box-shadow: none !important;
          }
          
          #manual-print-btn { display: none !important; }
        }
      `}} />
      
      {/* Ejects the badge directly into the root body of the browser */}
      {mounted ? createPortal(badgeMarkup, document.body) : null}
    </>
  )
}

export default function BareMetalPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', fontFamily: 'sans-serif', position: 'fixed', inset: 0, background: 'white', zIndex: 9999 }}>Loading...</div>}>
      <BareMetalPrintContent />
    </Suspense>
  )
}