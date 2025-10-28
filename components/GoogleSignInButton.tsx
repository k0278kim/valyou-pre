'use client'

import { createClient } from '@/utils/supabase/supabaseClient'

export default function GoogleSignInButton() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 이 URL은 Google 로그인 후 사용자가 돌아올 앱의 경로입니다.
        // /auth/callback 라우트를 다음 단계에서 만듭니다.
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return <button onClick={handleGoogleLogin} className={"w-full h-16 bg-blue-600 font-bold text-white rounded-2xl"}>Google 계정으로 로그인</button>
}