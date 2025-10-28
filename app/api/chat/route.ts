import { NextRequest, NextResponse } from "next/server";
import {Content, GoogleGenerativeAI, Part} from "@google/generative-ai"; // Part 타입 임포트
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // 1. 클라이언트로부터 'history'를 직접 받음
    const { userId, history, persona, currentPhotoMetadata, prompt } = await req.json();

    // 2. history의 마지막 메시지를 현재 메시지로 간주
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: "Invalid history" }, { status: 400 });
    }
    const messageContent = lastMessage.parts[0].text;

    const supabase = createClient();

    // 4. Gemini 모델 생성 (동일)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        role: "model",
        parts: [
          { text: `너의 이름은 ${persona.display_name}이고, 너는 ${persona.role}이야. ${persona.tone}의 말투로 말해주고, ${persona.prompt}.[이미지 분석 결과] 라고 써 있으면 사용자가 사진을 올리고 분석한 결과니까 기반해서 철저하게 분석 답변해.${currentPhotoMetadata && `최신 사진 분석 결과:${currentPhotoMetadata}`}` },
          { text: prompt }
        ]
      },
    });

    console.log(history);

    const chat = model.startChat();

    // 7. 마지막 메시지(현재 메시지) 전송
    const result = await chat.sendMessage(messageContent);
    const reply = result.response.text();

    // 8. DB 로그 저장 (동일)
    const inserts = [
      {
        user_id: userId ?? null,
        persona_name: persona.name,
        role: "user",
        content: messageContent,
        type: "ANALYZE"
      },
      {
        user_id: userId ?? null,
        persona_name: persona.name,
        role: "assistant",
        content: reply,
        type: "ANALYZE"
      },
    ];

    await supabase.from("conversations").insert(inserts);

    // 9. 응답 반환 (동일)
    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("❌ Chat API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}