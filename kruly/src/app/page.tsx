import { redirect } from 'next/navigation'

export default function RootPage() {
  // Langsung arahkan pengunjung rute utama (/) ke /dashboard
  redirect('/dashboard')
}