"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SlaPieChart({ data }: { data: any }) {
  // Mapping data SLA dan warnanya agar sesuai dengan warna Excel-mu
  const chartData = [
    { name: 'On Time', value: data?.on_time || 0, color: '#10b981' }, // Hijau
    { name: 'Late (Selesai)', value: data?.late_completion || 0, color: '#f59e0b' }, // Kuning/Oranye
    { name: 'Not Yet Overdue', value: data?.not_yet_overdue || 0, color: '#3b82f6' }, // Biru
    { name: 'Overdue', value: data?.overdue || 0, color: '#ef4444' }, // Merah
  ]

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-zinc-400">
        Belum ada task untuk dihitung
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}