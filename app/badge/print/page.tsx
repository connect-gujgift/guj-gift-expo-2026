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

  // THE SILVER BULLET: Converts the heavy SVG into a lightning-fast PNG image
  const handleInstantPrint = () => {
    const svgElement = document.querySelector('#qr-code-wrapper svg') as SVGElement;
    if (!svgElement) return;

    // 1. Serialize the SVG
    const xml = new XMLSerializer().serializeToString(svgElement);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();

    // 2. When the image loads, draw it to a flat canvas (Rasterize)
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 140;
        canvas.height = img.height || 140;
        const ctx = canvas.getContext('2d');
        
        // Add a white background just in case
        if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }

        // 3. Convert to a flat PNG data URL
        const flatPngUrl = canvas.toDataURL('image/png');
        const stallNumber = person?.stall_number || person?.stall_no || person?.stall || person?.Stall || '';

        // 4. Eject to the Print Tab using the flat PNG instead of the SVG
        const printWindow = window.open('', '_blank', 'width=400,height=700');
        if (!printWindow) {
            alert("⚠️ Please allow pop-ups for this site so badges can print instantly!");
            return;
        }

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Pass</title>
              <style>
                @page { size: 384px 680px; margin: 0; }
                body {
                  margin: 0; padding: 0;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: white; color: black;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .container { width: 384px; height: 680px; position: relative; overflow: hidden; text-align: center; }
                
                .qr-box { 
                    padding: 8px; border: 4px solid black; border-radius: 16px; 
                    display: inline-block; background: white; margin-top: 150px; 
                }
                /* Use the flat PNG image */
                .qr-box img { display: block; width: 140px; height: 140px; }
              </style>
            </head>
            <body>
              <div class="container">
                
                <div class="qr-box">
                    <img src="${flatPngUrl}" alt="QR Code" />
                </div>

                <div style="margin-top: 16px;">
                    <h2 style="font-size: 30px; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1;">${person.full_name}</h2>
                    <p style="font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 6px 0 0 0; letter-spacing: 2px;">${role}</p>
                </div>

                <div style="padding: 0 24px; margin-top: 20px;">
                    <div style="border-top: 1px solid #cbd5e1; padding-top: 20px;">
                        <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #475569; letter-spacing: 1px; margin: 0 0 4px 0;">
                            ${stallNumber ? `STALL: ${stallNumber}` : 'COMPANY / FIRM'}
                        </p>
                        <p style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: black; margin: 0; line-height: 1.1;">
                            ${person.company_name || 'Individual'}
                        </p>
                    </div>
                </div>
              </div>

              <script>
                // Instantly triggers the print dialog, then closes tab
                window.onload = function() {
                    window.print();
                    window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
    };

    // Trigger the image load
    img.src = 'data:image/svg+xml;base64,' + svg64;
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
          // Wait 300ms for React to draw the SVG, then rasterize and print!
          setTimeout(handleInstantPrint, 300);
        }
        setLoading(false)
      }
      fetchPerson()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 uppercase tracking-widest mt-20">Loading Pass Data...</div>
  if (!person) return <div className="p-10 text-center font-bold text-red-500 uppercase tracking-widest mt-20">Badge Not Found</div>

  const stallNumber = person.stall_number || person.stall_no || person.stall || person.Stall || '';

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-100 py-12">
      
      <button 
          onClick={handleInstantPrint}
          className="mb-8 px-10 py-4 bg-[#0b3d41] text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 transition-all"
      >
          🖨️ Re-Print Badge
      </button>

      {/* Visual Preview for the Registration Desk Staff */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200" style={{ width: '384px', height: '680px' }}>
          <div style={{ width: '100%', height: '100%' }}>
              
              <div style={{ height: '150px', width: '100%' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
                  
                  {/* The SVG is rendered here ONCE, photographed by our code, and sent to the printer as a PNG */}
                  <div id="qr-code-wrapper" style={{ padding: '8px', border: '4px solid black', borderRadius: '16px', background: 'white', display: 'inline-block' }}>
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