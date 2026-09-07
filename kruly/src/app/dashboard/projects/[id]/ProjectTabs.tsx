"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname()

  // Definisi tab sesuai spesifikasi ClickUp kamu
  const tabs = [
    { name: "List", href: `/dashboard/projects/${projectId}`, exact: true },
    { name: "Dashboard", href: `/dashboard/projects/${projectId}/dashboard`, exact: false },
    { name: "Gantt", href: `/dashboard/projects/${projectId}/gantt`, exact: false },
  ]

  return (
    <div className="flex gap-6 text-sm font-medium text-zinc-500 border-b border-zinc-200 px-8">
      {tabs.map((tab) => {
        const isActive = tab.exact 
          ? pathname === tab.href 
          : pathname.startsWith(tab.href)

        return (
          <Link 
            key={tab.name} 
            href={tab.href} 
            className={`pb-3 px-1 border-b-2 transition-colors ${
              isActive 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent hover:text-zinc-900 hover:border-zinc-300"
            }`}
          >
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}