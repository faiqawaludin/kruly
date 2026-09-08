"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import CreateProjectModal from "./CreateProjectModal"

export default function SidebarSpaces({ spaces }: { spaces: any[] }) {
  // SEMUA STATE HARUS DI SINI (Di dalam fungsi)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null) // State 3-dot Workspace
  const [activeProjectDropdown, setActiveProjectDropdown] = useState<string | null>(null) // State 3-dot Project
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // FUNGSI RENAME SPACE
  const handleRenameWorkspace = async (id: string, oldName: string) => {
    const newName = window.prompt("Ubah nama Space:", oldName)
    if (!newName || newName === oldName) return
    
    try {
      const { error } = await supabase.from('workspaces').update({ name: newName }).eq('id', id)
      if (error) throw new Error(error.message)
      router.refresh()
    } catch (e: any) {
      alert("Gagal mengubah nama: " + e.message)
    }
  }

  // FUNGSI DELETE SPACE
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

  // FUNGSI RENAME PROJECT
  const handleRenameProject = async (id: string, oldName: string) => {
    const newName = window.prompt("Ubah nama Proyek:", oldName)
    if (!newName || newName === oldName) return
    try {
      const { error } = await supabase.from('projects').update({ name: newName }).eq('id', id)
      if (error) throw new Error(error.message)
      router.refresh()
    } catch (e: any) {
      alert("Gagal mengubah nama Proyek: " + e.message)
    }
  }

  // FUNGSI DELETE PROJECT
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Hapus proyek "${name}" beserta seluruh task-nya?`)) return
    try {
      const { error } = await supabase.rpc('delete_project', { p_project_id: id })
      if (error) throw new Error(error.message)
      router.refresh()
      if (pathname.startsWith(`/dashboard/projects/${id}`)) router.push('/dashboard')
    } catch (e: any) {
      alert("Gagal menghapus Proyek: " + e.message)
    }
  }

  return (
    <div className="space-y-1">
      {spaces.map((ws) => (
        <div key={ws.id} className="border-b border-zinc-800/60 last:border-0 pb-2 mb-2">
          
          {/* HEADER WORKSPACE */}
          {/* PERBAIKAN: Deteksi jika pathname cocok dengan ID space, beri warna ungu */}
          <div className={`group flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors relative ${
            pathname === `/dashboard/spaces/${ws.id}` 
              ? 'bg-indigo-500/10 text-indigo-400 font-bold' 
              : 'font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
          }`}>
            
            <div className="flex items-center gap-1 overflow-hidden flex-1">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpand(ws.id); }}
                className={`p-1 rounded-md hover:bg-zinc-700/50 transition-colors ${
                  pathname === `/dashboard/spaces/${ws.id}` ? 'text-indigo-400 hover:text-indigo-300' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <svg className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${expanded[ws.id] ? 'rotate-90 text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* LINK KE SPACE DASHBOARD */}
              <Link href={`/dashboard/spaces/${ws.id}`} className="truncate flex-1 py-0.5 hover:text-indigo-400 transition-colors">
                {ws.name}
              </Link>

            </div>

            {/* AREA KANAN: 3-Dot Menu & Tombol Plus */}
            <div className={`flex items-center transition-opacity ${activeDropdown === ws.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              
              {/* TOMBOL 3 DOT SPACE */}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === ws.id ? null : ws.id); }}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12a2 2 0 11-4 0 2 2 0 014 0zM14 12a2 2 0 11-4 0 2 2 0 014 0zM23 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </button>

              {/* TOMBOL PLUS (Create Project) */}
              <CreateProjectModal workspaces={[ws]} isSidebarButton={true} />

              {/* MENU DROPDOWN SPACE */}
              {activeDropdown === ws.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                  
                  <div className="absolute right-0 top-8 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleRenameWorkspace(ws.id, ws.name); }}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    >
                      Rename Space
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteWorkspace(ws.id, ws.name); }}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-zinc-700 hover:text-red-300"
                    >
                      Delete Space
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* DAFTAR PROJECT */}
          {expanded[ws.id] && (
            <div className="pl-6 pr-2 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {ws.projects.length === 0 ? (
                <div className="px-3 py-1.5 text-xs text-zinc-500 italic">Belum ada proyek</div>
              ) : (
                ws.projects.map((proj: any) => {
                  const isActive = pathname.startsWith(`/dashboard/projects/${proj.id}`)
                  return (
                    <div key={proj.id} className={`group flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors relative ${isActive ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
                      <Link href={`/dashboard/projects/${proj.id}`} className="flex items-center gap-2 overflow-hidden flex-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="truncate">{proj.name}</span>
                      </Link>
                      
                      {/* MENU 3-TITIK UNTUK PROYEK */}
                      <div className="flex items-center">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveProjectDropdown(activeProjectDropdown === proj.id ? null : proj.id); }}
                          className={`p-1 transition-opacity ${activeProjectDropdown === proj.id ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12a2 2 0 11-4 0 2 2 0 014 0zM14 12a2 2 0 11-4 0 2 2 0 014 0zM23 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </button>

                        {activeProjectDropdown === proj.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveProjectDropdown(null); }} />
                            
                            <div className="absolute right-2 top-8 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveProjectDropdown(null); handleRenameProject(proj.id, proj.name); }}
                                className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
                              >
                                Rename Proyek
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveProjectDropdown(null); handleDeleteProject(proj.id, proj.name); }}
                                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-zinc-700 hover:text-red-300"
                              >
                                Delete Proyek
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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