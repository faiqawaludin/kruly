import { createClient } from "@/utils/supabase/server"
import DashboardFilters from "./DashboardFilters"
import SlaPerformancePanel from "./SlaPerformancePanel" // 🔴 IMPORT PANEL PINTAR KITA
import SpaceCardList from "./SpaceCardList"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; pic?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
  const selectedYear = params?.year ? parseInt(params.year) : new Date().getFullYear()
  const selectedPic = params?.pic || null
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspaces } = await supabase
    .from('workspace_members')
    .select(`role, workspaces ( id, name, projects ( id, name, category ) )`)
    .eq('user_id', user?.id)

  const userRole = workspaces?.[0]?.role || 'member'
  const isAdmin = userRole === 'admin'
  const finalPic = isAdmin ? selectedPic : user?.id

  // 1. Ambil Kpi Keseluruhan
  const { data: kpiData } = await supabase.rpc('get_dashboard_kpi', {
    p_workspace_id: null, 
    p_year: selectedYear,
    p_assignee_id: finalPic
  })

  // 2. LOGIKA BARU: Hitung SLA By Member
  let memberData: any[] = []
  if (isAdmin) {
    // Ambil semua task dan profile untuk diolah
    const { data: tasks } = await supabase.from('tasks').select('assignee_id, status, due_date').not('assignee_id', 'is', null)
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url')

    if (tasks && profiles) {
      const today = new Date().getTime();
      
      memberData = profiles.map(profile => {
        const userTasks = tasks.filter(t => t.assignee_id === profile.id);
        if (userTasks.length === 0) return null;

        let onTime = 0; let notYetOverdue = 0; let overdue = 0;

        userTasks.forEach(task => {
          if (!task.due_date) return;
          const dueDate = new Date(task.due_date).getTime();
          
          if (task.status === 'Completed') {
            onTime++; 
          } else {
            if (dueDate < today) overdue++;
            else notYetOverdue++;
          }
        });

        const total = onTime + notYetOverdue + overdue;
        if (total === 0) return null;

        return {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          avatar: profile.avatar_url,
          onTime, notYetOverdue, overdue, total
        }
      }).filter(Boolean); // Buang yang null (tidak punya task)
    }
  }

  // Ekstrak data untuk Box Atas
  const open = kpiData?.open || 0;
  const inProgress = kpiData?.in_progress || 0;
  const review = kpiData?.waiting_review || 0;
  const revision = kpiData?.revision || 0;
  const completed = kpiData?.completed || 0;
  
  const onTime = kpiData?.on_time || 0;
  const late = kpiData?.late_completion || 0;
  const avgLeadTime = kpiData?.avg_lead_time || 0;

  const totalTask = open + inProgress + review + revision + completed;
  const totalActive = inProgress + review + revision;

  return (
    <div className="space-y-6 bg-zinc-50/50 min-h-screen pb-10"> 
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview Performance</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardFilters isAdmin={isAdmin} userId={user?.id as string} />
        </div>
      </div>

      {/* --- BARIS 1: 4 PANEL METRIK UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1 */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Task</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-zinc-900 leading-none">{totalTask}</span>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-500 uppercase w-28">
              <span className="text-left">Open</span> <span className="text-right text-zinc-900">{open}</span>
              <span className="text-left">Active</span> <span className="text-right text-blue-600">{totalActive}</span>
              <span className="text-left">Completed</span> <span className="text-right text-emerald-600">{completed}</span>
            </div>
          </div>
        </div>

        {/* Panel 2 */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Active Task</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-blue-600 leading-none">{totalActive}</span>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-500 uppercase w-28">
              <span className="text-left">In Progress</span> <span className="text-right text-zinc-900">{inProgress}</span>
              <span className="text-left">Review</span> <span className="text-right text-amber-500">{review}</span>
              <span className="text-left">Revision</span> <span className="text-right text-red-500">{revision}</span>
            </div>
          </div>
        </div>

        {/* Panel 3 */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Tasks Completed</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-emerald-600 leading-none">{completed}</span>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-500 uppercase w-24">
              <span className="text-left">On Time</span> <span className="text-right text-emerald-600">{onTime}</span>
              <span className="text-left">Late</span> <span className="text-right text-rose-500">{late}</span>
            </div>
          </div>
        </div>

        {/* Panel 4 */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Average Lead Time</h3>
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-amber-500 leading-none">{avgLeadTime}</span>
              <span className="text-sm font-bold text-zinc-400 mb-1">Days</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase text-right leading-tight mb-1">
              Average <br/>Completion Time
            </div>
          </div>
        </div>
      </div>

      {/* --- BARIS 2: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
        
        {/* Line Chart */}
        <div className="col-span-1 lg:col-span-8 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Monthly Trends & Activities</h3>
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 rounded-md bg-zinc-50/50">
            (Placeholder Line Chart Recharts)
          </div>
        </div>
        
        {/* 🔴 PANEL PINTAR (SLA PIE CHART / BY MEMBER) */}
        <div className="col-span-1 lg:col-span-4 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[300px] flex flex-col relative overflow-hidden">
          <SlaPerformancePanel 
            overallData={kpiData} 
            memberData={memberData} 
          />
        </div>

      </div>

      {/* --- BARIS 3: DAFTAR SPACE --- */}
      <div className="pt-6 mt-4">
        <h2 className="text-lg font-bold text-zinc-800 mb-4">WORKSPACE</h2>
        <SpaceCardList workspaces={workspaces || []} />
      </div>
      
    </div>
  )
}