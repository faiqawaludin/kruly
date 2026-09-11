"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function CreateTaskModal({ 
  projectId, 
  members, 
  isOpen, 
  onClose 
}: { 
  projectId: string, 
  members: any[], 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // STATE UNTUK CUSTOM DROPDOWN
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [priority, setPriority] = useState<string>("Normal")
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false)
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)

  if (!isOpen) return null

  const selectedMember = members?.find(m => m.user_id === assigneeId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    const newTask = {
      project_id: projectId,
      title: formData.get('title'),
      description: null, // Dihilangkan dari form
      assignee_id: assigneeId, 
      due_date: formData.get('due_date') || null,
      priority: priority, 
      status: 'Open',
      document_url: null, // Dihilangkan dari form
    }

    try {
      const { error } = await supabase.from('tasks').insert([newTask])
      if (error) throw error
      
      setAssigneeId(null)
      setPriority("Normal")
      
      router.refresh()
      onClose()
    } catch (error: any) {
      alert("Gagal membuat task: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      
      {/* Overlay penutup dropdown */}
      {(isAssigneeOpen || isPriorityOpen) && (
        <div className="absolute inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsAssigneeOpen(false); setIsPriorityOpen(false); }} />
      )}

      {/* MODAL CONTAINER - Lebih compact dan border radius normal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-visible animate-in zoom-in-95 duration-200 relative z-50 flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-xl">
          <h3 className="text-base font-bold text-zinc-900 tracking-tight">Add New Task</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4">
            
            {/* INPUT TITLE */}
            <div>
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-1.5">Task Name <span className="text-red-500">*</span></label>
              <input 
                required name="title" autoFocus type="text" 
                placeholder="Enter task name..." 
                className="w-full h-10 border border-zinc-300 rounded-md px-3 text-sm focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all bg-white" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* DROPDOWN ASSIGNEE */}
              <div className="relative">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-1.5">Assignee</label>
                <button 
                  type="button" 
                  onClick={() => { setIsAssigneeOpen(!isAssigneeOpen); setIsPriorityOpen(false); }}
                  className="w-full h-10 border border-zinc-300 rounded-md px-3 text-sm flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {selectedMember ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                      {selectedMember.avatar_url ? (
                        <img src={selectedMember.avatar_url} className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-200" alt="Avatar" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {(selectedMember.full_name || 'U').substring(0,1).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-zinc-700 truncate">{selectedMember.full_name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <div className="w-5 h-5 rounded-full border border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 shrink-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <span className="font-medium">Unassigned</span>
                    </div>
                  )}
                  <svg className={`w-4 h-4 text-zinc-400 transition-transform ${isAssigneeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isAssigneeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-zinc-200 shadow-lg rounded-md py-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                    <button type="button" onClick={() => { setAssigneeId(null); setIsAssigneeOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-zinc-50 text-xs font-medium text-zinc-500 flex items-center gap-2 border-b border-zinc-100 mb-1">
                      <div className="w-5 h-5 rounded-full border border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 shrink-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      Unassigned
                    </button>
                    {members?.map(m => (
                      <button key={m.user_id} type="button" onClick={() => { setAssigneeId(m.user_id); setIsAssigneeOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-xs font-medium text-zinc-700 flex items-center gap-2">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-200" alt="Avatar" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(m.full_name || 'U').substring(0,1).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate">{m.full_name || `User ${m.user_id.substring(0,4)}`}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* INPUT DUE DATE */}
              <div>
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-1.5">Due Date</label>
                <input 
                  name="due_date" type="date" 
                  className="w-full h-10 border border-zinc-300 rounded-md px-3 text-sm focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-zinc-700" 
                />
              </div>

              {/* DROPDOWN PRIORITY */}
              <div className="relative">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-1.5">Priority</label>
                <button 
                  type="button" 
                  onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsAssigneeOpen(false); }}
                  className="w-full h-10 border border-zinc-300 rounded-md px-3 text-sm flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <svg className={`w-3.5 h-3.5 ${priority === 'High' ? 'text-amber-500' : priority === 'Urgent' ? 'text-red-500' : 'text-zinc-400'}`} fill={priority !== 'Normal' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                    <span className={`font-medium ${priority === 'Urgent' ? 'text-red-600' : priority === 'High' ? 'text-amber-600' : 'text-zinc-700'}`}>{priority}</span>
                  </div>
                  <svg className={`w-4 h-4 text-zinc-400 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isPriorityOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-zinc-200 shadow-lg rounded-md py-1 z-50">
                    {['Normal', 'High', 'Urgent'].map(p => (
                      <button key={p} type="button" onClick={() => { setPriority(p); setIsPriorityOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-zinc-50 text-xs font-medium flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 ${p === 'High' ? 'text-amber-500' : p === 'Urgent' ? 'text-red-500' : 'text-zinc-400'}`} fill={p !== 'Normal' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                        <span className={p === 'Urgent' ? 'text-red-600' : p === 'High' ? 'text-amber-600' : 'text-zinc-700'}>{p}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2 rounded-b-xl shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 shadow-sm">
              {isSubmitting ? "Menyimpan..." : "Create Task"}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}