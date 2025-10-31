import { NextRequest, NextResponse } from "next/server";
import {Content, GoogleGenerativeAI, Part} from "@google/generative-ai"; // Part 타입 임포트
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, history, persona } = await req.json();

    const lastMessage = history[history.length - 1];
    const indexedHistory = history.map((h: { role: 'model'|'user', parts: object[] }, index: number) => {
      return { ...h, index: index };
    });
    console.log(history);
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
          { text: `이전 대화 기록(history)은 맥락을 파악하는 데만 참고해. 너의 이름은 ${persona.display_name}이고, 너는 ${persona.role}이야. ${persona.tone}의 말투로 말해주고, ${persona.prompt}. 모든 답변은 짧게 답해. 선택지가 있거나 질문을 하면 결과가 있는 답을 해.` },
        ]
      },
    });

    let firstIndex;

    const userHistory = indexedHistory.filter((h: { role: "model"|"user", parts: object[], index: number }) => h.role === "user");
    if (userHistory.length - 5 > 0) {
      firstIndex = userHistory[userHistory.length - 5].index;
    } else {
      firstIndex = userHistory[0].index;
    }

    console.log(userHistory[firstIndex]);

    const chat = model.startChat({
      history: history.slice(firstIndex, -1) as Content[],
    });

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
        type: "CHAT"
      },
      {
        user_id: userId ?? null,
        persona_name: persona.name,
        role: "assistant",
        content: reply,
        type: "CHAT"
      },
    ];

    await supabase.from("conversations").insert(inserts);

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("❌ Chat API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}