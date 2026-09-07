import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import CreateTaskModal from "./CreateTaskModal"

export default async function ProjectListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.id
  const supabase = await createClient()

  // Ambil daftar task untuk proyek ini
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  // Kelompokkan task berdasarkan status
  const statuses = ['Open', 'In Progress', 'Approved', 'Done']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-zinc-500">Kelola dan pantau tugas pada proyek ini.</p>
        <CreateTaskModal projectId={projectId} />
      </div>

      <div className="space-y-8">
        {statuses.map((status) => {
          const statusTasks = tasks?.filter((t: any) => t.status === status) || []
          
          // Warna khusus untuk status (Mirip ClickUp)
          const statusColor = 
            status === 'Open' ? 'bg-zinc-200 text-zinc-700' :
            status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
            status === 'Approved' ? 'bg-indigo-100 text-indigo-700' :
            'bg-green-100 text-green-700'

          return (
            <div key={status} className="space-y-3">
              {/* Header Status (Grouping) */}
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-sm ${statusColor}`}>
                  {status}
                </span>
                <span className="text-sm font-medium text-zinc-400">
                  {statusTasks.length} Task
                </span>
              </div>

              {/* Daftar Task */}
              {statusTasks.length === 0 ? (
                <div className="py-3 px-4 text-sm text-zinc-400 italic bg-zinc-50/50 rounded-md border border-dashed border-zinc-200">
                  Tidak ada task
                </div>
              ) : (
                <div className="space-y-2">
                  {statusTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-md hover:border-indigo-300 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:border-indigo-400"></div>
                        <span className="font-medium text-sm text-zinc-800">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          task.priority === 'Urgent' ? 'text-red-700 bg-red-50' :
                          task.priority === 'High' ? 'text-orange-700 bg-orange-50' :
                          'text-zinc-500'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                        <span className="text-zinc-400 w-24 text-right">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}