"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useSupabaseClient } from "@/context/SupabaseProvider";
const SIGNED_URL_EXPIRES_IN = 60;

export type PhotoType = {
  id: number;
  created_at: string;
  metadata: string;
  photo: string;
  user_id: string;
};

export type PhotoTypeWithSignedUrl = PhotoType & {
  signedUrl: string;
};

export type PhotoCardType = {
  photo: PhotoTypeWithSignedUrl;
};

const ProfilePage = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();

  return <div
      className={
        "w-full h-full flex flex-col px-5 space-y-10 relative mb-20"
      }
    >
      <div className={"flex flex-col space-y-2.5"}>
        <p className={"mt-10 mb-5 font-bold"}>성장을 도와주세요!</p>
        <button className={"w-full border border-gray-200 rounded-lg flex flex-col justify-center items-center"} onClick={() => {
          window.open("https://open.kakao.com/o/sPpbZKZh");
        }}>
          <div className={"w-full h-44 relative border-b border-gray-200"}>
            <Image src={"/profile/openchat-banner.png"} alt={""} fill className={"object-contain rounded-2xl"} />
          </div>
          <p className={"font-bold pt-3"}>개발자와 대화하기</p>
          <p className={"text-sm pb-3"}>개발자의 카카오톡 오픈채팅방으로 연결됩니다.</p>
        </button>
      </div>
    </div>
};

export default ProfilePage;