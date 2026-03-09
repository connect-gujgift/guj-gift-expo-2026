import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader"; 
import AppFooter from "@/components/AppFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guj Gift Expo 2026",
  description: "Official Lead Manager App",
  manifest: "/manifest.json",
  icons: {
    icon: '/event-logo.png',   // Changes the standard browser tab icon
    apple: '/event-logo.png',  // Changes the icon if saved to an Apple iOS home screen
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", 
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 'flex flex-col min-h-screen' ensures the footer stays at the bottom */}
      <body className={`${inter.className} bg-slate-50 antialiased flex flex-col min-h-screen`}>
        
        <AppHeader />

        {/* 'flex-grow' pushes the footer down below the content */}
        <main className="flex-grow">
          {children}
        </main>

        <AppFooter />

      </body>
    </html>
  );
}