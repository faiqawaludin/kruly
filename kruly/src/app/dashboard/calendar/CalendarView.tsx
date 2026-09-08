"use client"

import { useState } from "react"
import Link from "next/link"

export default function CalendarView({ initialTasks }: { initialTasks: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getCategoryColor = (category: string) => {
    const cat = (category || 'General').trim()
    if (cat === 'Corporate Planning') return 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
    if (cat === 'Digitalisasi') return 'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200'
    return 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' 
  }

  const days = []
  
  // Kotak kosong
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="bg-zinc-50 border-r border-b border-zinc-200 opacity-50"></div>)
  }

  // Kotak tanggal
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const tasksForDay = initialTasks.filter(t => t.due_date && t.due_date.startsWith(dateString))
    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, d).toDateString()

    days.push(
      // 🔴 KUNCI 2: Hapus min-h-[120px], gunakan min-h-0 dan overflow-hidden pada sel utama
      <div key={d} className={`min-h-0 overflow-hidden bg-white border-r border-b border-zinc-200 p-2 flex flex-col transition-colors hover:bg-zinc-50/50 ${isToday ? 'bg-indigo-50/20' : ''}`}>
        
        <div className="flex justify-between items-center mb-1 shrink-0">
          <span className={`text-sm font-medium ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : 'text-zinc-600'}`}>
            {d}
          </span>
        </div>

        {/* 🔴 KUNCI 3: Area daftar task diberikan overflow-y-auto agar memunculkan scrollbar di dalam sel jika penuh */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1 pb-1">
          {tasksForDay.map(task => {
            const category = task.projects?.category || 'General'
            const colorClass = getCategoryColor(category)

            return (
              <Link 
                href={`/dashboard/projects/${task.project_id}`} 
                key={task.id} 
                className={`block text-[10px] font-bold px-2 py-1.5 border rounded shadow-sm truncate transition-colors ${colorClass}`}
                title={`${task.title} - ${task.projects?.name}`}
              >
                {task.title}
              </Link>
            )
          })}
        </div>

      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={goToToday} className="px-4 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 shadow-sm transition-colors">
            Today
          </button>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-md transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextMonth} className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-md transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <h2 className="text-xl font-black text-zinc-800 min-w-[200px]">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* LEGENDA */}
        <div className="flex items-center gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-300"></div> General</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-200 border border-amber-300"></div> Corplan</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-200 border border-indigo-300"></div> Digitalisasi</div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-zinc-200 bg-white shrink-0">
        {dayNames.map(day => (
          <div key={day} className="px-2 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider border-r border-zinc-200 last:border-0">
            {day}
          </div>
        ))}
      </div>

      {/* KALENDER GRID - otomatis membagi rata sisa layar */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-zinc-100 overflow-hidden">
        {days}
      </div>

    </div>
  )
}