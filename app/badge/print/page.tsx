'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

function InstantPrintContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [person, setPerson] = useState<any>(null)
  const [role, setRole] = useState<string>('VISITOR')
  const [loading, setLoading] = useState(true)

  // THE MAGIC FUNCTION: Prints from an isolated, instant-loading sandbox
  const handleInstantPrint = () => {
    const badgeContent = document.getElementById('raw-badge-data');
    if (!badgeContent) return;

    // 1. Create the invisible sandbox (iframe)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 2. Write ONLY the pure badge data into the sandbox
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Pass</title>
            <style>
              @page { size: 384px 680px; margin: 0; }
              body {
                margin: 0;
                padding: 0;
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
                color: black;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              /* Ensures the QR SVG stays perfectly crisp */
              svg { display: block; max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <div style="width: 384px; height: 680px; position: relative; overflow: hidden;">
              ${badgeContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // 3. Trigger the printer on this empty sandbox (Instant Load!)
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Clean up and delete the sandbox after printing
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 100); // 100ms gives the iframe just enough time to read the HTML
    }
  };

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
          // Automatically fire the instant print once the data is ready
          setTimeout(handleInstantPrint, 300);
        }
        setLoading(false)
      }
      fetchPerson()
    }
  }, [id])

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 uppercase tracking-widest mt-20">Loading Pass Data...</div>
  if (!person) return <div className="p-10 text-center font-bold text-red-500 uppercase tracking-widest mt-20">Badge Not Found</div>

  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-100 py-12">
      
      {/* Fallback button for the registration desk just in case auto-print is blocked by the browser */}
      <button 
          onClick={handleInstantPrint}
          className="mb-8 px-10 py-4 bg-[#0b3d41] text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
      >
          🖨️ Re-Print Badge
      </button>

      {/* This is the visual preview for the desk staff. 
        It holds the exact data layout that gets copied to the printer. 
      */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200" style={{ width: '384px', height: '680px' }}>
          
          <div id="raw-badge-data" style={{ width: '100%', height: '100%' }}>
              
              {/* EXACT SPACER: Pushes the QR code down past your pre-printed event logo and pill */}
              <div style={{ height: '150px', width: '100%' }}></div>

              {/* QR CODE & NAME SECTION */}
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
      </div>

    </div>
  )
}

export default function BareMetalPrintPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500 mt-20">Loading...</div>}>
      <InstantPrintContent />
    </Suspense>
  )
}