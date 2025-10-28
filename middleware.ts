import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 아래와 일치하는 경로는 미들웨어에서 제외합니다:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * 정적 리소스에 불필요한 세션 갱신을 방지합니다.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}