"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import CreateProjectModal from "./CreateProjectModal"
import EditProjectModal from "./EditProjectModal"

// HELPER: Ikon Kategori Project untuk Sidebar
const ProjectCategoryIcon = ({ category, className = "w-3.5 h-3.5 shrink-0" }: { category: string, className?: string }) => {
  const cat = (category || 'General').trim()
  if (cat === 'Corporate Planning') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  if (cat === 'Digitalisasi') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
}

export default function SidebarSpaces({ spaces }: { spaces: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null) 
  const [activeProjectDropdown, setActiveProjectDropdown] = useState<string | null>(null) 
  
  // STATE MODAL EDIT (Profesional Form)
  const [editSpace, setEditSpace] = useState<{id: string, name: string} | null>(null)
  const [isSavingSpace, setIsSavingSpace] = useState(false)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Buka otomatis semua workspace di sidebar
  useEffect(() => {
    if (spaces && spaces.length > 0) {
      const initialExpandedState: Record<string, boolean> = {}
      spaces.forEach(ws => { initialExpandedState[ws.id] = true })
      setExpanded(initialExpandedState)
    }
  }, [spaces])

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // FUNGSI DELETE SPACE
  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (!confirm(`PERINGATAN!\n\nApakah Anda yakin ingin menghapus workspace "${name}"?\nSemua Proyek dan Task di dalamnya akan HILANG PERMANEN!`)) return
    try {
      const { error } = await supabase.rpc('delete_workspace', { ws_id: id })
      if (error) throw new Error(error.message)
      router.refresh()
      if (pathname.includes('/projects/')) router.push('/dashboard')
    } catch (e: any) { alert("Gagal menghapus Workspace: " + e.message) }
  }

  // FUNGSI DELETE PROJECT
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Hapus proyek "${name}" beserta seluruh task-nya?`)) return
    try {
      const { error } = await supabase.rpc('delete_project', { p_project_id: id })
      if (error) throw new Error(error.message)
      router.refresh()
      if (pathname.startsWith(`/dashboard/projects/${id}`)) router.push('/dashboard')
    } catch (e: any) { alert("Gagal menghapus Proyek: " + e.message) }
  }

  return (
    <div className="space-y-1">
      {spaces.map((ws) => (
        <div key={ws.id} className="border-b border-zinc-800/60 last:border-0 pb-2 mb-2">
          
          {/* HEADER WORKSPACE */}
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

              <Link href={`/dashboard/spaces/${ws.id}`} className="truncate flex-1 py-0.5 hover:text-indigo-400 transition-colors">
                {ws.name}
              </Link>
            </div>

            {/* AREA KANAN: 3-Dot Menu & Tombol Plus */}
            <div className={`flex items-center transition-opacity ${activeDropdown === ws.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === ws.id ? null : ws.id); }} className="text-zinc-400 hover:text-white p-1 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12a2 2 0 11-4 0 2 2 0 014 0zM14 12a2 2 0 11-4 0 2 2 0 014 0zM23 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </button>

              <CreateProjectModal workspaces={[ws]} isSidebarButton={true} />

              {activeDropdown === ws.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                  <div className="absolute right-0 top-8 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setEditSpace({id: ws.id, name: ws.name}); }} 
                      className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    >
                      Edit Space
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
                        <ProjectCategoryIcon category={proj.category} />
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
                                onClick={(e) => { e.stopPropagation(); setActiveProjectDropdown(null); setEditProjectId(proj.id); }}
                                className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
                              >
                                Edit Proyek
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

      {/* RENDER MODAL EDIT PROJECT (Dari Sidebar) */}
      <EditProjectModal 
        projectId={editProjectId} 
        isOpen={!!editProjectId} 
        onClose={() => setEditProjectId(null)} 
      />

      {/* RENDER MODAL EDIT SPACE */}
      {editSpace && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900" onClick={() => setEditSpace(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-bold">Edit Space</h3>
              <button onClick={() => setEditSpace(null)} className="text-zinc-400 hover:text-zinc-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingSpace(true);
              const { error } = await supabase.from('workspaces').update({ name: editSpace.name }).eq('id', editSpace.id);
              setIsSavingSpace(false);
              if (!error) {
                setEditSpace(null);
                router.refresh();
              } else {
                alert(error.message);
              }
            }}>
              <div className="p-6">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Nama Space</label>
                <input
                  required
                  value={editSpace.name}
                  onChange={(e) => setEditSpace({...editSpace, name: e.target.value})}
                  className="w-full h-9 text-sm border border-zinc-200 rounded-md px-3 mt-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditSpace(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
                <button type="submit" disabled={isSavingSpace} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                  {isSavingSpace ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}