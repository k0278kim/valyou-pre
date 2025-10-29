import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai"; // Added Content
import { createClient } from "@/utils/supabase/server";
// Removed browser-image-compression
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendJsonUpdate = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        // Assume persona object is sent for now, but fetching server-side is better
        const { persona, photo, prompt } = await req.json();
        const supabase = createClient();

        // --- Authentication Check ---
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        sendJsonUpdate({ status: "uploading", message: "사용자 위변조 확인 중..." });

        if (authError || !user) {
          console.error("Authentication Error:", authError);
          // Send specific error via stream before closing
          sendJsonUpdate({ status: "error", message: "Authentication failed." });
          controller.error(new Error("Unauthorized: User not authenticated."));
          return; // Stop execution
        }
        console.log("✅ API 인증 성공: 사용자 ID:", user.id);
        // --- End Auth Check ---

        // Check if persona object exists (basic check)
        if (!persona || !persona.name) {
          sendJsonUpdate({ status: "error", message: "Persona data missing or invalid." });
          controller.error(new Error("Invalid persona data received."));
          return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash", // Or your preferred model
          systemInstruction: {
            role: "model",
            // Ensure `prompt` is actually the system instruction string
            parts: [{ text: prompt || "Analyze the image." }],
          },
        });

        // --- Helper Functions ---
        function dataURLtoBlob(dataUrl: string): Blob {
          const arr = dataUrl.split(",");
          if (arr.length < 2) throw new Error("Invalid data URL");
          const mimeMatch = arr[0].match(/:(.*?);/);
          if (!mimeMatch || mimeMatch.length < 2) throw new Error("Invalid data URL: MIME type not found");
          const mime = mimeMatch[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          return new Blob([u8arr], { type: mime });
        }

        function parseDataUrl(dataUrl: string): Part {
          const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
          if (!match) throw new Error("Invalid data URL format");
          return { inlineData: { data: match[2], mimeType: match[1] } };
        }
        // --- End Helper Functions ---

        const photoBlob = dataURLtoBlob(photo);
        // Correctly get buffer from Blob
        const photoBuffer = Buffer.from(await photoBlob.arrayBuffer());

        const chat = model.startChat(); // Keep chat history if needed later?
        const randomUUID = crypto.randomUUID();

        sendJsonUpdate({ status: "uploading", message: "이미지 압축 중..." });
        const compressedImageBuffer = await sharp(photoBuffer)
          .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const fileExt = "webp";
        // Use non-nullable user.id
        const filePath = `${user.id}/${randomUUID}.${fileExt}`;

        sendJsonUpdate({ status: "uploading", message: "사진을 서버에 업로드 중이에요." });
        const { data: storageData, error: storageError } = await supabase.storage
          .from("photos") // Ensure this bucket exists and has correct policies
          .upload(filePath, compressedImageBuffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/webp", // Specify content type
          });

        if (storageError) {
          console.error("Storage Upload Error:", storageError);
          sendJsonUpdate({ status: "error", message: `Storage upload failed: ${storageError.message}` });
          throw storageError; // Let the main catch handle controller.error
        }
        const uploadedPath = storageData?.path;
        if (!uploadedPath) {
          sendJsonUpdate({ status: "error", message: "Storage upload failed to return path." });
          throw new Error("Storage upload failed to return path.");
        }


        sendJsonUpdate({ status: "uploading", message: "사진을 분석하고 있어요." });
        // Analyze the ORIGINAL photo for best quality
        const result = await chat.sendMessage([parseDataUrl(photo)]);
        const reply = result.response.text(); // This is the JSON string from Gemini

        // --- Save to 'photos' table ---
        const insertDataPhotos = {
          // Add user_id if your table requires it and RLS depends on it
          user_id: user.id,
          // Store the raw JSON string? Or parse first? Storing raw is simpler now.
          metadata: reply.replace("```json", "").replace("```", "").trim(),
          photo: uploadedPath, // Use the path returned by storage upload
        };

        sendJsonUpdate({ status: "uploading", message: "사진 메타데이터를 저장 중이에요." });
        const { data: uploadData, error: uploadError } = await supabase
          .from("photos") // Ensure this table exists and has correct policies
          .insert([insertDataPhotos])
          .select(); // Good practice to select

        // Correct Error Check
        if (uploadError) {
          console.error("Photos DB Insert Error:", uploadError);
          sendJsonUpdate({ status: "error", message: `Failed to save photo metadata: ${uploadError.message}` });
          throw uploadError;
        }
        // --- End Save to 'photos' ---


        // --- Save to 'conversations' table ---
        sendJsonUpdate({ status: "uploading", message: "대화 정보를 저장하고 있어요." });
        const insertChatData = {
          user_id: user.id, // Use non-nullable user.id
          persona_name: persona.name, // Assumes client sent valid persona object
          role: "user", // Log the *analysis* as if it's user content? Or system? 'user' seems odd.
          photo: uploadedPath,
          type: "PHOTO",
          // Store the analysis result associated with this user action
          content: "[이미지 분석 결과]:" + reply.replace("```json", "").replace("```", "").trim(),
        };

        const { data: chatUploadData, error: chatUploadError } = await supabase
          .from("conversations") // Ensure this table exists and has correct policies
          .insert([insertChatData])
          .select();

        // Correct Error Check
        if (chatUploadError) {
          console.error("Conversations DB Insert Error:", chatUploadError);
          sendJsonUpdate({ status: "error", message: `Failed to save conversation: ${chatUploadError.message}` });
          throw chatUploadError;
        }
        // --- End Save to 'conversations' ---

        // Send final analysis result back
        sendJsonUpdate({ status: "complete", message: reply });
        controller.close();

      } catch (err: any) {
        console.error("❌ Chat API Error:", err);
        // Ensure error is sent before closing if not already sent
        if (!controller.desiredSize) { // Check if stream is still open
          try { // Avoid errors if already closed/errored
            sendJsonUpdate({ status: "error", message: `An unexpected error occurred: ${err.message}` });
          } catch {}
        }
        controller.error(err); // Signal error to the reader
      }
    },
  });

  return new Response(stream, {
    // Use application/x-ndjson for newline-delimited JSON
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}