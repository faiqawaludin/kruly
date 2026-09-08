"use client"

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SlaPieChart({ data }: { data: any }) {
  // STATE ANIMASI: Menyimpan status kapan teks label boleh muncul
  const [showLabel, setShowLabel] = useState(false)

  // TRIGGER ANIMASI: Reset dan jalankan ulang animasi setiap kali data berubah
  useEffect(() => {
    setShowLabel(false) // Sembunyikan label
    // Munculkan label tepat setelah animasi rotasi Pie selesai (450ms)
    const timer = setTimeout(() => setShowLabel(true), 450)
    return () => clearTimeout(timer)
  }, [data]) // Terpicu ulang jika filter Dashboard diganti

  const onTime = data?.on_time || 0;
  const notYetOverdue = data?.not_yet_overdue || 0;
  // Gabungkan task yang masih dikerjakan tapi telat, dan yang sudah selesai tapi telat
  const overdueTotal = (data?.overdue || 0) + (data?.late_completion || 0);

  // Data utuh untuk Legend di bawah
  const chartData = [
    { name: 'On Time', value: onTime, color: '#10b981' }, // Hijau
    { name: 'Not Yet Overdue', value: notYetOverdue, color: '#3b82f6' }, // Biru
    { name: 'Overdue', value: overdueTotal, color: '#ef4444' }, // Merah
  ]

  const total = onTime + notYetOverdue + overdueTotal;

  // Saring agar Pie Chart HANYA menggambar yang nilainya lebih dari 0
  const activeData = chartData.filter(d => d.value > 0);

  // CUSTOM LEGEND: Murni nama kategori saja
  const renderCustomLegend = () => {
    return (
      <div className="flex justify-center gap-5 mt-2">
        {chartData.map((entry, index) => {
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium whitespace-nowrap">
                {entry.name}
              </span>
            </div>
          )
        })}
      </div>
    );
  }

  // 🔴 CUSTOM LABEL DENGAN ANIMASI SWIPE DARI UJUNG GARIS
  const renderCustomLabel = ({ cx, x, y, textAnchor, percent, value }: any) => {
    if (value === 0) return null;
    
    // LOGIKA SWIPE: Deteksi apakah teks berada di Kanan atau di Kiri pie chart
    const isRightSide = x > cx;
    
    // Jika di kanan, teks ditarik ke kiri (-15px) dulu. Jika di kiri, teks ditarik ke kanan (15px) dulu.
    const startingOffset = isRightSide ? -15 : 15;

    return (
      <text 
        x={x} 
        y={y} 
        fill="#09090b" // Warna hitam tegas
        textAnchor={textAnchor} 
        dominantBaseline="central" 
        fontSize="13" 
        fontWeight="900"
        style={{
          // Tembus pandang saat awal, muncul 100% setelah delay
          opacity: showLabel ? 1 : 0,
          // Didorong dari posisi startingOffset kembali ke 0
          transform: `translateX(${showLabel ? 0 : startingOffset}px)`,
          // Efek memantul halus khas Apple/Vercel (Cubic Bezier)
          transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' 
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-zinc-400">
        Belum ada task untuk dihitung
      </div>
    )
  }

  return (
    <div className="h-[220px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="45%"
            innerRadius={45} 
            outerRadius={65} 
            paddingAngle={2}
            dataKey="value"
            labelLine={{ strokeWidth: 1.5, stroke: '#d4d4d8' }} // Garis ditarik dengan warna abu elegan
            label={renderCustomLabel} 
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
          />
          <Legend content={renderCustomLegend} verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}