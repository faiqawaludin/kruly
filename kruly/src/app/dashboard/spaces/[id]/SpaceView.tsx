"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const DocumentIcon = ({ url, className = "w-4 h-4" }: { url: string, className?: string }) => {
  if (!url) return <svg className={`${className} text-zinc-300 hover:text-zinc-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>;
  const lower = url.toLowerCase()
  if (lower.includes('docs.google.com/spreadsheets')) return <svg className={`${className} text-emerald-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V8h4v2zm3 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm-2-5V3.5L18.5 9H13z"/></svg>;
  if (lower.includes('docs.google.com/presentation')) return <svg className={`${className} text-amber-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>;
  if (lower.includes('docs.google.com/document')) return <svg className={`${className} text-blue-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
  return <svg className={`${className} text-indigo-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>;
}

export default function SpaceView({ workspace = {}, projects = [], tasks = [], members = [] }: any) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') 
  
  // 🔴 FIX: State untuk menyimpan nama asli yang di-fetch manual
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({})
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { 
    setIsMounted(true) 
    
    // 🔴 FIX: Pelacak Nama Absolut (Bypass prop yang kosong)
    const fetchRealNames = async () => {
      // Kumpulkan ID user unik dari daftar tugas
      const uniqueIds = Array.from(new Set(tasks.map((t:any) => t.assignee_id).filter(Boolean))) as string[]
      
      if (uniqueIds.length > 0) {
        // Tembak langsung ke tabel profiles
        const { data } = await supabase.from('profiles').select('id, full_name').in('id', uniqueIds)
        if (data) {
          const namesMap: Record<string, string> = {}
          data.forEach(d => { namesMap[d.id] = d.full_name })
          setAssigneeNames(namesMap) // Simpan ke state
        }
      }
    }
    
    fetchRealNames()
  }, [tasks])

  if (!isMounted) return <div className="p-10 flex justify-center text-zinc-400">Memuat antarmuka...</div>;

  const totalOpen = tasks.filter((t:any) => t.status === 'Open').length
  const totalInProgress = tasks.filter((t:any) => t.status === 'In-Progress').length
  const totalReview = tasks.filter((t:any) => t.status === 'Waiting for Review').length
  const totalRevision = tasks.filter((t:any) => t.status === 'Revision').length
  const totalCompleted = tasks.filter((t:any) => t.status === 'Completed').length

  const workloadMap: Record<string, { total: number, active: number }> = {}
  
  tasks.forEach((t:any) => {
    const assigneeId = t.assignee_id || 'unassigned'
    
    if (!workloadMap[assigneeId]) {
      workloadMap[assigneeId] = { total: 0, active: 0 }
    }
    
    workloadMap[assigneeId].total += 1
    if (t.status !== 'Completed') {
      workloadMap[assigneeId].active += 1
    }
  })

  // Mapping ke data Chart
  const workloadData = Object.keys(workloadMap)
    .filter(id => workloadMap[id].total > 0)
    .map(id => {
      let memberName = "Anggota"
      
      if (id === 'unassigned') {
        memberName = "Unassigned"
      } else {
        // 1. Cek dari hasil tembakan langsung ke database (Paling Akurat)
        if (assigneeNames[id]) {
          memberName = assigneeNames[id]
        } 
        // 2. Fallback ke prop members (jika database telat merespons)
        else {
          const foundUser = members.find((m:any) => m.user_id === id || m.id === id)
          if (foundUser) {
            memberName = foundUser.full_name || foundUser.profiles?.full_name || foundUser.users?.full_name || "Anggota"
          }
        }
      }

      return {
        name: memberName,
        active: workloadMap[id].active,
        total: workloadMap[id].total
      }
    })
    .sort((a, b) => b.active - a.active)
    .slice(0, 5)

  const recentTasks = [...tasks].sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  const allLinks = tasks
    .filter((t:any) => t.document_url)
    .map((t:any) => ({
      id: t.id,
      title: t.title,
      url: t.document_url,
      project_name: projects.find((p:any) => p.id === t.project_id)?.name || 'Unknown Project',
      created_at: t.created_at
    }))
    .sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6 w-full relative">
      
      {/* HEADER BREADCRUMB */}
      <div className="border-b border-zinc-200 pb-2 relative z-10 -mx-6 px-6 -mt-6 pt-6 bg-white">
        <div className="flex items-center gap-2 text-[14px] font-medium mb-6">
          <div className="flex items-center px-2 py-1">
            <div className="w-6 h-6 rounded bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-sm mr-3">
              {workspace?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-xl text-zinc-900">{workspace?.name}</span>
            <span className="ml-3 text-sm text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
              {projects.length} Proyek Aktif
            </span>
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
          <div className="flex flex-col gap-6">
            
            {/* SCORECARDS */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col justify-between items-center relative overflow-hidden group">
                <div className="absolute top-0 w-full h-1 bg-zinc-300"></div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Open</h4>
                <p className="text-3xl font-black text-zinc-800">{totalOpen}</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-blue-500"></div>
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">In Progress</h4>
                <p className="text-3xl font-black text-blue-700">{totalInProgress}</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-amber-500"></div>
                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Review</h4>
                <p className="text-3xl font-black text-amber-600">{totalReview}</p>
              </div>
              <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-red-500"></div>
                <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Revision</h4>
                <p className="text-3xl font-black text-red-600">{totalRevision}</p>
              </div>
              <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-emerald-500"></div>
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Completed</h4>
                <p className="text-3xl font-black text-emerald-600">{totalCompleted}</p>
              </div>
            </div>

            {/* ROW 2: WORKLOAD (KIRI) & RECENT TASKS (KANAN) */}
            <div className="grid grid-cols-12 gap-6">
              
              <div className="col-span-7 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[320px]">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Beban Kerja Anggota (Tugas Aktif)
                </h3>
                
                {workloadData.length === 0 ? (
                   <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">Belum ada data tugas.</div>
                ) : (
                  <div className="flex-1 w-full mt-2 pr-6">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={workloadData} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e4e4e7" />
                        <XAxis type="number" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#3f3f46', fontSize: 12, fontWeight: 600 }} 
                          width={150} 
                        />
                        <Tooltip 
                          cursor={{fill: '#f4f4f5'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number, name: string) => [value, name === 'active' ? 'Tugas Aktif' : 'Total Tugas']}
                        />
                        <Bar dataKey="active" radius={[0, 4, 4, 0]} barSize={28}>
                          <LabelList dataKey="active" position="right" fill="#4f46e5" fontSize={13} fontWeight="bold" offset={10} />
                          {workloadData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* KANAN: AKTIVITAS TERBARU */}
              <div className="col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[320px]">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Aktivitas Tugas Terbaru
                </h3>
                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  {recentTasks.length === 0 ? (
                    <div className="text-center text-sm text-zinc-400 py-10">Belum ada tugas dibuat.</div>
                  ) : (
                    recentTasks.map((t:any) => {
                      const projectName = projects.find((p:any) => p.id === t.project_id)?.name || 'Unknown'
                      
                      let statusBadge = "bg-zinc-100 text-zinc-600"
                      if(t.status==='Completed') statusBadge = "bg-emerald-100 text-emerald-700"
                      else if(t.status==='In-Progress') statusBadge = "bg-blue-100 text-blue-700"
                      else if(t.status==='Waiting for Review') statusBadge = "bg-amber-100 text-amber-700"
                      else if(t.status==='Revision') statusBadge = "bg-red-100 text-red-700"

                      return (
                        <div key={t.id} className="p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-zinc-800 truncate pr-2 group-hover:text-indigo-600 transition-colors">{t.title}</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${statusBadge}`}>{t.status}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-zinc-500">
                            <span className="truncate max-w-[180px]">Proyek: {projectName}</span>
                            <span>{formatDate(t.created_at)}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>

            {/* ROW 3: RESOURCE & LINKS TABLE */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden mb-10">
              <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Direktori Resource & Dokumen
                </h3>
              </div>

              {allLinks.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3 text-zinc-400">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-700">Belum ada dokumen</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm">Dokumen yang dilampirkan pada Task akan otomatis terkumpul di tabel ini.</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 py-2.5 px-5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50">
                    <div className="col-span-5">Nama Dokumen / Task</div>
                    <div className="col-span-4">Sumber Proyek</div>
                    <div className="col-span-2 text-center">Tgl Dibuat</div>
                    <div className="col-span-1 text-center">Link</div>
                  </div>
                  
                  <div className="flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
                    {allLinks.map((link:any) => (
                      <div key={link.id} className="grid grid-cols-12 gap-4 border-b border-zinc-100 py-3 px-5 items-center hover:bg-zinc-50 transition-colors group">
                        <div className="col-span-5 flex items-center gap-3">
                          <DocumentIcon url={link.url} className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-semibold text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">{link.title}</span>
                        </div>
                        <div className="col-span-4 text-xs font-medium text-zinc-600 truncate">
                          {link.project_name}
                        </div>
                        <div className="col-span-2 text-xs text-zinc-500 text-center">
                          {formatDate(link.created_at)}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <a href={link.url} target="_blank" rel="noreferrer" className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition-colors tooltip-trigger" title="Buka Dokumen">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB LAINNYA SEMENTARA DIKOSONGKAN AGAR FOKUS */}
        {activeTab === 'list' && <div className="p-10 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl mt-4">Tab List sedang dalam pengembangan...</div>}
        {activeTab === 'board' && <div className="p-10 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl mt-4">Tab Board sedang dalam pengembangan...</div>}
        {activeTab === 'gantt' && <div className="p-10 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl mt-4">Tab Gantt sedang dalam pengembangan...</div>}

      </div>
    </div>
  )
}