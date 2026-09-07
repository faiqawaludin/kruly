import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// PERUBAHAN DI SINI: Ubah nama fungsi dari 'middleware' menjadi 'proxy'
export async function proxy(request: NextRequest) {
  // 1. Cek apakah user mengunjungi rute utama "/"
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  // 2. Jalankan validasi sesi Supabase untuk halaman lainnya
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}