import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guj Gift Expo 2026",
  description: "Official Lead Manager App",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Ensures content goes behind the notch
  themeColor: "#ffffff", // Changed to white to match the new header
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        
        {/* --- GLOBAL BRAND BAR (Appears on all screens) --- */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          {/* 'pt-[env(...)]' pushes content down below the iPhone notch */}
          <div className="flex justify-between items-center px-4 py-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
            
            {/* LEFT: Event Logo */}
            <div className="flex items-center">
              {/* Replace with your actual image file */}
              <img 
                src="/event-logo.png" 
                alt="Guj Gift Expo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image is missing
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-lg font-black text-blue-600 italic tracking-tighter">GGE 2026</span>';
                }}
              />
            </div>

            {/* RIGHT: Organizer Logo */}
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</span>
              <img 
                src="/organizer-logo.png" 
                alt="Shree Balaji" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image is missing
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML += '<span class="text-xs font-bold text-slate-800">SHREE BALAJI</span>';
                }}
              />
            </div>
            
          </div>
        </header>

        {/* --- MAIN CONTENT WRAPPER --- */}
        <main className="min-h-screen pb-safe-area-inset-bottom">
          {children}
        </main>

      </body>
    </html>
  );
}