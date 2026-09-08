import { createClient } from "@/utils/supabase/server"
import CalendarView from "./CalendarView"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      *,
      projects (
        name,
        category
      )
    `)
    .not('due_date', 'is', null)

  return (
    // 🔴 KUNCI 1: Mengunci tinggi halaman agar pas 1 layar penuh (tidak luber ke bawah)
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="pb-4 border-b border-zinc-200 shrink-0">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900">Calendar</h1>
      </div>
      
      {/* min-h-0 sangat penting agar grid kalender di dalamnya tidak merusak batas */}
      <div className="flex-1 mt-6 min-h-0">
        <CalendarView initialTasks={tasks || []} />
      </div>
    </div>
  )
}