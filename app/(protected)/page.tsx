import { createClient } from '@/utils/supabase/server'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import SignOutButton from '@/components/SignOutButton'
import {NextResponse} from "next/server";
import {redirect} from "next/navigation";

export default async function HomePage() {
  // 서버 클라이언트를 생성하여 사용자 세션 정보를 가져옵니다.
  redirect("/chat-list");
  return <></>
}