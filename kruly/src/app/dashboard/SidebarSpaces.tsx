"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import CreateProjectModal from "./CreateProjectModal"

export default function SidebarSpaces({ spaces }: { spaces: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (!confirm(`PERINGATAN!\n\nApakah Anda yakin ingin menghapus workspace "${name}"?\nSemua Proyek dan Task di dalamnya akan HILANG PERMANEN!`)) return
    
    try {
      const { error } = await supabase.rpc('delete_workspace', { ws_id: id })
      if (error) throw new Error(error.message)
      
      router.refresh()
      if (pathname.includes('/projects/')) router.push('/dashboard')
    } catch (e: any) {
      alert("Gagal menghapus Workspace: " + e.message)
    }
  }

  // FUNGSI BARU: Hapus Proyek
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`PERINGATAN!\n\nApakah Anda yakin ingin menghapus proyek "${name}"?\nSemua Task di dalamnya akan HILANG PERMANEN!`)) return
    
    try {
      const { error } = await supabase.rpc('delete_project', { p_project_id: id })
      if (error) throw new Error(error.message)
      
      router.refresh()
      // Jika sedang membuka proyek yang dihapus, tendang balik ke Dashboard
      if (pathname.startsWith(`/dashboard/projects/${id}`)) {
        router.push('/dashboard')
      }
    } catch (e: any) {
      alert("Gagal menghapus Proyek: " + e.message)
    }
  }

  return (
    <div className="space-y-1">
      {spaces.map((ws) => (
        <div key={ws.id} className="border-b border-zinc-800/60 last:border-0 pb-2 mb-2">
          
          {/* Header Workspace */}
          <div className="group flex items-center justify-between px-2 py-1.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800/80 hover:text-white rounded-md transition-colors">
            <div 
              className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer"
              onClick={() => toggleExpand(ws.id)}
            >
              <svg className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${expanded[ws.id] ? 'rotate-90 text-indigo-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate">{ws.name}</span>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CreateProjectModal workspaces={[ws]} isSidebarButton={true} />
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(ws.id, ws.name); }} 
                className="text-zinc-500 hover:text-red-400 p-1 ml-1" 
                title="Hapus Workspace Permanen"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          
          {/* Daftar Project di dalam Workspace */}
          {expanded[ws.id] && (
            <div className="pl-6 pr-2 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {ws.projects.length === 0 ? (
                <div className="px-3 py-1.5 text-xs text-zinc-500 italic">Belum ada proyek</div>
              ) : (
                ws.projects.map((proj: any) => {
                  const isActive = pathname.startsWith(`/dashboard/projects/${proj.id}`)
                  return (
                    // PERUBAHAN: Dibungkus dengan group div agar bisa memunculkan tombol hapus
                    <div 
                      key={proj.id} 
                      className={`group flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors ${
                        isActive ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Link 
                        href={`/dashboard/projects/${proj.id}`}
                        className="flex items-center gap-2 overflow-hidden flex-1"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="truncate">{proj.name}</span>
                      </Link>

                      {/* Tombol Hapus Proyek (Muncul saat hover) */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id, proj.name); }} 
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-opacity" 
                        title="Hapus Proyek"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}