import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Panggil fungsi updateSession yang mengatur cookie dan redirect
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Terapkan middleware ini ke semua route KECUALI:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (ikon)
     * - ekstensi file umum (seperti .svg, .png, dsb)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}