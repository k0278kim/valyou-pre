"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image";
import { motion } from "framer-motion";
import {createClient} from "@/utils/supabase/supabaseClient";

type Slide = { title: string; subtitle: string }

const supabase = createClient()

const handleGoogleLogin = async () => {
  const redirectURL = `${location.origin}/auth/callback`;
  console.log("Redirecting to:", redirectURL); // 이 로그 확인!
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 이 URL은 Google 로그인 후 사용자가 돌아올 앱의 경로입니다.
      // /auth/callback 라우트를 다음 단계에서 만듭니다.
      redirectTo: redirectURL,
    },
  })
}

const SLIDES: Slide[] = [
  { title: "내 사진, AI는 어떻게 볼까?", subtitle: "단순한 필터를 넘어, AI의 객관적인 시선으로 당신의 모든 것을 분석해 보세요." },
  { title: "전문가처럼, 당신의 매력을 분석", subtitle: "얼굴의 특징부터 전체적인 분위기까지. AI가 당신만의 고유한 매력을 찾아드립니다." },
  { title: "AI가 제안하는 나만의 스타일", subtitle: "오늘 입은 옷, 잘 어울리는지 궁금하다면? 패션 사진을 올려보세요. AI가 스타일을 분석합니다." },
  { title: "때로는 친구처럼, 무엇이든 대답해 줄게요", subtitle: "분석 결과에 대해 더 궁금한 점이 있나요? 무엇이든 물어보세요. 당신의 AI 친구가 기다리고 있어요." }
]

export default function OnboardingClient() {
  const [index, setIndex] = useState<number>(0)
  const [showLogin, setShowLogin] = useState<boolean>(false)

  // 터치 스와이프 지원
  const startX = useRef<number | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showLogin) return
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, SLIDES.length - 1))
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showLogin])

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current == null) return
    const endX = e.changedTouches[0].clientX
    const dx = endX - startX.current
    if (dx < -40) setIndex((i) => Math.min(i + 1, SLIDES.length - 1))
    else if (dx > 40) setIndex((i) => Math.max(i - 1, 0))
    startX.current = null
  }

  return (
    <div className="h-svh flex flex-col items-center justify-start">
      <header className="w-full max-w-lg relative mt-2">
        <div className="text-2xl font-semibold mt-24 text-center">
          <p>Valyou.ai</p>
          <p className={"text-sm font-medium"}>AI 대화로 알아가는 패션</p>
        </div>
      </header>

      {/* 카드: 화면 중앙으로 배치 */}
      <div className="flex-1 w-full max-w-lg flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 overflow-hidden relative w-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${index * 100}%)` }}>
            {SLIDES.map((s, i) => (
              <motion.div key={i} className={`w-full flex-shrink-0 flex flex-col items-center text-center gap-4 px-4`}>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={`/onboarding/onboarding${i + 1}.png`} alt={s.title} className="absolute inset-0 w-full h-full object-cover" fill />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_8px]" />
                  </div>
                </div>

                <div className="w-full flex items-start justify-between max-w-[90%]">
                  <div className="text-center flex flex-col space-y-2.5 mt-10">
                    <h2 className="text-2xl font-bold break-keep">{s.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{s.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 중앙 정렬된 도트 그룹 */}
      <div className="w-full max-w-lg flex justify-center mt-4">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} aria-label={`슬라이드 ${i + 1}`} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? "bg-gray-900" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg flex justify-end mt-10 mb-10 mr-10">
        <div className="flex flex-col items-end">
          <motion.button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-lg font-semibold" onClick={() => (index < SLIDES.length - 1 ? setIndex((i) => i + 1) : handleGoogleLogin())}>
            {index === SLIDES.length - 1 ? "구글 계정으로 시작하기" : "다음"}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

