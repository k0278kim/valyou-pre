import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai"; // Part 타입 임포트
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { persona, photo, prompt } = await req.json();
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        role: "model",
        parts: [
          { text: prompt }
        ]
      },
    });

    function dataURLtoBlob(dataUrl: string): Blob {
      const arr = dataUrl.split(',');
      if (arr.length < 2) {
        throw new Error('Invalid data URL');
      }
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch || mimeMatch.length < 2) {
        throw new Error('Invalid data URL: MIME type not found');
      }
      const mime = mimeMatch[1]; // 예: "image/png"
      const bstr = atob(arr[1]); // Base64 디코딩
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }

    function parseDataUrl(dataUrl: string): Part {
      const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) throw new Error("Invalid data URL format");
      return { inlineData: { data: match[2], mimeType: match[1] } };
    }

    const photoBlob = dataURLtoBlob(photo);
    const chat = model.startChat();
    const randomUUID = crypto.randomUUID();

    const fileExt = photoBlob.type.split('/')[1] || 'png'; // MIME 타입에서 확장자 추출
    const filePath = `${user?.id}/${randomUUID}.${fileExt}`;

    console.log("✅ API 인증 성공: 사용자 ID:", user?.id);

    // 3. Supabase Storage에 Blob 업로드
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(filePath, photoBlob, { // 변환된 Blob 객체 전달
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 7. 마지막 메시지(현재 메시지) 전송
    const result = await chat.sendMessage([parseDataUrl(photo)]);
    const reply = result.response.text();
    console.log(reply);

    const insertData = {
      metadata: reply.replace("```json", "").replace("```", ""),
      photo: data?.path,
    }

    const { data: uploadData, error: uploadError } = await supabase
      .from("photos")
      .insert([insertData])
      .select()

    if (error) {
      throw uploadError;
    }

    const insertChatData = {
      persona_name: persona.name,
      role: 'user',
      photo: data?.path,
      type: "PHOTO",
      content: "[이미지 분석 결과]:"+reply.replace("```json", "").replace("```", "")
    }

    const { data: chatUploadData, error: chatUploadError } = await supabase
      .from("conversations")
      .insert([insertChatData])
      .select()

    if (error) {
      throw uploadError;
    }

    // TODO: 사진을 통해 얻은 데이터를 분류해서, 이미지/사용자 메타데이터로 각각 데이터 분석 보내기.

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("❌ Chat API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}