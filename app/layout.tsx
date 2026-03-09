import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader"; 
import AppFooter from "@/components/AppFooter";
import Script from 'next/script' // Use official Next.js script component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guj Gift Expo 2026",
  description: "Official Hub",
  manifest: "/manifest.json",
  icons: {
    icon: '/event-logo.png',   // This replaces the Vercel logo
    apple: '/event-logo.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", 
  themeColor: "#0b3d41",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 antialiased flex flex-col min-h-screen`}>
        <Script id="sw-reg" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
        <AppHeader />
        <main className="flex-grow">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}