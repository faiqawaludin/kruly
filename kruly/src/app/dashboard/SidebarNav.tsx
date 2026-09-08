"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
    },
    { 
      name: "Semua Proyek", 
      href: "/dashboard/projects", 
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
    }
  ]

  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        // Pastikan menu Dashboard hanya aktif jika url pas "/dashboard"
        // Sedangkan "Semua Proyek" aktif jika masuk ke dalam /dashboard/projects/...
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname.startsWith(item.href)

        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 ${
              isActive 
                ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {/* Animasi Ikon membesar */}
            <svg 
              className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
            </svg>
            
            {/* Animasi Teks bergeser ke kanan */}
            <span className={`transform transition-transform duration-300 ${
              isActive ? 'translate-x-1.5' : 'group-hover:translate-x-1.5'
            }`}>
              {item.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}