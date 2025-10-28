'use client'

import { createClient } from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh() // 페이지를 새로고침하여 서버 컴포넌트가 새 세션 상태를 반영하도록 함
  }

  return <button onClick={handleSignOut}>로그아웃</button>
}