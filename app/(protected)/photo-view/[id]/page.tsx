"use client"

import {use, useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/supabaseClient";
import Image from "next/image";
import {useRouter} from "next/navigation";

function flattenObject(
  obj: any,
  parentKey: string = '',
  result: Record<string, any> = {}
): Record<string, any> {

  // 객체의 모든 키를 순회합니다.
  for (const key in obj) {
    // 객체가 직접 소유한 속성인지 확인합니다.
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 새로운 키 이름을 생성합니다 (예: "Cloth" + "_" + "top_wear")
      // parentKey가 없는 최상위 레벨에서는 키 이름이 그대로 사용됩니다.
      const newKey = parentKey ? `${parentKey}_${key}` : key;

      const value = obj[key];

      // 값이 객체이고, null이 아니며, 배열이 아닌 경우에만 재귀 호출
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 더 깊은 레벨로 재귀합니다.
        flattenObject(value, newKey, result);
      } else {
        // 값이 기본형(string, number)이거나 배열, null이면 결과에 바로 할당
        result[newKey] = value;
      }
    }
  }

  return result;
}

export default function PersonaChat({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [photoUrl, setPhotoUrl] = useState<string|null>(null);
  const [metadata, setMetadata] = useState<object|null>(null);
  const router = useRouter();

  const supabase = createClient();
  const SIGNED_URL_EXPIRES_IN = 60;

  useEffect(() => {
    const fetchPhotoUrl = async () => {
      const { data: urlData, error: urlError } = await supabase.storage
        .from("photos")
        .createSignedUrl(id.replaceAll("**", "/"), SIGNED_URL_EXPIRES_IN);

      if (urlError || !urlData) {
        console.error("Signed URL 생성 실패:", id, urlError);
        return;
      }
      setPhotoUrl(urlData.signedUrl);
    }
    fetchPhotoUrl();
  }, []);

  useEffect(() => {
    if (!metadata) {
      (async() => {
        const { data, error } = await supabase
          .from("photos")
          .select("metadata")
          .eq("photo", id.replaceAll("**", "/"))
          .maybeSingle()

        if (data) {
          const cleanedString = data.metadata
            .replace("```json", "")
            .replace("```", "")
            .replace("[이미지 분석 결과]:", "")
            .trim();
          const json = JSON.parse(cleanedString);
          setMetadata(flattenObject(json));
        }
      })();
    }
  }, [photoUrl]);

  return <div className={"w-full h-full bg-gray-950 relative overflow-y-scroll"}>
    <button className={"fixed w-14 h-14 bg-white/50 rounded-full left-10 top-10 z-10"} onClick={() => router.back()}>
      <Image src={"/chat/arrow-left.svg"} alt={""} fill className={"object-cover p-3"}/>
    </button>
    <div className={"w-full h-full relative"}>
      { photoUrl && <Image src={photoUrl} alt={""} fill className={"w-full object-contain"} /> }
    </div>
    <div className={"absolute bottom-10 w-full flex flex-col items-center space-y-2.5"}>
      <p className={"font-bold text-white/30 text-sm"}>사진 정보 보기</p>
      <Image src={"/photo-view/chevron-down.svg"} alt={""} width={50} height={50} />
    </div>
    <div className={"w-full text-white flex flex-col space-y-5 p-10"}>
      <p className={"text-xl text-white font-semibold mb-10"}>사진 정보</p>
      { metadata &&
        Object.entries(metadata).map(([key, value]) => (
          <div key={key} className={"flex space-x-2.5 wrap-break-word"}>
            <p className={"w-32 text-sm font-medium"}>{key}</p>
            <p className={"flex-1 text-white/60 text-sm"}>{typeof value === "string" ? String(value) : "-"}</p>
          </div>
        ))
      }
    </div>
  </div>
}