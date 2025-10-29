"use client";

import React, { use, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
// 💡 createClient 대신 useSupabaseClient 훅을 사용합니다.
import {
  useUser,
  useSupabaseClient,
} from "@/context/SupabaseProvider";
import Camera from "@/components/Camera";
import { useRouter } from "next/navigation";
import { Persona } from "@/model/Persona";
import { motion } from "framer-motion";
import {PhotoChatCard} from "@/app/(protected)/(chat)/chat/[persona]/components/PhotoChatCard";
import {TextChatCard} from "@/app/(protected)/(chat)/chat/[persona]/components/TextChatCard";
import {LoadingIndicatorChat} from "@/app/(protected)/(chat)/chat/[persona]/components/LoadingIndicatorChat";
import {BottomChat} from "@/app/(protected)/(chat)/chat/[persona]/components/BottomChat";
import {PutBlobResult} from "@vercel/blob";
import {FetchResponseType} from "@/app/(protected)/(chat)/chat/[persona]/type/fetchResponseType";
import {
  fetchChatAnalyzePrompt,
  fetchChatInitPrompt,
  fetchPhotoPrompt
} from "@/app/(protected)/(chat)/chat/[persona]/utils/fetchChatPrompt";
import {fetchPersonaAvatar} from "@/app/(protected)/(chat)/chat/[persona]/utils/fetchPersonaAvatar";
import {ChatType} from "@/app/(protected)/(chat)/chat/[persona]/type/chat";
import Header from "@/app/(protected)/(chat)/chat/[persona]/components/Header";

type HistoryPart = {
  role: "user" | "model";
  parts: [{ text: string }];
};

type QuestionCard = {
  question: string;
  answer: string[];
}

export default function PersonaChat({
                                      params,
                                    }: {
  params: Promise<{ persona: string }>;
}) {
  const { persona } = use(params);
  const { user } = useUser();

  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [photoPrompt, setPhotoPrompt] = useState("");
  const [chatInitPrompt, setChatInitPrompt] = useState("");
  const [chatAnalyzePrompt, setChatAnalyzePrompt] = useState("");
  const [personaCharacter, setPersonaCharacter] = useState<Persona | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pageState, setPageState] = useState<"DEFAULT" | "CAMERA">("DEFAULT");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [history, setHistory] = useState<HistoryPart[]>([]);
  const [card, setCard] = useState<QuestionCard | null>(null);
  const [currentPhotoMetadata, setCurrentPhotoMetadata] = useState<string | null>(null);
  const [hasFetchedMessages, setHasFetchedMessages] = useState(false);
  const [photoLoadingStatus, setPhotoLoadingStatus] = useState("");

  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    const response = await fetch(
      `/api/upload?filename=${file.name}`,
      {
        method: 'POST',
        body: file,
      }
    );

    const newBlob = (await response.json()) as PutBlobResult;
    setBlob(newBlob);
  };

  useEffect(() => { // '분석 채팅 답변 생성' 프롬프트 불러오기
    fetchChatAnalyzePrompt(supabase).then((response: FetchResponseType | undefined) => {
      if (response) {
        if (response.status === "success") setChatAnalyzePrompt(response.message);
      }
    });
  }, []);

  useEffect(() => { // '사진 분석' 프롬프트 불러오기
    fetchPhotoPrompt(supabase).then((response: FetchResponseType | undefined) => {
      if (response) {
        if (response.status === "success") setPhotoPrompt(response.message);
      }
    });
  }, [supabase]);

  useEffect(() => { // '채팅 분석' 프롬프트 불러오기 (ANALYZE | CHAT)
    fetchChatInitPrompt(supabase).then((response: FetchResponseType | undefined) => {
      if (response) {
        if (response.status === "success") setChatInitPrompt(response.message);
      }
    });
  }, []);

  useEffect(() => {
    fetchPersonaAvatar(supabase, persona).then((response: FetchResponseType | undefined) => {
      if (response) {
        if (response.status === "success") setPersonaCharacter(response.message);
        console.log(response.message);
      }
    })
  }, [persona, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages, loading]);

  useEffect(() => {
    const histories: HistoryPart[] = messages.map((message) => {
      return {
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
      }
    });
    setHistory(histories)
  }, [messages]);

  useEffect(() => {
    const SIGNED_URL_EXPIRES_IN = 60;

    const fetchMessages = async () => {
      const formattedInitMessage: ChatType = { type: "CHAT", role: "persona", content: personaCharacter!.init_message!, photo: null };

      const { data, error } = await supabase
        .from("conversations")
        .select("role, content, type, photo")
        .eq("user_id", user?.id)
        .eq("persona_name", persona);

      if (error) {
        console.error("error", error, user?.id);
        setMessages([{ role: "persona", content: personaCharacter!.init_message!, type: "CHAT", photo: null }]);
        setHasFetchedMessages(true);
        return;
      }

      if (data) {
        const photoMessages: ChatType[] = data.filter((d) => d.type === "PHOTO" && d.photo);
        const signedUrlPromises = photoMessages.map((d) =>
          supabase.storage
            .from("photos")
            .createSignedUrl(d.photo!, SIGNED_URL_EXPIRES_IN)
        );
        const signedUrlResults = await Promise.all(signedUrlPromises);

        const urlMap = new Map<string, string | null>();
        signedUrlResults.forEach((result, index) => {
          const originalPath = photoMessages[index].photo;
          if (result.error || !result.data) {
            console.error("Signed URL 생성 실패:", originalPath, result.error);
            urlMap.set(originalPath!, null);
          } else {
            urlMap.set(originalPath!, result.data.signedUrl);
          }
        });

        // 메시지 배열 생성

        console.log("data", data);

        let mes: ChatType[] = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].type === "PHOTO") {
            const signedUrl = urlMap.get(data[i].photo);
            if (signedUrl) {
              mes.push({ type: "PHOTO", role: "user", content: data[i].content, photo: signedUrl });
            } else {
              mes.push({ type: "PHOTO", role: "user", content: data[i].content, photo: "/placeholder.png" });
            }
          } else {
            if (data[i].role === "user") {
              mes.push({ type: "CHAT", role: "user", content: data[i].content, photo: null });
            } else {
              if (data[i].type === "ANALYZE") {
                const cleanedString = data[i].content
                  .replaceAll("```json", "")
                  .replaceAll("`", "")
                  .trim();
                const finalJsonObject = JSON.parse(cleanedString);
                const resultArray: ChatType[] = Object.entries(finalJsonObject).filter(([key, value]) => value != "").map(([key, value]) => {
                  return { type: "CHAT", role: "persona", content: `deep_chat__${key}__${value}`, photo: null }
                });
                mes = [...mes, ...resultArray];
              } else {
                mes.push({ type: "CHAT", role: "persona", content: data[i].content, photo: null });
              }
            }
          }
        }

        // 💡 2. (수정) 포맷된 init 메시지와 함께 설정
        const allMessages = [formattedInitMessage, ...mes];
        setMessages(allMessages);

        // History 설정
        // setHistory(
        //   allMessages
        //     .slice(Math.max(allMessages.length - 5, 0)) // 음수 인덱스 방지
        //     .filter((m: ChatType) => m.role === "user" || m.role === "persona")
        //     .map((m: ChatType) => {
        //       return {
        //         role: "user",
        //         parts: [{ text: m.content }],
        //       } as HistoryPart;
        //     })
        // );

        const photosMetadata = mes.filter((m) => m.type === "PHOTO");
        console.log(mes, photosMetadata)
        if (photosMetadata.length > 0) {
          setCurrentPhotoMetadata(photosMetadata[photosMetadata.length - 1].content);
        }
      } else {
        // 데이터가 null일 경우
        setMessages([formattedInitMessage]);
      }

      setHasFetchedMessages(true); // 💡 3. 실행 완료로 표시
    };

    // 💡 4. (수정) user, personaCharacter가 있고, *아직 실행되지 않았을 때*만 실행
    if (personaCharacter && user && !hasFetchedMessages) {
      console.log("fetch messages");
      fetchMessages();
    }

    // 💡 5. (수정) 의존성 배열에서 messages.length 제거
  }, [personaCharacter, user, persona, supabase, hasFetchedMessages]);

  // 💡 🚀 useCallback으로 함수를 메모이제이션합니다.
  const sendPhoto = useCallback(
    async (photo: string) => {
      setCurrentPhotoMetadata(null);
      setMessages((m) => [...m, { type: "PHOTO", role: "user", content: "", photo: photo }]);
      // setCard({
      //   question: "어떤 스타일을 입어야 할지 모르겠나요?",
      //   answer: ["잘 알고 있어요!", "모르겠어요..."]
      // });

      const response = await fetch("/api/chat_photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: personaCharacter,
          photo: photo, // 💡 그냥 전달
          prompt: photoPrompt,
        }),
      });

      if (!response.body) {
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedChunks = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedChunks += decoder.decode(value, { stream: true });
        const lines = accumulatedChunks.split('\n');
        accumulatedChunks = lines.pop() || '';
        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const update = JSON.parse(line);
            if (update.status === 'uploading') {
              setPhotoLoadingStatus(update.message);
            }
            if (update.status === 'complete') {
              const jsonObject = update.message;
              console.log(jsonObject);
              if (!jsonObject) throw new Error("cannot fetch photo analyze result.")
              const cleanedString = jsonObject
                .replaceAll("```json", "")
                .replaceAll("`", "")
                .trim();
              const finalJsonObject = JSON.parse(cleanedString);
              setCurrentPhotoMetadata(finalJsonObject.summary);
            }
          } catch (e) {
            console.error('Stream parsing error:', e, line);
          }
        }
      }
    },
    [personaCharacter, photoPrompt, supabase] // 💡 supabase 의존성 추가
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // const newHistory: HistoryPart[] = [
    //   ...history,
    //   { role: "user", parts: [{ text: input }] },
    // ];
    // setHistory(newHistory);
    setMessages((m) => [...m, { type: "CHAT", role: "user", content: input, photo: null }]);
    const newHistory = { role: "user", parts: [{ text: input }]};
    setLoading(true);

    setInput("");

    // const resInit = await fetch("/api/chat_init", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     history: newHistory,
    //     prompt: chatInitPrompt
    //   })
    // });

    console.log("history", [...history, newHistory]);

    const resInit = await fetch("/api/chat_init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: [...history, newHistory],
        prompt: chatInitPrompt
      })
    });

    const dataInit = await resInit.json();
    const reply = dataInit.reply;
    const cleanedString = reply
      .replaceAll("```json", "")
      .replaceAll("`", "")
      .trim();
    const finalJsonObject = JSON.parse(cleanedString);
    console.log(finalJsonObject.type)
    // if (finalJsonObject.type === "ANALYZE") {
    //   const res = await fetch("/api/chat", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       prompt: chatAnalyzePrompt,
    //       persona: personaCharacter,
    //       userId: user?.id,
    //       history: newHistory,
    //       currentPhotoMetadata: currentPhotoMetadata,
    //     }),
    //   });

      if (finalJsonObject.type === "ANALYZE") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: chatAnalyzePrompt,
            persona: personaCharacter,
            userId: user?.id,
            history: history,
            currentPhotoMetadata: currentPhotoMetadata,
          }),
        });

      const data = await res.json();
      const reply = data.reply;
      const cleanedString = reply
        .replaceAll("```json", "")
        .replaceAll("`", "")
        .trim();
      const finalJsonObject = JSON.parse(cleanedString);
      const resultArray: ChatType[] = Object.entries(finalJsonObject).filter(([key, value]) => value != "").map(([key, value]) => {
        return { type: "CHAT", role: "persona", content: `deep_chat__${key}__${value}`, photo: null }
      });
      setLoading(false);

      if (data.reply) setMessages((m) => [...m, ...resultArray]);
    } else {
      // const res = await fetch("/api/light_chat", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     persona: personaCharacter,
      //     userId: user?.id,
      //     history: newHistory,
      //   }),
      // });

        const res = await fetch("/api/light_chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            persona: personaCharacter,
            userId: user?.id,
            history: [...history, newHistory],
          }),
        });

      const data = await res.json();
      setLoading(false);
      if (data.reply) setMessages((m) => [...m, { type: "CHAT", role: "persona", content: data.reply, photo: null }]);
    }
  }, [input, history, personaCharacter, user, currentPhotoMetadata, supabase]);

  // ======================================================================
  // 6. JSX 렌더링
  // ======================================================================
  return pageState === "DEFAULT" ? (
      <div className="flex flex-col h-dvh mx-auto relative">
        {
          card && <div className={"bg-black/30 w-full h-full absolute top-0 left-0 z-40 "}></div>
        }
        {
          card && <motion.div
            initial={{ top: "-100%" }}
            animate={{ top: 0 }}
            className={"absolute z-50 w-full h-full flex items-center justify-center"}>
            <div
              className={"bg-white w-[80%] h-fit p-10 rounded-2xl flex-col"}>
              <div className={"text-blue-700 font-bold text-xl"}>Q.</div>
              <p className={"break-keep font-semibold"}>{card.question}</p>
              <div className={"flex flex-col space-y-2.5 mt-10"}>
                {
                  card.answer.map((ans, i) => <button onClick={() => {
                    // todo: 서버로 전송.
                    setCard(null);
                  }} key={i} className={"p-3 border border-gray-300 rounded-full hover:bg-gray-100 text-sm"}>{ans}</button> )
                }
              </div>
            </div>
          </motion.div>
        }
        <Header personaCharacter={personaCharacter} />

        {/* 대화 영역 */}
        <div className="flex-1 overflow-y-auto p-3 bg-blue-200 flex flex-col space-y-5">
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            const isPhoto = m.type === "PHOTO";

            return (
              <div
                key={i}
                className={`w-full flex items-start ${
                  isUser || isPhoto ? "justify-end" : "justify-start"
                }`}
              >
                {isPhoto ? (
                  <PhotoChatCard
                    text={m.photo ? m.photo : ""} // URL
                    metadata={m.content}
                    current={i === messages.length - 1}
                    photoLoading={photoLoading}
                    currentPhotoMetadata={currentPhotoMetadata}
                    photoLoadingStatus={photoLoadingStatus}
                  />
                ) : (
                  <TextChatCard
                    isUser={isUser}
                    personaCharacter={personaCharacter}
                    text={m.content}
                  />
                )}
              </div>
            );
          })}
          {loading && !photoLoading && (
            <LoadingIndicatorChat
              persona={persona}
              personaCharacter={personaCharacter}
            />
          )}
          <div ref={bottomRef} />
        </div>

        {/* 하단 입력창 */}
        <BottomChat
          loading={loading}
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          setPageState={setPageState}
          handleSubmit={handleSubmit}
          setFile={setFile}
        />
      </div>
    ) : // ==================================================================
    // 카메라 UI (변경 없음)
    // ==================================================================
    pageState === "CAMERA" ? (
      !photo ? (
        <div
          className={"w-full h-full bg-gray-100 flex justify-center relative"}
        >
          <div
            className={
              "w-14 aspect-square absolute top-5 left-5 bg-white/10 z-50 rounded-full flex items-center justify-center text-white cursor-pointer"
            }
            onClick={() => {
              setPageState("DEFAULT");
              setPhoto(null);
            }}
          >
            <Image
              src={"/calculate/arrow-left.svg"}
              width={20}
              height={20}
              alt={""}
            />
          </div>
          <Camera photo={photo} setPhoto={setPhoto} />
        </div>
      ) : (
        <div className={"w-full h-full bg-black flex items-center relative"}>
          <div
            className={
              "w-14 aspect-square absolute top-5 left-5 bg-white/10 z-50 rounded-full flex items-center justify-center text-white cursor-pointer"
            }
            onClick={() => {
              setPageState("DEFAULT");
              setPhoto(null);
            }}
          >
            <Image
              src={"/calculate/arrow-left.svg"}
              width={20}
              height={20}
              alt={""}
            />
          </div>
          <img
            src={photo}
            alt="Captured"
            className="w-full h-fit object-contain sticky"
          />
          <div
            className={"flex space-x-2.5 absolute bottom-10 font-medium w-full"}
          >
            <button
              className={
                "flex-1 w-full h-14 flex items-center justify-center bg-gray-900 text-white rounded-full"
              }
              onClick={() => setPhoto(null)}
            >
              다시 촬영
            </button>
            <button
              className={
                "flex-1 w-full h-14 flex items-center justify-center bg-white text-black rounded-full"
              }
              onClick={async () => {
                setPageState("DEFAULT");
                setLoading(true);
                setPhotoLoading(true);
                await sendPhoto(photo);
                setPhoto(null);
                setPhotoLoading(false);
                setLoading(false);
              }}
            >
              사진 올리기
            </button>
          </div>
        </div>
      )
    ) : (
      <></>
    );
}