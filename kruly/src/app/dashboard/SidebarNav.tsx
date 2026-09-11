"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarNav({ globalRole }: { globalRole?: string }) {
  const pathname = usePathname()

  // Cek apakah user ini admin / super admin
  const isAdmin = globalRole === 'admin' || globalRole === 'super_admin'

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { name: 'Calendar', href: '/dashboard/calendar', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { name: 'Chat', href: '/dashboard/chat', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  ]

  const adminNav = [
    { name: 'User Management', href: '/dashboard/users', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> }
  ]

  return (
    <div className="flex flex-col gap-6">
      
      {/* MENU UTAMA */}
      <nav className="space-y-1">
        {mainNav.map((item) => {
          // Logika Active State
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              {item.icon} 
              {item.name}
              {/* Sisa kode badge notif sudah dicabut sepenuhnya dari sini */}
            </Link>
          )
        })}
      </nav>

      {/* ADMIN AREA (Hanya tampil untuk Admin/Super Admin) */}
      {isAdmin && (
        <div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">Admin Area</div>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  {item.icon} 
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
      
    </div>
  )
}