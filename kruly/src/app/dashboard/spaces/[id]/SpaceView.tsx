"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SpaceView({ space, projects, tasks, links }: any) {
  const [activeTab, setActiveTab] = useState('overview')

  // Kalkulasi Metrik Global Space
  const statusCounts = {
    open: tasks.filter((t: any) => t.status === 'Open').length,
    inProgress: tasks.filter((t: any) => t.status === 'In-Progress').length,
    review: tasks.filter((t: any) => t.status === 'Waiting for Review').length,
    revision: tasks.filter((t: any) => t.status === 'Revision').length,
    completed: tasks.filter((t: any) => t.status === 'Completed').length,
  }

  // Data untuk Pie Chart Workload
  const pieData = [
    { name: 'Open', value: statusCounts.open, color: '#e4e4e7' }, // Abu-abu
    { name: 'In Progress', value: statusCounts.inProgress, color: '#3b82f6' }, // Biru
    { name: 'Review', value: statusCounts.review, color: '#f59e0b' }, // Kuning
    { name: 'Revision', value: statusCounts.revision, color: '#ef4444' }, // Merah
    { name: 'Completed', value: statusCounts.completed, color: '#10b981' }, // Hijau
  ].filter(item => item.value > 0) // Sembunyikan yang nilainya 0

  return (
    <div className="space-y-6 w-full">
      {/* HEADER */}
      <div className="border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            {space.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{space.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">Workspace Overview (Gabungan {projects.length} Proyek)</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm font-medium mt-4">
          {['Overview', 'List', 'Board', 'Gantt'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab.toLowerCase() ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 w-full">
        {activeTab === 'overview' && (
          <div className="space-y-6 w-full">
            
            {/* 5 PANEL STATUS CEPAT */}
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-black text-zinc-700">{statusCounts.open}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Open</div>
              </div>
              <div className="bg-white border border-blue-200 p-3 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-black text-blue-600">{statusCounts.inProgress}</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">In Progress</div>
              </div>
              <div className="bg-white border border-amber-200 p-3 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-black text-amber-500">{statusCounts.review}</div>
                <div className="text-[10px] font-bold text-amber-600 uppercase mt-1">Review</div>
              </div>
              <div className="bg-white border border-red-200 p-3 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-black text-red-500">{statusCounts.revision}</div>
                <div className="text-[10px] font-bold text-red-600 uppercase mt-1">Revision</div>
              </div>
              <div className="bg-white border border-emerald-200 p-3 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-black text-emerald-600">{statusCounts.completed}</div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Completed</div>
              </div>
            </div>

            {/* AREA BAWAH: RECENT TASKS, PIE CHART, & LINKS (3 KOLOM) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              
              {/* KOLOM 1: Recent Tasks */}
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 w-full flex flex-col">
                <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Aktivitas Terbaru
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {tasks.slice(0, 5).length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Belum ada tugas di workspace ini.</p>
                  ) : (
                    tasks.slice(0, 5).map((t: any) => (
                      <div key={t.id} className="flex flex-col text-sm border-b border-zinc-100 pb-2 last:border-0">
                        <div className="flex justify-between items-start">
                          <span className="text-zinc-700 font-medium truncate pr-4">{t.title}</span>
                          <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold shrink-0">{t.status}</span>
                        </div>
                        <span className="text-xs text-zinc-400 mt-1">dari: {t.projects?.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* KOLOM 2: Workload by Status (Pie Chart) */}
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 flex flex-col w-full">
                <h3 className="text-sm font-bold text-zinc-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                  Workload by Status
                </h3>
                <div className="flex-1 min-h-[200px]">
                  {pieData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400 italic">
                      Belum ada task untuk dihitung
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* KOLOM 3: Resource & Drive Links */}
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 flex flex-col w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    Resource & Links
                  </h3>
                  <button className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
                    + Tambah Link
                  </button>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  {links?.length === 0 ? (
                    <div className="text-center text-zinc-400">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/></svg>
                      <p className="text-xs">Belum ada dokumen yang dilampirkan.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {links?.map((link: any) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-md border border-transparent hover:border-zinc-200 transition-all group">
                          <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M2.965 12.605a2.5 2.5 0 003.535 0l2.122-2.122a2.5 2.5 0 00-3.536-3.535l-2.121 2.121a2.5 2.5 0 000 3.536zm14.535-7.07a2.5 2.5 0 00-3.535 0l-2.122 2.121a2.5 2.5 0 003.536 3.535l2.121-2.121a2.5 2.5 0 000-3.536z"/></svg>
                          </div>
                          <span className="text-sm font-medium text-zinc-700 group-hover:text-indigo-600 truncate flex-1">{link.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB LIST GABUNGAN */}
        {activeTab === 'list' && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-sm bg-white">
            Tampilan List ini nantinya akan menampilkan gabungan seluruh Task dari seluruh Proyek di Space ini.
          </div>
        )}
      </div>
    </div>
  )
}