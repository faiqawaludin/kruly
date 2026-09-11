"use client"

import { useState } from "react"
import SlaPieChart from "./SlaPieChart"

export default function SlaPerformancePanel({ 
  overallData, 
  memberData 
}: { 
  overallData: any, 
  memberData: any[] 
}) {
  const [activeTab, setActiveTab] = useState<'overall' | 'member'>('overall')

  return (
    <div className="flex flex-col h-full relative">
      
      {/* HEADER & TAB TOGGLE */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">SLA Performance</h3>
        
        {/* Toggle Button */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
          <button 
            onClick={() => setActiveTab('overall')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-300 ${activeTab === 'overall' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            OVERALL
          </button>
          <button 
            onClick={() => setActiveTab('member')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-300 ${activeTab === 'member' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            BY MEMBER
          </button>
        </div>
      </div>

      {/* AREA KONTEN */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* TAB 1: OVERALL PIE CHART */}
        {activeTab === 'overall' && (
          <div className="absolute inset-0 animate-in fade-in slide-in-from-left-4 duration-300">
            <SlaPieChart data={overallData} />
          </div>
        )}

        {/* TAB 2: LIST BY MEMBER (Clean List ala Task View) */}
        {activeTab === 'member' && (
          <div className="absolute inset-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            
            {memberData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 italic">
                Belum ada data task per member.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                
                {/* HEADER TABEL (Mirip Task List) */}
                <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 py-2 text-[9px] font-bold text-zinc-400 uppercase tracking-wider items-center sticky top-0 bg-white z-10">
                  <div className="col-span-5 pl-2">Nama Member</div>
                  <div className="col-span-2 text-center">Total</div>
                  <div className="col-span-2 text-center text-emerald-500" title="On Time">On Time</div>
                  <div className="col-span-3 text-center text-red-500" title="Overdue / Telat">Overdue</div>
                </div>

                {/* ISI DAFTAR MEMBER */}
                <div className="flex flex-col pb-2">
                  {memberData.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 border-b border-zinc-100 py-2.5 items-center hover:bg-zinc-50 transition-colors">
                      
                      {/* Avatar & Nama */}
                      <div className="col-span-5 pl-2 flex items-center gap-2 overflow-hidden">
                        {m.avatar ? (
                          <img src={m.avatar} className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-200" alt="PP" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {m.name.substring(0,1).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-zinc-700 truncate" title={m.name}>{m.name}</span>
                      </div>

                      {/* Total Task */}
                      <div className="col-span-2 text-center text-xs font-medium text-zinc-500">
                        {m.total}
                      </div>

                      {/* Jumlah On Time */}
                      <div className="col-span-2 text-center text-xs font-bold text-emerald-600">
                        {m.onTime > 0 ? m.onTime : <span className="text-zinc-300">-</span>}
                      </div>

                      {/* Jumlah Overdue */}
                      <div className="col-span-3 text-center text-xs font-bold text-red-500">
                        {m.overdue > 0 ? m.overdue : <span className="text-zinc-300">-</span>}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </div>
  )
}