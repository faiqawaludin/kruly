"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import NotificationBell from "@/components/NotificationBell"

export default function SidebarWrapper({ 
  children, 
  userProfile 
}: { 
  children: React.ReactNode,
  userProfile: any
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Cek role untuk menampilkan ikon Admin saat collapsed
  const isAdmin = userProfile?.global_role === 'admin' || userProfile?.global_role === 'super_admin'

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-zinc-950 border-r border-zinc-900 flex flex-col shrink-0 relative z-50`}
    >
      
      {/* TOMBOL COLLAPSE */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full flex items-center justify-center border border-zinc-700 shadow-md transition-colors z-50 focus:outline-none"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg 
          className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* HEADER */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-zinc-900 shrink-0 transition-all duration-300`}>
        <div className={`font-black tracking-tighter text-white transition-all duration-300 ${isCollapsed ? 'text-xl' : 'text-2xl'}`}>
          {isCollapsed ? 'K.' : 'Kruly.'}
        </div>
        
        {!isCollapsed && <NotificationBell />}
      </div>
      
      {/* KONTEN UTAMA SIDEBAR */}
      {/* Tambahkan flex flex-col agar mt-auto pada children (profil) bisa bekerja */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-6 ${isCollapsed ? 'px-2' : 'px-3'} custom-scrollbar`}>
        
        {/* TAMPILAN NORMAL (EXPANDED) */}
        <div className={`transition-opacity duration-300 flex-1 flex flex-col ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          {children}
        </div>

        {/* TAMPILAN COLLAPSED (HANYA ICON) */}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-4 mt-2 opacity-100 transition-opacity duration-300 delay-100 h-full">
            
            {/* Menu Utama */}
            <div className="flex flex-col gap-4 w-full items-center">
              <Link href="/dashboard" className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${pathname === '/dashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title="Dashboard">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </Link>
              <Link href="/dashboard/calendar" className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${pathname?.startsWith('/dashboard/calendar') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title="Calendar">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </Link>
              <Link href="/dashboard/chat" className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${pathname?.startsWith('/dashboard/chat') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title="Chat">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </Link>
            </div>

            {/* Menu Admin (Muncul jika user adalah Admin/Super Admin) */}
            {isAdmin && (
              <>
                <div className="w-8 border-t border-zinc-800 my-1"></div>
                <Link href="/dashboard/users" className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${pathname?.startsWith('/dashboard/users') ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title="User Management">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </Link>
              </>
            )}

            {/* Area Bawah (Notif & Profil) */}
            <div className="mt-auto flex flex-col items-center gap-4 w-full">
              {/* Lonceng Notif */}
              <div className="flex justify-center w-full">
                <NotificationBell />
              </div>

              {/* Icon Profil */}
              <div className="pt-4 border-t border-zinc-900 w-full flex justify-center pb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-900 text-indigo-200 border-2 border-zinc-800 flex items-center justify-center text-sm font-bold shadow-lg" title={userProfile?.full_name}>
                  {(userProfile?.full_name || 'U').substring(0,2).toUpperCase()}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </aside>
  )
}