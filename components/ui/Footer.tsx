import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-auto py-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 px-4">
        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
          Organized By
        </p>
        <div className="flex items-center gap-3">
          {/* Ensure this filename matches exactly what is in your public folder */}
          <Image 
            src="/organizer-logo.jpg" 
            alt="Shree Balaji Event LLP" 
            width={50} 
            height={50} 
            className="rounded-full object-cover border border-gray-300"
          />
          <span className="text-lg font-bold text-gray-800">
            Shree Balaji Event LLP
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          © 2026 Guj Gift Expo. All rights reserved.
        </p>
      </div>
    </footer>
  )
}