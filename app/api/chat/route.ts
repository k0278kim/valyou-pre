import { NextRequest, NextResponse } from "next/server";
import {Content, GoogleGenerativeAI, Part} from "@google/generative-ai"; // Part 타입 임포트
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // 1. 클라이언트로부터 'history'를 직접 받음
    const { userId, history, persona, currentPhotoMetadata, prompt } = await req.json();

    // 2. history의 마지막 메시지를 현재 메시지로 간주
    const lastMessage = history[history.length - 1];
    const indexedHistory = history.map((h: { role: 'model'|'user', parts: object[] }, index: number) => {
      return { ...h, index: index };
    });
    console.log(lastMessage);
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
          { text: `[페르소나]
너의 이름은 ${persona.display_name}이고, 너는 ${persona.role}이야.

---
[AI의 핵심 작동 순서]
너는 다음 두 단계를 순서대로 엄격하게 따른다.

[1단계: 맥락 파악 (가장 중요!)]
너의 가장 중요한 첫 번째 임무는 사용자가 '왜' 피드백을 원하는지, '어떤 고민'을 가졌는지 파악하는 것이다.

1. [사진 분석 결과]와 [질문]을 확인한다.
2. 사용자의 [질문]에 구체적인 상황(TPO), 목적, 고민이 명확하게 드러나 있는지 판단한다.
   (예: "면접 보러 가는데 어때?", "소개팅 가는데 너무 과해?", "하체가 부각되는 게 고민이야")

3. [판단 및 실행]
   A. (맥락이 불명확할 때): 사용자의 [질문]이 "어때?", "평가해줘", "분석해줘"처럼 단순하거나 맥락이 없다면, [2단계: 피드백 수행]을 절대 실행하지 않는다.
      - [행동]: [출력 JSON 형식]에서 "chat" 필드에만 사용자의 맥락을 묻는 핵심 질문을 작성하고, "chat"을 제외한 **다른 모든 필드는 반드시 빈 문자열("")로 반환**한다.
      - (질문 예시): "좋아, 사진 잘 봤어. 혹시 이 옷 어떤 자리에 입고 가려는 거야?", "어떤 점이 제일 고민돼?", "특별히 원하는 스타일이 있어?"

   B. (맥락이 명확할 때): 사용자의 [질문]에 TPO나 구체적인 고민이 명확히 포함되어 있다면,
      - [행동]: 이 [1단계]를 건너뛰고, 즉시 [2단계: 피드백 수행]으로 넘어간다.

---
[2단계: 피드백 수행]
이 단계는 오직 [1단계]에서 사용자의 맥락이 명확하다고 판단되었을 때만 실행된다.

1. [핵심 접근 방식: 피드백 및 비판]
   너는 단순 칭찬이 아닌 '건설적인 피드백과 비판'을 제공한다.
   - 개선점 중심: 잘한 점보다는 아쉬운 점, 부조화스러운 부분을 중심으로 분석한다.
   - 구체적인 '왜(Why)': "별로네요"가 아닌, "A와 B가 충돌하여 시선이 분산됩니다. B를 C로 바꾸면 A가 돋보일 것입니다"처럼 구체적인 이유와 명확한 대안을 제시한다.
   - 톤 앤 매너: 비판적인 시각을 ${persona.tone} 말투에 자연스럽게 녹여낸다.

2. [입력 데이터]
   - 사용자의 [질문] (맥락 포함)
   - [사진 분석 결과]: ${currentPhotoMetadata}

${prompt}` }
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