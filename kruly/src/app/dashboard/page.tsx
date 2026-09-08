import { createClient } from "@/utils/supabase/server"
import DashboardFilters from "./DashboardFilters"
import SlaPieChart from "./SlaPieChart"
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

  const { data: kpiData } = await supabase.rpc('get_dashboard_kpi', {
    p_workspace_id: null, 
    p_year: selectedYear,
    p_assignee_id: finalPic
  })

  // Ekstrak data
  const open = kpiData?.open || 0;
  const inProgress = kpiData?.in_progress || 0;
  const review = kpiData?.waiting_review || 0;
  const revision = kpiData?.revision || 0;
  const completed = kpiData?.completed || 0;
  
  const onTime = kpiData?.on_time || 0;
  const late = kpiData?.late_completion || 0;
  const avgLeadTime = kpiData?.avg_lead_time || 0;

  // Grup Kalkulasi
  const totalTask = open + inProgress + review + revision + completed;
  const totalActive = inProgress + review + revision;

  return (
    <div className="space-y-6 bg-zinc-50/50 min-h-screen pb-10"> 
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardFilters isAdmin={isAdmin} userId={user?.id as string} />
        </div>
      </div>

      {/* --- BARIS 1: 4 PANEL METRIK UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Panel 1: Total Seluruh Task */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Seluruh Task</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-zinc-900 leading-none">{totalTask}</span>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-500 uppercase w-28">
              <span className="text-left">Open</span> <span className="text-right text-zinc-900">{open}</span>
              <span className="text-left">Active</span> <span className="text-right text-blue-600">{totalActive}</span>
              <span className="text-left">Completed</span> <span className="text-right text-emerald-600">{completed}</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Total Task Aktif */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Task Aktif</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-blue-600 leading-none">{totalActive}</span>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-500 uppercase w-28">
              <span className="text-left">In Progress</span> <span className="text-right text-zinc-900">{inProgress}</span>
              <span className="text-left">Review</span> <span className="text-right text-amber-500">{review}</span>
              <span className="text-left">Revision</span> <span className="text-right text-red-500">{revision}</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Total Selesai */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Selesai</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-emerald-600 leading-none">{completed}</span>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-500 uppercase w-24">
              <span className="text-left">On Time</span> <span className="text-right text-emerald-600">{onTime}</span>
              <span className="text-left">Late</span> <span className="text-right text-rose-500">{late}</span>
            </div>
          </div>
        </div>

        {/* Panel 4: Average Lead Time */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Avg. Lead Time</h3>
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-amber-500 leading-none">{avgLeadTime}</span>
              <span className="text-sm font-bold text-zinc-400 mb-1">Hari</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase text-right leading-tight mb-1">
              Rata-rata<br/>Penyelesaian
            </div>
          </div>
        </div>

      </div>

      {/* --- BARIS 2: CHARTS (KINI HANYA 2 CHART AGAR LEGA) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
        
        {/* KOLOM KIRI (Lebih lebar, ambil 8 kolom dari 12) - Line Chart */}
        <div className="col-span-1 lg:col-span-8 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[280px] flex flex-col">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Tren & Aktivitas Bulanan</h3>
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 rounded-md bg-zinc-50/50">
            (Placeholder Line Chart Recharts)
          </div>
        </div>
        
        {/* KOLOM KANAN (Ambil 4 kolom dari 12) - Pie Chart */}
        <div className="col-span-1 lg:col-span-4 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[280px] flex flex-col">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider text-center mb-2">Overall SLA Performance</h3>
          <div className="flex-1 flex flex-col justify-center">
            <SlaPieChart data={kpiData} />
          </div>
        </div>

      </div>

      {/* --- BARIS 3: DAFTAR SPACE --- */}
      <div className="pt-6 mt-4">
        <h2 className="text-lg font-bold text-zinc-800 mb-4">Daftar Space (Workspace)</h2>
        <SpaceCardList workspaces={workspaces || []} />
      </div>
      
    </div>
  )
}