"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import CreateLinkModal from "./CreateLinkModal"
import CreateTaskModal from "./CreateTaskModal"

const formatClickUpDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length === 3) return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0].slice(-2)}`
  return dateStr
}

const DocumentIcon = ({ url, className = "w-4 h-4" }: { url: string, className?: string }) => {
  if (!url) return <svg className={`${className} text-zinc-300 hover:text-zinc-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>;
  const lower = url.toLowerCase()
  if (lower.includes('docs.google.com/spreadsheets')) return <svg className={`${className} text-emerald-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V8h4v2zm3 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm-2-5V3.5L18.5 9H13z"/></svg>;
  if (lower.includes('docs.google.com/presentation')) return <svg className={`${className} text-amber-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>;
  if (lower.includes('docs.google.com/document')) return <svg className={`${className} text-blue-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
  if (lower.includes('drive.google.com')) return <svg className={`${className} text-blue-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M7.71 3.5L1.15 15L4.58 21L11.13 9.5M9.73 15L6.3 21H19.42L22.85 15M22.28 14L15.72 2.5H8.85L15.43 14"/></svg>;
  if (lower.includes('figma.com')) return <svg className={`${className} text-pink-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0-6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-3 6c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3h-3v-3zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3h-3V6zm3 12c-1.66 0-3 1.34-3 3s1.34 3 3 3-1.34 3-3-3h3v-3z"/></svg>;
  if (lower.includes('github.com')) return <svg className={`${className} text-zinc-800`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z"/></svg>;
  return <svg className={`${className} text-indigo-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>;
}

const StatusIcon = ({ status, className = "w-5 h-5" }: { status: string, className?: string }) => {
  let colorClass = ""
  switch (status) {
    case 'Open': colorClass = "text-zinc-400"; break;
    case 'In-Progress': colorClass = "text-blue-500"; break;
    case 'Waiting for Review': colorClass = "text-amber-500"; break;
    case 'Revision': colorClass = "text-red-500"; break;
    case 'Completed': colorClass = "text-emerald-500"; break;
    default: colorClass = "text-zinc-400";
  }
  return (
    <svg className={`${className} ${colorClass}`} viewBox="0 0 16 16" fill="currentColor">
      {status === 'Open' && <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />}
      {status === 'In-Progress' && <><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8 L8 1.5 A6.5 6.5 0 0 1 14.5 8 Z" fill="currentColor" /></>}
      {status === 'Waiting for Review' && <><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8 L8 1.5 A6.5 6.5 0 0 1 8 14.5 Z" fill="currentColor" /></>}
      {status === 'Revision' && <><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8 L8 1.5 A6.5 6.5 0 1 1 1.5 8 Z" fill="currentColor" /></>}
      {status === 'Completed' && <><circle cx="8" cy="8" r="7.5" fill="currentColor" /><path d="M5 8.5 L7 10.5 L11 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>}
    </svg>
  )
}

// IKON BREADCRUMB
const ProjectCategoryIcon = ({ category, className = "w-3.5 h-3.5" }: { category: string, className?: string }) => {
  switch (category) {
    case 'Corporate Planning':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    case 'Digitalisasi': 
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    default: 
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  }
}

export default function ProjectView({ project, tasks, links, members }: any) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])

  const [activeTab, setActiveTab] = useState('list') 
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<{ id: string, type: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const [localTasks, setLocalTasks] = useState<any[]>([])
  const [localProject, setLocalProject] = useState<any>(project || {})

  useEffect(() => {
    if (tasks) setLocalTasks(tasks)
    if (project) setLocalProject(project)
  }, [tasks, project])

  if (!isMounted) return <div className="p-10 flex justify-center text-zinc-400">Memuat antarmuka...</div>;

  const toggleTaskSelection = (taskId: string) => {
    const newSet = new Set(selectedTasks)
    if (newSet.has(taskId)) newSet.delete(taskId)
    else newSet.add(taskId)
    setSelectedTasks(newSet)
  }

  const clearSelection = () => setSelectedTasks(new Set())

  const handleUpdateProject = async (field: string, value: string) => {
    setLocalProject((prev: any) => ({ ...prev, [field]: value }))
    setEditingCell(null)
    try {
      await supabase.from('projects').update({ [field]: value }).eq('id', project?.id)
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleUpdateTask = async (taskId: string | string[], field: string, value: any) => {
    const idsToUpdate = Array.isArray(taskId) ? taskId : [taskId]
    setLocalTasks(prev => prev.map(t => idsToUpdate.includes(t.id) ? { ...t, [field]: value } : t))
    setEditingCell(null)
    setActiveDropdown(null)
    try {
      await supabase.from('tasks').update({ [field]: value }).in('id', idsToUpdate)
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Hapus task ini?')) return
    setLocalTasks(prev => prev.filter(t => t.id !== taskId))
    setActiveDropdown(null)
    try { await supabase.from('tasks').delete().eq('id', taskId) } catch (e) {}
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus permanen ${selectedTasks.size} task yang dipilih?`)) return
    const ids = Array.from(selectedTasks)
    setLocalTasks(prev => prev.filter(t => !ids.includes(t.id)))
    setSelectedTasks(new Set())
    try { await supabase.from('tasks').delete().in('id', ids) } catch (e) {}
  }

  const groupedTasks = [
    { name: 'OPEN', color: 'bg-zinc-200 text-zinc-700', data: localTasks.filter((t: any) => t.status === 'Open') },
    { name: 'IN PROGRESS', color: 'bg-blue-100 text-blue-700', data: localTasks.filter((t: any) => t.status === 'In-Progress') },
    { name: 'WAITING ON REVIEW', color: 'bg-amber-100 text-amber-700', data: localTasks.filter((t: any) => t.status === 'Waiting for Review') },
    { name: 'REVISION', color: 'bg-red-100 text-red-700', data: localTasks.filter((t: any) => t.status === 'Revision') },
    { name: 'APPROVED', color: 'bg-emerald-100 text-emerald-700', data: localTasks.filter((t: any) => t.status === 'Completed') },
  ]

  return (
    <div className="space-y-6 w-full relative">
      
      {(editingCell || activeDropdown) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setEditingCell(null); setActiveDropdown(null); }} />
      )}

      {/* HEADER BREADCRUMB ALA CLICKUP */}
      <div className="border-b border-zinc-200 pb-2 relative z-10 -mx-6 px-6 -mt-6 pt-6">
        
        {/* Navigasi Breadcrumb Minimalis */}
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 font-medium mb-4">
          
          <Link href={`/dashboard/spaces/${localProject?.workspace_id || ''}`} className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-md">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Workspace
          </Link>

          <span className="text-zinc-300">/</span>

          {/* Ikon Kategori + Edit Nama Project */}
          <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-md relative group/proj">
            <div className="text-zinc-400" title={`Kategori: ${localProject?.category || 'General'}`}>
              <ProjectCategoryIcon category={localProject?.category} />
            </div>

            {editingCell?.id === 'project' && editingCell.field === 'name' ? (
              <input 
                autoFocus className="font-bold text-zinc-900 border-b border-indigo-400 outline-none bg-transparent w-48"
                defaultValue={localProject?.name}
                onBlur={(e) => { if (e.target.value && e.target.value !== localProject.name) handleUpdateProject('name', e.target.value); else setEditingCell(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
              />
            ) : (
              <span onClick={() => setEditingCell({ id: 'project', field: 'name' })} className="font-bold text-zinc-800 cursor-pointer hover:text-indigo-600 transition-colors" title="Edit Nama Project">
                {localProject?.name || 'Project Name'}
              </span>
            )}
            
            {/* Tombol panah bawah untuk ganti kategori */}
            <button onClick={() => setEditingCell({ id: 'project', field: 'category' })} className="opacity-0 group-hover/proj:opacity-100 text-zinc-400 hover:text-zinc-800 ml-1 transition-opacity">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
            </button>

            {/* Dropdown Kategori Project */}
            {editingCell?.id === 'project' && editingCell.field === 'category' && (
              <div className="absolute top-full mt-1 left-0 w-48 bg-white border border-zinc-200 shadow-xl rounded-xl py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100" onClick={(e) => e.stopPropagation()}>
                {['General', 'Corporate Planning', 'Digitalisasi'].map(opt => (
                  <button type="button" key={opt} className="text-left px-3 py-1.5 hover:bg-zinc-50 text-xs flex gap-2 items-center text-zinc-700 transition-colors w-full" onClick={(e) => { e.stopPropagation(); handleUpdateProject('category', opt); }}>
                    <ProjectCategoryIcon category={opt} className="w-3.5 h-3.5 text-indigo-500" />
                    <span className={localProject?.category === opt ? 'font-bold text-indigo-700' : ''}>{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TABS NAVBAR */}
        <div className="flex gap-6 text-sm font-medium">
          {['Overview', 'List', 'Board', 'Gantt'].map((tab) => (
            <button
              key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 w-full">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* AREA DESKRIPSI PINDAH KE OVERVIEW */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative group">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Deskripsi Proyek</h3>
              {editingCell?.id === 'project' && editingCell.field === 'description' ? (
                <textarea 
                  autoFocus className="w-full text-sm text-zinc-800 bg-white border border-indigo-400 rounded-lg p-3 outline-none shadow-sm min-h-[100px]"
                  defaultValue={localProject?.description}
                  onBlur={(e) => { handleUpdateProject('description', e.target.value); setEditingCell(null) }}
                />
              ) : (
                <div onClick={() => setEditingCell({ id: 'project', field: 'description' })} className="text-sm text-zinc-700 cursor-pointer hover:bg-zinc-100 -m-3 p-3 rounded-lg transition-colors whitespace-pre-wrap min-h-[60px]" title="Edit Deskripsi">
                  {localProject?.description || <span className="italic text-zinc-400">Belum ada deskripsi. Klik untuk menambahkan.</span>}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-sm bg-white">
              Silakan pindah ke Tab List untuk melihat tugas.
            </div>
          </div>
        )}

        {/* --- TAB 2: LIST --- */}
        {activeTab === 'list' && (
          <div className="space-y-8 pb-32 mt-4">
            {groupedTasks
              .filter(group => group.name === 'OPEN' || group.data.length > 0)
              .map((group) => (
              <div key={group.name} className="flex flex-col relative" style={{ zIndex: group.data.some(t => editingCell?.id === t.id || activeDropdown?.id === t.id) ? 40 : 1 }}>
                
                <div className="group/header flex items-center gap-3 py-2 mb-1">
                  <button className="text-zinc-400 hover:text-zinc-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider ${group.color}`}>{group.name}</span>
                  <span className="text-xs text-zinc-400 font-medium">{group.data.length}</span>
                  <button onClick={() => setIsTaskModalOpen(true)} className="opacity-0 group-hover/header:opacity-100 text-zinc-400 hover:text-indigo-600 transition-opacity ml-1 p-0.5 rounded hover:bg-zinc-200" title="Add Task"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg></button>
                </div>

                <div className="w-full">
                  
                  <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider items-center">
                    <div className="col-span-5 pl-11">Name</div>
                    <div className="col-span-2 text-center">Assignee</div>
                    <div className="col-span-2 text-center">Due date</div>
                    <div className="col-span-1 text-center">Priority</div>
                    <div className="col-span-1 text-center">Dokumen</div>
                    <div className="col-span-1"></div>
                  </div>

                  {group.data.length === 0 ? (
                    <div className="flex items-center gap-3 py-2.5 pl-11 border-b border-zinc-100">
                      <span className="w-4 h-4 border border-dashed border-zinc-300 rounded-sm"></span>
                      <span className="text-sm text-zinc-400 italic">Tidak ada task</span>
                    </div>
                  ) : (
                    group.data.map((task: any) => {
                      const isSelected = selectedTasks.has(task.id)
                      const isEditing = editingCell?.id === task.id
                      const isDropdownOpen = activeDropdown?.id === task.id
                      
                      return (
                        <div key={task.id} className={`relative grid grid-cols-12 gap-4 items-center border-b border-zinc-100 py-1.5 transition-colors group/row ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-zinc-50'}`} style={{ zIndex: isEditing || isDropdownOpen ? 50 : 1 }}>
                          
                          <div className="col-span-5 pl-3 flex items-center gap-2 text-sm font-medium text-zinc-800 h-full">
                            <div className="w-6 flex justify-center shrink-0">
                              <input type="checkbox" checked={isSelected} onChange={() => toggleTaskSelection(task.id)} className={`w-4 h-4 cursor-pointer accent-indigo-600 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'}`} />
                            </div>
                            
                            <div className="relative shrink-0 flex items-center justify-center">
                              <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'status' }); }} className="cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center p-0.5">
                                <StatusIcon status={task.status} />
                              </div>

                              {isEditing && editingCell.field === 'status' && (
                                <div className="absolute top-full mt-2 left-0 w-64 bg-zinc-800 border border-zinc-700 shadow-2xl rounded-xl py-3 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100" onClick={(e) => e.stopPropagation()}>
                                  <div className="px-4 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Not Started</div>
                                  <button type="button" className="text-left px-5 py-2.5 hover:bg-zinc-700/50 flex items-center gap-3 w-full transition-colors" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'status', 'Open'); }}>
                                    <StatusIcon status="Open" className="w-5 h-5" /> <span className="text-zinc-300 text-sm font-medium">OPEN</span>
                                  </button>
                                  <div className="px-4 py-1 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active</div>
                                  {['In-Progress', 'Waiting for Review', 'Revision'].map(opt => (
                                    <button type="button" key={opt} className="text-left px-5 py-2.5 hover:bg-zinc-700/50 flex items-center gap-3 w-full transition-colors" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'status', opt); }}>
                                      <StatusIcon status={opt} className="w-5 h-5" /> <span className="text-zinc-300 text-sm font-medium">{opt.toUpperCase()}</span>
                                    </button>
                                  ))}
                                  <div className="px-4 py-1 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Done</div>
                                  <button type="button" className="text-left px-5 py-2.5 hover:bg-zinc-700/50 flex items-center gap-3 w-full transition-colors" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'status', 'Completed'); }}>
                                    <StatusIcon status="Completed" className="w-5 h-5" /> <span className="text-zinc-300 text-sm font-medium">APPROVED</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditing && editingCell.field === 'title' ? (
                              <input 
                                autoFocus className="w-full text-sm border border-indigo-400 rounded px-1.5 py-0.5 outline-none shadow-sm" defaultValue={task.title}
                                onBlur={(e) => { if (e.target.value && e.target.value !== task.title) handleUpdateTask(task.id, 'title', e.target.value); else setEditingCell(null) }}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                              />
                            ) : (
                              <span onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'title' }); }} className="truncate hover:text-indigo-600 cursor-pointer px-1.5 py-1 -ml-1.5 rounded hover:bg-zinc-200/50 transition-colors flex-1 ml-1">
                                {task.title}
                              </span>
                            )}
                          </div>
                          
                          <div className="col-span-2 flex items-center justify-center relative h-full">
                            <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'assignee' }); }} className="cursor-pointer px-2 py-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center w-full max-w-[120px] h-full">
                              {task.assignee_id ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">{(task.assignee_id || 'U').substring(0, 1).toUpperCase()}</div>
                                  <span className="text-xs text-zinc-600 truncate">User</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 hover:text-indigo-600"><svg className="w-3.5 h-3.5 border border-dashed border-zinc-400 rounded-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Assign</span>
                              )}
                            </div>

                            {isEditing && editingCell.field === 'assignee' && (
                              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-48 bg-white border border-zinc-200 shadow-xl rounded-lg py-1 text-sm z-50 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                                <button type="button" className="w-full text-left px-3 py-2 hover:bg-zinc-50 text-xs text-zinc-600 border-b border-zinc-100" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'assignee_id', null); }}>Unassigned</button>
                                {members?.map((m: any) => (
                                  <button type="button" key={m.user_id} className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 flex items-center gap-2 text-xs font-medium" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'assignee_id', m.user_id); }}>
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">{(m.user_id || 'U').substring(0,1).toUpperCase()}</div> User {m.user_id.substring(0,4)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="col-span-2 flex items-center justify-center relative h-full">
                            {isEditing && editingCell.field === 'dueDate' ? (
                              <input 
                                type="date" autoFocus className="absolute z-50 border border-indigo-400 rounded shadow-lg bg-white px-2 py-1 text-xs outline-none"
                                defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                                onChange={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'due_date', e.target.value || null); }}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'dueDate' }); }} className={`cursor-pointer px-2 py-1 rounded hover:bg-zinc-200/50 transition-colors text-xs text-center w-full max-w-[100px] h-full flex items-center justify-center ${!task.due_date || new Date(task.due_date) < new Date() ? 'text-red-500 font-medium' : 'text-zinc-600'}`}>
                                {formatClickUpDate(task.due_date)}
                              </div>
                            )}
                          </div>

                          <div className="col-span-1 flex items-center justify-center relative h-full">
                            <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'priority' }); }} className="cursor-pointer p-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center w-full h-full">
                              <svg className={`w-4 h-4 ${task.priority === 'High' ? 'text-amber-500' : task.priority === 'Urgent' ? 'text-red-500' : 'text-zinc-300'} hover:opacity-75 transition-colors`} fill={task.priority === 'High' || task.priority === 'Urgent' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" title={`Priority: ${task.priority || 'Normal'}`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                            </div>

                            {isEditing && editingCell.field === 'priority' && (
                              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-28 bg-white border border-zinc-200 shadow-xl rounded-lg py-1 flex flex-col z-50 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                                {['Normal', 'High', 'Urgent'].map(p => (
                                  <button type="button" key={p} className="text-left px-3 py-1.5 hover:bg-zinc-50 text-xs flex gap-2 items-center" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, 'priority', p); }}>
                                    <svg className={`w-3 h-3 ${p === 'High' ? 'text-amber-500' : p === 'Urgent' ? 'text-red-500' : 'text-zinc-400'}`} fill={p !== 'Normal' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                                    <span className={p === 'Urgent' ? 'text-red-600 font-medium' : p === 'High' ? 'text-amber-600 font-medium' : 'text-zinc-600'}>{p}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="col-span-1 flex items-center justify-center relative h-full">
                            {task.document_url ? (
                              <div className="flex items-center gap-1.5 group/doc h-full justify-center">
                                <a href={task.document_url} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center" title="Buka Dokumen">
                                  <DocumentIcon url={task.document_url} className="w-4 h-4" />
                                </a>
                                <button onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'document' }); }} className="text-zinc-400 hover:text-zinc-700 opacity-0 group-hover/doc:opacity-100 flex items-center justify-center p-1 rounded hover:bg-zinc-200/50" title="Edit Link">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </button>
                              </div>
                            ) : (
                              <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'document' }); }} className="cursor-pointer p-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center w-full h-full">
                                <DocumentIcon url="" className="w-4 h-4 text-zinc-300 hover:text-zinc-500" />
                              </div>
                            )}

                            {isEditing && editingCell.field === 'document' && (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const val = new FormData(e.currentTarget).get('docUrl') as string;
                                  handleUpdateTask(task.id, 'document_url', val || null);
                                }}
                                className="absolute top-full right-0 mt-1 w-64 bg-white border border-zinc-200 shadow-xl rounded-lg p-2 flex gap-2 z-50 animate-in zoom-in-95 duration-100" 
                                onClick={e => e.stopPropagation()}
                              >
                                <input name="docUrl" type="url" placeholder="Paste Link URL..." autoFocus defaultValue={task.document_url || ''} className="flex-1 text-xs border border-zinc-200 rounded px-2 py-1.5 outline-none focus:border-indigo-500" />
                                <button type="submit" className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-colors">Save</button>
                              </form>
                            )}
                          </div>
                          
                          <div className="col-span-1 flex items-center justify-end pr-4 relative h-full">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveDropdown(isDropdownOpen ? null : { id: task.id, type: 'row' }); }}
                              className={`text-zinc-400 hover:text-zinc-800 p-1.5 rounded-md transition-all flex items-center justify-center ${isDropdownOpen ? 'opacity-100 bg-zinc-200' : 'opacity-0 group-hover/row:opacity-100 hover:bg-zinc-200'}`}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12a2 2 0 11-4 0 2 2 0 014 0zM14 12a2 2 0 11-4 0 2 2 0 014 0zM23 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            </button>
                            {isDropdownOpen && (
                              <div className="absolute top-full right-4 mt-1 w-32 bg-white border border-zinc-200 shadow-xl rounded-lg py-1 flex flex-col z-50 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Delete Task</button>
                              </div>
                            )}
                          </div>

                        </div>
                      )
                    })
                  )}

                  <div className="py-2 pl-11">
                    <button onClick={() => setIsTaskModalOpen(true)} className="text-[13px] text-zinc-400 hover:text-zinc-700 flex items-center gap-2 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> Add Task
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MULTIPLE CHOICE TOOLBAR */}
      {selectedTasks.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white rounded-lg shadow-2xl px-5 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 border-r border-zinc-700 pr-5">
            <span className="text-sm font-semibold">{selectedTasks.size} Tasks selected</span>
            <button onClick={clearSelection} className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded transition-colors" title="Batal Pilih">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-5 text-xs font-medium">
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown?.type === 'bulk_status' ? null : { id: 'bulk', type: 'bulk_status' }); }} className="flex items-center gap-1.5 text-zinc-300 hover:text-indigo-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Status</button>
              {activeDropdown?.type === 'bulk_status' && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 shadow-xl rounded-xl py-2 flex flex-col z-[60]" onClick={e => e.stopPropagation()}>
                  {['Open', 'In-Progress', 'Waiting for Review', 'Revision', 'Completed'].map(opt => (
                    <button type="button" key={opt} className="text-left px-4 py-2 hover:bg-zinc-700/50 text-sm flex gap-3 items-center text-zinc-300" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), 'status', opt); }}>
                      <StatusIcon status={opt} className="w-5 h-5" /> <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown?.type === 'bulk_assignee' ? null : { id: 'bulk', type: 'bulk_assignee' }); }} className="flex items-center gap-1.5 text-zinc-300 hover:text-indigo-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Assignees</button>
              {activeDropdown?.type === 'bulk_assignee' && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 shadow-xl rounded-xl py-2 flex flex-col z-[60]" onClick={e => e.stopPropagation()}>
                  <button type="button" className="text-left px-4 py-2 hover:bg-zinc-700/50 text-xs text-zinc-400 border-b border-zinc-700 mb-1" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), 'assignee_id', null); }}>Unassigned</button>
                  {members?.map((m: any) => (
                    <button type="button" key={m.user_id} className="text-left px-4 py-2 hover:bg-zinc-700/50 flex items-center gap-3 text-xs font-medium text-zinc-300" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), 'assignee_id', m.user_id); }}>
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">{(m.user_id || 'U').substring(0,1).toUpperCase()}</div> User {m.user_id.substring(0,4)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown?.type === 'bulk_dates' ? null : { id: 'bulk', type: 'bulk_dates' }); }} className="flex items-center gap-1.5 text-zinc-300 hover:text-indigo-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Dates</button>
              {activeDropdown?.type === 'bulk_dates' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = new FormData(e.currentTarget).get('bulkDate') as string;
                    handleUpdateTask(Array.from(selectedTasks), 'due_date', val || null);
                  }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 shadow-xl rounded-xl p-2.5 z-[60] flex gap-2" 
                  onClick={e => e.stopPropagation()}
                >
                  <input name="bulkDate" type="date" className="text-xs border-none rounded px-2 py-1.5 outline-none bg-zinc-700 text-white" />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-3 rounded font-bold transition-colors">Apply</button>
                </form>
              )}
            </div>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown?.type === 'bulk_priority' ? null : { id: 'bulk', type: 'bulk_priority' }); }} className="flex items-center gap-1.5 text-zinc-300 hover:text-indigo-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg> Priority</button>
              {activeDropdown?.type === 'bulk_priority' && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-zinc-800 border border-zinc-700 shadow-xl rounded-xl py-2 flex flex-col z-[60]" onClick={e => e.stopPropagation()}>
                  {['Normal', 'High', 'Urgent'].map(p => (
                    <button type="button" key={p} className="text-left px-4 py-2 hover:bg-zinc-700/50 flex gap-3 items-center text-xs" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), 'priority', p); }}>
                      <svg className={`w-4 h-4 ${p === 'High' ? 'text-amber-500' : p === 'Urgent' ? 'text-red-500' : 'text-zinc-500'}`} fill={p !== 'Normal' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                      <span className={p === 'Urgent' ? 'text-red-400 font-medium' : p === 'High' ? 'text-amber-400 font-medium' : 'text-zinc-300'}>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); handleBulkDelete(); }} className="flex items-center gap-1.5 text-zinc-300 hover:text-red-400 transition-colors ml-2 border-l border-zinc-700 pl-4"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Delete</button>
          </div>
        </div>
      )}

      <CreateLinkModal projectId={project?.id} isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} />
      <CreateTaskModal projectId={project?.id} members={members} isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

    </div>
  )
}