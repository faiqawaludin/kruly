"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import CreateLinkModal from "./CreateLinkModal"
import CreateTaskModal from "./CreateTaskModal"
import EditProjectModal from "../../EditProjectModal"

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

const ProjectCategoryIcon = ({ category, className = "w-4 h-4" }: { category: string, className?: string }) => {
  const cat = (category || 'General').trim()
  if (cat === 'Corporate Planning') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  if (cat === 'Digitalisasi') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
}

export default function ProjectView({ project, tasks, links, members }: any) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('list') 
  
  // STATE MODAL
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false)
  
  // STATE MODAL APPROVE TASK BARU
  const [approveModalTask, setApproveModalTask] = useState<any>(null)

  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<{ id: string, type: string } | null>(null)
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const [localTasks, setLocalTasks] = useState<any[]>([])
  const [localProject, setLocalProject] = useState<any>(project || {})

  useEffect(() => { setIsMounted(true) }, [])

  // Sync data Prop ke State
  useEffect(() => {
    if (project) setLocalProject(project)
  }, [project?.id, project?.category, project?.name, project?.description, project?.year]) 

  useEffect(() => {
    if (tasks) setLocalTasks(tasks)
  }, [tasks])

  if (!isMounted) return <div className="p-10 flex justify-center text-zinc-400">Memuat antarmuka...</div>;

  const toggleTaskSelection = (taskId: string) => {
    const newSet = new Set(selectedTasks)
    if (newSet.has(taskId)) newSet.delete(taskId)
    else newSet.add(taskId)
    setSelectedTasks(newSet)
  }

  const clearSelection = () => setSelectedTasks(new Set())

  const handleUpdateTask = async (taskId: string | string[], updates: any) => {
    const idsToUpdate = Array.isArray(taskId) ? taskId : [taskId]
    
    // Perbarui UI seketika (Optimistic Update)
    setLocalTasks(prev => prev.map(t => idsToUpdate.includes(t.id) ? { ...t, ...updates } : t))
    setEditingCell(null)
    setActiveDropdown(null)
    
    try {
      // Kirim perubahan ke database
      await supabase.from('tasks').update(updates).in('id', idsToUpdate)
      router.refresh()
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Hapus task ini?')) return
    setLocalTasks(prev => prev.filter(t => t.id !== taskId))
    setActiveDropdown(null)
    try { 
      await supabase.from('tasks').delete().eq('id', taskId)
      router.refresh()
    } catch (e) {}
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus permanen ${selectedTasks.size} task yang dipilih?`)) return
    const ids = Array.from(selectedTasks)
    setLocalTasks(prev => prev.filter(t => !ids.includes(t.id)))
    setSelectedTasks(new Set())
    try { 
      await supabase.from('tasks').delete().in('id', ids)
      router.refresh() 
    } catch (e) {}
  }

  const groupedTasks = [
    { name: 'OPEN', color: 'bg-zinc-200 text-zinc-700', data: localTasks.filter((t: any) => t.status === 'Open') },
    { name: 'IN PROGRESS', color: 'bg-blue-100 text-blue-700', data: localTasks.filter((t: any) => t.status === 'In-Progress') },
    { name: 'WAITING ON REVIEW', color: 'bg-amber-100 text-amber-700', data: localTasks.filter((t: any) => t.status === 'Waiting for Review') },
    { name: 'REVISION', color: 'bg-red-100 text-red-700', data: localTasks.filter((t: any) => t.status === 'Revision') },
    { name: 'APPROVED', color: 'bg-emerald-100 text-emerald-700', data: localTasks.filter((t: any) => t.status === 'Completed') },
  ]

  const workspaceName = localProject?.workspaces?.name || 'Workspace'

  // Logika Kalkulasi Gantt
  const ganttTasks = localTasks.filter(t => t.due_date);
  let minTime = new Date().getTime();
  let maxTime = new Date().getTime();

  if (ganttTasks.length > 0) {
    minTime = Math.min(...ganttTasks.map(t => new Date(t.created_at || new Date()).getTime()));
    maxTime = Math.max(...ganttTasks.map(t => new Date(t.due_date).getTime()));
  }

  const PADDING_DAYS_START = 3;
  const PADDING_DAYS_END = 7;
  const startDate = new Date(minTime);
  startDate.setDate(startDate.getDate() - PADDING_DAYS_START);
  const endDate = new Date(maxTime);
  endDate.setDate(endDate.getDate() + PADDING_DAYS_END);

  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysArray = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6 w-full relative">
      
      {(editingCell || activeDropdown || isProjectDropdownOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setEditingCell(null); setActiveDropdown(null); setIsProjectDropdownOpen(false); }} />
      )}

      {/* HEADER BREADCRUMB */}
      <div className="border-b border-zinc-200 pb-2 relative z-10 -mx-6 px-6 -mt-6 pt-6 bg-white">
        
        <div className="flex items-center gap-2 text-[14px] font-medium mb-6">
          <Link href={`/dashboard/spaces/${localProject?.workspace_id || ''}`} className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors px-2 py-1 rounded-md hover:bg-zinc-100">
            <div className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              {workspaceName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[150px]">{workspaceName}</span>
          </Link>
          <span className="text-zinc-300">/</span>

          <div className="flex items-center px-2 py-1 relative">
            <div className="text-zinc-500 mr-2" title={`Kategori: ${localProject?.category || 'General'}`}>
              <ProjectCategoryIcon category={localProject?.category} />
            </div>
            <span className="font-bold text-lg text-zinc-900">{localProject?.name || 'Project Name'}</span>
            
            <div className="relative ml-2">
              <button onClick={(e) => { e.stopPropagation(); setIsProjectDropdownOpen(!isProjectDropdownOpen) }} className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12a2 2 0 11-4 0 2 2 0 014 0zM14 12a2 2 0 11-4 0 2 2 0 014 0zM23 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </button>
              {isProjectDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-zinc-200 shadow-xl rounded-xl py-1.5 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setIsEditProjectModalOpen(true); setIsProjectDropdownOpen(false); }} className="text-left px-4 py-2 hover:bg-zinc-50 text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Edit Proyek
                  </button>
                </div>
              )}
            </div>
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
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Deskripsi Proyek</h3>
              <div className="text-sm text-zinc-700 whitespace-pre-wrap">
                {localProject?.description || <span className="italic text-zinc-400">Belum ada deskripsi. Gunakan tombol edit (3 titik) di atas untuk menambahkan.</span>}
              </div>
            </div>
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-sm bg-white">
              Silakan pindah ke Tab List untuk melihat tugas.
            </div>
          </div>
        )}

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

                  {group.data.map((task: any) => {
                    const isSelected = selectedTasks.has(task.id)
                    const isEditing = !!(editingCell && editingCell.id === task.id)
                    const isDropdownOpen = !!(activeDropdown && activeDropdown.id === task.id)
                    
                    let dueDateColorClass = "text-zinc-600";
                    if (task.status === 'Completed') {
                      dueDateColorClass = "text-zinc-400 line-through opacity-80 font-medium";
                    } else if (!task.due_date) {
                      dueDateColorClass = "text-red-500 font-medium";
                    } else {
                      const today = new Date(); today.setHours(0,0,0,0);
                      const due = new Date(task.due_date); due.setHours(0,0,0,0);
                      
                      if (due < today) dueDateColorClass = "text-red-600 font-bold";
                      else if (due.getTime() === today.getTime()) dueDateColorClass = "text-amber-500 font-bold";
                    }

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

                            {isEditing && editingCell?.field === 'status' && (
                              <div className="absolute top-full mt-2 left-0 w-64 bg-zinc-800 border border-zinc-700 shadow-2xl rounded-xl py-3 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100" onClick={(e) => e.stopPropagation()}>
                                <div className="px-4 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Not Started</div>
                                <button type="button" className="text-left px-5 py-2.5 hover:bg-zinc-700/50 flex items-center gap-3 w-full transition-colors" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { status: 'Open' }); }}>
                                  <StatusIcon status="Open" className="w-5 h-5" /> <span className="text-zinc-300 text-sm font-medium">OPEN</span>
                                </button>
                                <div className="px-4 py-1 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active</div>
                                {['In-Progress', 'Waiting for Review', 'Revision'].map(opt => (
                                  <button type="button" key={opt} className="text-left px-5 py-2.5 hover:bg-zinc-700/50 flex items-center gap-3 w-full transition-colors" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { status: opt }); }}>
                                    <StatusIcon status={opt} className="w-5 h-5" /> <span className="text-zinc-300 text-sm font-medium">{opt.toUpperCase()}</span>
                                  </button>
                                ))}
                                <div className="px-4 py-1 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Done</div>
                                <button type="button" className="text-left px-5 py-2.5 hover:bg-zinc-700/50 flex items-center gap-3 w-full transition-colors" onClick={(e) => { e.stopPropagation(); setEditingCell(null); setApproveModalTask(task); }}>
                                  <StatusIcon status="Completed" className="w-5 h-5" /> <span className="text-emerald-400 font-bold text-sm">APPROVED</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing && editingCell?.field === 'title' ? (
                            <input 
                              autoFocus className="w-full text-sm border border-indigo-400 rounded px-1.5 py-0.5 outline-none shadow-sm" defaultValue={task.title}
                              onBlur={(e) => { if (e.target.value && e.target.value !== task.title) handleUpdateTask(task.id, { title: e.target.value }); else setEditingCell(null) }}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                            />
                          ) : (
                            <span onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'title' }); }} className={`truncate hover:text-indigo-600 cursor-pointer px-1.5 py-1 -ml-1.5 rounded hover:bg-zinc-200/50 transition-colors flex-1 ml-1 ${task.status === 'Completed' ? 'text-zinc-500 line-through' : ''}`}>
                              {task.title}
                            </span>
                          )}
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center relative h-full">
                          <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'assignee' }); }} className="cursor-pointer px-2 py-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center w-full max-w-[120px] h-full">
                            {task.assignee_id ? (
                              <div className="flex items-center gap-2 overflow-hidden">
                                {(() => {
                                  const assignee = members?.find((m: any) => m.user_id === task.assignee_id);
                                  const assigneeName = assignee?.full_name || 'User';
                                  const avatarUrl = assignee?.avatar_url;
                                  
                                  return (
                                    <>
                                      {avatarUrl ? (
                                         <img src={avatarUrl} className="w-5 h-5 rounded-full object-cover shrink-0" alt="Avatar" />
                                      ) : (
                                         <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                           {assigneeName.substring(0, 1).toUpperCase()}
                                         </div>
                                      )}
                                      <span className={`text-xs truncate ${task.status === 'Completed' ? 'text-zinc-400' : 'text-zinc-600'}`}>{assigneeName}</span>
                                    </>
                                  )
                                })()}
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 hover:text-indigo-600"><svg className="w-3.5 h-3.5 border border-dashed border-zinc-400 rounded-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Assign</span>
                            )}
                          </div>

                          {isEditing && editingCell?.field === 'assignee' && (
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-48 bg-white border border-zinc-200 shadow-xl rounded-lg py-1 text-sm z-50 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                              <button type="button" className="w-full text-left px-3 py-2 hover:bg-zinc-50 text-xs text-zinc-600 border-b border-zinc-100" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { assignee_id: null }); }}>Unassigned</button>
                              {members?.map((m: any) => (
                                <button type="button" key={m.user_id} className="text-left px-3 py-1.5 hover:bg-zinc-50 flex items-center gap-2 text-xs font-medium w-full" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { assignee_id: m.user_id }); }}>
                                  {m.avatar_url ? (
                                    <img src={m.avatar_url} className="w-5 h-5 rounded-full object-cover shrink-0" alt="Avatar" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                      {(m.full_name || 'U').substring(0,1).toUpperCase()}
                                    </div>
                                  )}
                                  {m.full_name || `User ${m.user_id.substring(0,4)}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center relative h-full">
                          {isEditing && editingCell?.field === 'dueDate' ? (
                            <input 
                              type="date" autoFocus className="absolute z-50 border border-indigo-400 rounded shadow-lg bg-white px-2 py-1 text-xs outline-none"
                              defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                              onChange={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { due_date: e.target.value || null }); }}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'dueDate' }); }} className={`cursor-pointer px-2 py-1 rounded hover:bg-zinc-200/50 transition-colors text-xs text-center w-full max-w-[100px] h-full flex items-center justify-center ${dueDateColorClass}`}>
                              {formatClickUpDate(task.due_date)}
                            </div>
                          )}
                        </div>

                        <div className="col-span-1 flex items-center justify-center relative h-full">
                          <div onClick={(e) => { e.stopPropagation(); setEditingCell({ id: task.id, field: 'priority' }); }} className="cursor-pointer p-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center w-full h-full">
                            {/* Memperbaiki Type Error SVG title dengan memberikan elemen span sebagai wrapper title jika diperlukan, atau menghapusnya jika tdk penting */}
                            <svg className={`w-4 h-4 ${task.priority === 'High' ? 'text-amber-500' : task.priority === 'Urgent' ? 'text-red-500' : 'text-zinc-300'} hover:opacity-75 transition-colors ${task.status === 'Completed' ? 'opacity-40 grayscale' : ''}`} fill={task.priority === 'High' || task.priority === 'Urgent' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                              <title>Priority: {task.priority || 'Normal'}</title>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
                            </svg>
                          </div>

                          {isEditing && editingCell?.field === 'priority' && (
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-28 bg-white border border-zinc-200 shadow-xl rounded-lg py-1 flex flex-col z-50 animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                              {['Normal', 'High', 'Urgent'].map(p => (
                                <button type="button" key={p} className="text-left px-3 py-1.5 hover:bg-zinc-50 text-xs flex gap-2 items-center" onClick={(e) => { e.stopPropagation(); handleUpdateTask(task.id, { priority: p }); }}>
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
                              <a href={task.document_url} target="_blank" rel="noreferrer" className={`p-1 rounded hover:bg-zinc-200/50 transition-colors flex items-center justify-center ${task.status === 'Completed' ? 'opacity-50 grayscale' : ''}`} title="Buka Dokumen">
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

                          {isEditing && editingCell?.field === 'document' && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const val = new FormData(e.currentTarget).get('docUrl') as string;
                                handleUpdateTask(task.id, { document_url: val || null });
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
                  })}

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

        {activeTab === 'board' && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 mt-4">
            <svg className="w-10 h-10 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            <h3 className="text-sm font-bold text-zinc-600">Kanban Board</h3>
            <p className="text-xs text-zinc-400 mt-1">Tampilan Board sedang dalam tahap pengembangan.</p>
          </div>
        )}

        {activeTab === 'gantt' && (
          <div className="mt-4 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-sm font-bold text-zinc-800">Gantt Chart Timeline</h3>
              
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500"></div> In Progress</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500"></div> Review</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div> Completed</span>
              </div>
            </div>

            {ganttTasks.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-zinc-700">Belum Ada Timeline</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Tambahkan "Due Date" (Batas Waktu) pada task di tab List agar otomatis muncul di diagram Gantt ini.</p>
              </div>
            ) : (
              <div className="flex w-full overflow-x-auto custom-scrollbar relative">
                
                <div className="w-64 shrink-0 border-r border-zinc-200 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="h-14 border-b border-zinc-200 flex items-center px-4 text-[10px] font-bold tracking-wider text-zinc-400 uppercase bg-zinc-50/80">
                    Nama Task
                  </div>
                  <div className="flex flex-col">
                    {ganttTasks.map((task: any) => (
                      <div key={`title-${task.id}`} className="h-12 border-b border-zinc-100 flex items-center px-4 text-sm font-medium text-zinc-700 hover:text-indigo-600 hover:bg-zinc-50 transition-colors">
                        <span className="truncate" title={task.title}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col relative" style={{ width: `${totalDays * 45}px`, minWidth: '600px' }}>
                  
                  <div className="h-14 border-b border-zinc-200 bg-zinc-50/80 flex relative">
                    {daysArray.map((d, i) => {
                      const isToday = new Date().toDateString() === d.toDateString();
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-center border-r border-zinc-200/50 relative">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className={`text-[13px] font-bold mt-0.5 ${isToday ? 'text-white bg-indigo-600 w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : 'text-zinc-700'}`}>
                            {d.getDate()}
                          </span>
                          {isToday && <div className="absolute top-14 left-1/2 w-0.5 h-[1000px] bg-indigo-500/30 z-0 -translate-x-1/2"></div>}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-col relative bg-zinc-50/30 pb-4">
                    {ganttTasks.map((task: any) => {
                      const taskStart = new Date(task.created_at || task.due_date).getTime();
                      const taskEnd = new Date(task.due_date).getTime();
                      
                      const totalSpanMs = endDate.getTime() - startDate.getTime();
                      let leftPercent = ((taskStart - startDate.getTime()) / totalSpanMs) * 100;
                      let widthPercent = ((taskEnd - taskStart) / totalSpanMs) * 100;

                      if (widthPercent < (100 / totalDays)) widthPercent = 100 / totalDays; 
                      if (leftPercent < 0) leftPercent = 0;
                      if (leftPercent + widthPercent > 100) widthPercent = 100 - leftPercent;

                      let barColor = 'bg-zinc-400';
                      if (task.status === 'Completed') barColor = 'bg-emerald-500';
                      else if (task.status === 'In-Progress') barColor = 'bg-blue-500';
                      else if (task.status === 'Waiting for Review') barColor = 'bg-amber-500';
                      else if (task.status === 'Revision') barColor = 'bg-red-500';

                      return (
                        <div key={`bar-${task.id}`} className="h-12 border-b border-zinc-100/50 relative group">
                          <div className="absolute inset-0 flex">
                            {daysArray.map((_, i) => (<div key={i} className="flex-1 border-r border-zinc-200/30"></div>))}
                          </div>
                          <div 
                            className={`absolute top-2 h-8 rounded-md shadow-sm ${barColor} hover:opacity-80 transition-all cursor-pointer flex items-center px-2 z-10 ${task.status === 'Completed' ? 'opacity-60' : ''}`}
                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                            title={`${task.title}\nStatus: ${task.status}\nDue Date: ${new Date(task.due_date).toLocaleDateString()}`}
                          >
                            <span className="text-[10px] font-bold text-white truncate drop-shadow-sm">{task.title}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                  {['Open', 'In-Progress', 'Waiting for Review', 'Revision'].map(opt => (
                    <button type="button" key={opt} className="text-left px-4 py-2 hover:bg-zinc-700/50 text-sm flex gap-3 items-center text-zinc-300" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), { status: opt }); }}>
                      <StatusIcon status={opt} className="w-5 h-5" /> <span>{opt}</span>
                    </button>
                  ))}
                  <button type="button" className="text-left px-4 py-2 hover:bg-zinc-700/50 text-sm flex gap-3 items-center text-emerald-400 font-bold border-t border-zinc-700 mt-1 pt-3" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setApproveModalTask(Array.from(selectedTasks)); }}>
                    <StatusIcon status="Completed" className="w-5 h-5" /> <span>APPROVED</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown?.type === 'bulk_assignee' ? null : { id: 'bulk', type: 'bulk_assignee' }); }} className="flex items-center gap-1.5 text-zinc-300 hover:text-indigo-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Assignees</button>
              {activeDropdown?.type === 'bulk_assignee' && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-zinc-800 border border-zinc-700 shadow-xl rounded-xl py-2 flex flex-col z-[60]" onClick={e => e.stopPropagation()}>
                  <button type="button" className="text-left px-4 py-2 hover:bg-zinc-700/50 text-xs text-zinc-400 border-b border-zinc-700 mb-1" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), { assignee_id: null }); }}>Unassigned</button>
                  {members?.map((m: any) => (
                    <button type="button" key={m.user_id} className="text-left px-3 py-1.5 hover:bg-zinc-700/50 flex items-center gap-2 text-xs font-medium w-full" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), { assignee_id: m.user_id }); }}>
                      {m.avatar_url ? (
                        <img src={m.avatar_url} className="w-5 h-5 rounded-full object-cover shrink-0" alt="Avatar" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">{(m.full_name || 'U').substring(0,1).toUpperCase()}</div>
                      )}
                      {m.full_name || `User ${m.user_id.substring(0,4)}`}
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
                    handleUpdateTask(Array.from(selectedTasks), { due_date: val || null });
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
                    <button type="button" key={p} className="text-left px-4 py-2 hover:bg-zinc-700/50 flex gap-3 items-center text-xs" onClick={(e) => { e.stopPropagation(); handleUpdateTask(Array.from(selectedTasks), { priority: p }); }}>
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

      {approveModalTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setApproveModalTask(null)}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              let dateVal = new FormData(e.currentTarget).get('approveDate') as string;
              if (dateVal) {
                const dt = new Date(dateVal);
                dt.setHours(23, 59, 59);
                dateVal = dt.toISOString();
              } else {
                dateVal = new Date().toISOString();
              }
              
              const isBulk = Array.isArray(approveModalTask);
              const taskIds = isBulk ? approveModalTask : approveModalTask.id;
              
              handleUpdateTask(taskIds, { 
                status: 'Completed', 
                completed_at: dateVal 
              });
              
              setApproveModalTask(null);
            }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-zinc-100 bg-emerald-50/50 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
               </div>
               <div>
                 <h3 className="text-sm font-bold text-zinc-900">Approve Task</h3>
                 <p className="text-xs text-zinc-500">Tentukan kapan tugas ini diselesaikan.</p>
               </div>
            </div>
            
            <div className="p-6">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide mb-2 block">Tanggal Approve (Penyelesaian)</label>
              <input 
                name="approveDate" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split('T')[0]} 
                className="w-full h-10 border border-zinc-300 rounded-md px-3 text-sm focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer" 
              />
              <p className="text-[10px] text-zinc-400 mt-2 italic">Tanggal ini akan digunakan untuk menghitung performa SLA (On Time / Overdue) di Dashboard.</p>
            </div>
            
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button type="button" onClick={() => setApproveModalTask(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
              <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm">Simpan & Approve</button>
            </div>
          </form>
        </div>
      )}

      <CreateLinkModal projectId={localProject?.id} isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} />
      <CreateTaskModal projectId={localProject?.id} members={members} isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <EditProjectModal project={localProject} isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} />

    </div>
  )
}