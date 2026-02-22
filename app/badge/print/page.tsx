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

  const handleInstantPrint = () => {
    const svgElement = document.querySelector('#qr-code-wrapper svg') as SVGElement;
    if (!svgElement) return;

    const xml = new XMLSerializer().serializeToString(svgElement);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }

        const flatPngUrl = canvas.toDataURL('image/png');
        const stallNumber = person?.stall_number || person?.stall_no || person?.stall || person?.Stall || '';

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print Pass</title>
                <style>
                  @page { margin: 0; }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    text-align: center;
                    background: white;
                    color: black;
                  }
                  .spacer { height: 1.6in; width: 100%; }
                  .qr-box {
                    display: inline-block;
                    padding: 0.1in;
                    border: 3px solid black;
                    border-radius: 12px;
                    background: white;
                  }
                  .qr-box img { width: 1.4in; height: 1.4in; display: block; }
                  .name { font-size: 26pt; font-weight: 900; text-transform: uppercase; margin: 0.15in 0 0 0; line-height: 1; }
                  .role { font-size: 12pt; font-weight: 900; text-transform: uppercase; margin: 0.05in 0 0 0; letter-spacing: 2px; }
                  .footer-box { border-top: 1px solid #ccc; width: 3.5in; margin: 0.25in auto 0 auto; padding-top: 0.2in; }
                  .stall { font-size: 9pt; font-weight: bold; text-transform: uppercase; color: #555; letter-spacing: 1px; margin: 0 0 0.05in 0; }
                  .company { font-size: 18pt; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1.1; }
                </style>
              </head>
              <body>
                <div class="spacer"></div>
                
                <div class="qr-box">
                    <img src="${flatPngUrl}" alt="QR" />
                </div>

                <h2 class="name">${person.full_name}</h2>
                <p class="role">${role}</p>

                <div class="footer-box">
                    <p class="stall">${stallNumber ? 'STALL: ' + stallNumber : 'COMPANY / FIRM'}</p>
                    <p class="company">${person.company_name || 'Individual'}</p>
                </div>
              </body>
            </html>
          `);
          iframeDoc.close();

          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 5000);
          }, 50);
        }
    };

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

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200" style={{ width: '384px', height: '680px' }}>
          <div style={{ width: '100%', height: '100%' }}>
              
              <div style={{ height: '150px', width: '100%' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
                  
                  <div id="qr-code-wrapper" style={{ padding: '8px', border: '4px solid black', borderRadius: '16px', background: 'white', display: 'inline-block', margin: '0 auto' }}>
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
                          {stallNumber ? 'STALL: ' + stallNumber : 'COMPANY / FIRM'}
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