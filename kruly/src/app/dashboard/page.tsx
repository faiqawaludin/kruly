import { createClient } from "@/utils/supabase/server"
import DashboardFilters from "./DashboardFilters"
import SlaPieChart from "./SlaPieChart"
import SpaceCardList from "./SpaceCardList"

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
    .select(`role, workspaces ( id, name, projects ( id, name ) )`)
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

  // Grup Kalkulasi
  const totalTask = open + inProgress + review + revision + completed;
  const totalActive = inProgress + review + revision;

  return (
    <div className="space-y-6 bg-zinc-50/50 min-h-screen pb-10"> 
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard MoM GMC</h1>
          <p className="text-sm text-zinc-500 mt-1">Global Overview Performa Task</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardFilters isAdmin={isAdmin} userId={user?.id as string} />
        </div>
      </div>

      {/* --- BARIS 1: 3 PANEL METRIK UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: Total Seluruh Task */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Seluruh Task</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-zinc-900 leading-none">{totalTask}</span>
            <div className="text-[10px] font-bold text-zinc-500 uppercase flex flex-col items-end gap-1">
              <div className="flex justify-between w-28"><span>Open</span> <span className="text-zinc-900">{open}</span></div>
              <div className="flex justify-between w-28"><span>Active</span> <span className="text-blue-600">{totalActive}</span></div>
              <div className="flex justify-between w-28"><span>Completed</span> <span className="text-emerald-600">{completed}</span></div>
            </div>
          </div>
        </div>

        {/* Panel 2: Total Task Aktif */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Task Aktif</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-blue-600 leading-none">{totalActive}</span>
            <div className="text-[10px] font-bold text-zinc-500 uppercase flex flex-col items-end gap-1">
              <div className="flex justify-between w-28"><span>In Progress</span> <span className="text-zinc-900">{inProgress}</span></div>
              <div className="flex justify-between w-28"><span>Review</span> <span className="text-amber-500">{review}</span></div>
              <div className="flex justify-between w-28"><span>Revision</span> <span className="text-red-500">{revision}</span></div>
            </div>
          </div>
        </div>

        {/* Panel 3: Total Selesai */}
        <div className="border border-zinc-300 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Total Selesai</h3>
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black text-emerald-600 leading-none">{completed}</span>
            <div className="text-[10px] font-bold text-zinc-500 uppercase flex flex-col items-end gap-1">
              <div className="flex justify-between w-28"><span>On Time</span> <span className="text-emerald-600">{onTime}</span></div>
              <div className="flex justify-between w-28"><span>Late</span> <span className="text-rose-500">{late}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BARIS 2: CHARTS & LOGS (GRID 12 KOLOM) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
        
        {/* KOLOM KIRI (50% Lebar): Line Chart */}
        <div className="col-span-1 lg:col-span-6 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[280px] flex flex-col">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Tren & Aktivitas Bulanan</h3>
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 rounded-md bg-zinc-50/50">
            (Placeholder Line Chart Recharts)
          </div>
        </div>
        
        {/* KOLOM TENGAH (25% Lebar): Pie Chart */}
        <div className="col-span-1 lg:col-span-3 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[280px] flex flex-col">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider text-center mb-2">Overall SLA Performance</h3>
          <div className="flex-1 flex flex-col justify-center">
            <SlaPieChart data={kpiData} />
          </div>
        </div>

        {/* KOLOM KANAN (25% Lebar): Dinamis berdasar Role */}
        <div className="col-span-1 lg:col-span-3 border border-zinc-300 rounded-xl bg-white p-4 shadow-sm min-h-[280px] flex flex-col">
          {isAdmin ? (
            // TAMPILAN ADMIN: Top 5, Avg Lead Time, & Bar Chart
            <>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Top 5 Performer</h3>
                <div className="text-right">
                  <span className="block text-[9px] text-zinc-500 uppercase font-bold">Avg. Leadtime</span>
                  <span className="text-xl font-black text-zinc-900 leading-none">0 <span className="text-[10px] font-normal text-zinc-500">Days</span></span>
                </div>
              </div>
              
              {/* Tombol Filter VBA Style (Excel) */}
              <div className="flex gap-1 mb-4">
                <button className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded-sm transition-colors shadow-sm">On Time</button>
                <button className="bg-red-900 hover:bg-red-950 text-white text-[10px] font-bold px-3 py-1 rounded-sm transition-colors shadow-sm">Latest</button>
              </div>

              <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 rounded-md bg-zinc-50/50">
                (Bar Chart Recharts)
              </div>
            </>
          ) : (
            // TAMPILAN USER: Daftar Log/Notifikasi
            <>
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4">Log & Notifikasi Anda</h3>
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                <div className="p-3 text-xs bg-zinc-50 border border-zinc-100 rounded-md text-zinc-500 text-center italic mt-4">
                  Belum ada notifikasi baru.
                </div>
                {/* Nanti diisi dengan mapping data notifikasi/log */}
              </div>
            </>
          )}
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