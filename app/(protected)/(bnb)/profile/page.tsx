"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useSupabaseClient } from "@/context/SupabaseProvider";
import {PhotoCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoCard";
import {PhotoEmptyCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoEmptyCard";
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
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();

  return user ? (
    <div
      className={
        "w-full h-full flex flex-col px-5 space-y-10 relative mb-20"
      }
    >
      <div className={"flex space-x-5 items-center mt-20"}>
        <div className={"w-28 aspect-square rounded-full relative"}>
          {user?.user_metadata.avatar_url &&
          user.user_metadata.full_name ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name}
              className={"object-cover rounded-full bg-gray-200"}
              fill
            />
          ) : (
            <></>
          )}
        </div>
        <div className={"flex flex-col space-y-2.5"}>
          <p className={"font-bold text-xl"}>
            {user.user_metadata.full_name?.toString()}
          </p>
        </div>
      </div>
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
        <p className={"mt-10 mb-5 font-bold"}>계정</p>
        <button className={"w-full p-3 border border-gray-200 bg-white rounded-lg font-medium"} onClick={async () => {
          await supabase.auth.signOut();
          router.replace("/onboarding");
        }}>계정 로그아웃</button>
        <button className={"w-full p-3 border border-red-200 bg-red-50 text-red-800 font-medium rounded-lg"} onClick={async () => {
          const confirm = window.confirm("정말 탈퇴할까요?");
          if (confirm) {
            const { data, error } = await supabase.from("profiles")
              .update({ status: "LEAVE" })
              .eq("id", user?.id)
            if (error) console.error(error);
            router.replace("/onboarding");
          }
        }}>탈퇴하기</button>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default ProfilePage;