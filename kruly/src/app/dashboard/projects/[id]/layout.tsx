import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import ProjectTabs from "./ProjectTabs"
import Link from "next/link"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.id
  
  const supabase = await createClient()

  // 1. Ambil detail proyek
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) notFound()

  // 2. Ambil nama workspace untuk menu Breadcrumb / Back
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', project.workspace_id)
    .single()

  return (
    <div className="-mx-8 -mt-8 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* HEADER BREADCRUMB ALA CLICKUP */}
      <div className="pt-6 bg-white border-b border-transparent">
        <div className="flex items-center gap-1 px-6 mb-4 text-sm font-medium">
          
          {/* Tombol Back & Nama Workspace */}
          <Link 
            href="/dashboard"
            className="group flex items-center gap-1.5 px-2 py-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            title="Kembali ke Dashboard Utama"
          >
            {/* Ikon Back Arrow */}
            <svg className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-zinc-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            
            <div className="flex items-center gap-1.5 ml-1">
              {/* Ikon Space/Folder */}
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
              </svg>
              <span>{workspace?.name || 'Workspace'}</span>
            </div>
          </Link>

          {/* Separator / */}
          <span className="text-zinc-300 mx-1">/</span>

          {/* Nama Project Saat Ini */}
          <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-900">
            {/* Ikon List/Project */}
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="font-bold text-base tracking-tight">{project.name}</span>
            
            {/* Status Badge */}
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider border ${
              project.status === 'active' 
                ? 'bg-green-50 text-green-600 border-green-200' 
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}>
              {project.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Sisipkan Komponen Tab */}
        <ProjectTabs projectId={projectId} />
      </div>
      
      {/* Area Konten Dinamis (List, Gantt, Dashboard akan dirender di sini) */}
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}