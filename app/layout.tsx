import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// This imports the interactive header we just made
// IMPORTANT: Ensure AppHeader.tsx is in the 'components' folder, not 'components/ui'
import AppHeader from "@/components/AppHeader"; 

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
  viewportFit: "cover", // Ensures content extends behind the iPhone notch
  themeColor: "#ffffff", // Matches the white header
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        
        {/* GLOBAL HEADER (Client Component) */}
        <AppHeader />

        {/* MAIN CONTENT WRAPPER */}
        {/* 'pb-safe-area-inset-bottom' handles the iPhone home bar space */}
        <main className="min-h-screen pb-safe-area-inset-bottom">
          {children}
        </main>

      </body>
    </html>
  );
}