import { NextRequest, NextResponse } from "next/server";
import {Content, GoogleGenerativeAI, Part} from "@google/generative-ai"; // Part 타입 임포트

export async function POST(req: NextRequest) {
  try {
    const { history, prompt } = await req.json();

    // 4. Gemini 모델 생성 (동일)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    console.log(prompt, history);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        role: "model",
        parts: [
          { text: prompt },
        ]
      },
    });

    const chat = model.startChat();
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: "Invalid history" }, { status: 400 });
    }
    const messageContent = lastMessage.parts[0].text;

    // 7. 마지막 메시지(현재 메시지) 전송
    const result = await chat.sendMessage(messageContent);
    const reply = result.response.text();

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("❌ Chat API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}