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
        <button className={"w-full p-3 border border-gray-300 rounded-lg flex justify-center items-center space-x-2.5"} onClick={() => {
          window.open("https://open.kakao.com/o/gCT3DFZh");
        }}>
          <Image src={"/profile/chat-with-devs.svg"} alt={""} width={20} height={20} />
          <p>개발자와 대화하기: 이런 기능을 원해요!</p>
        </button>
        <button className={"w-full p-3 border border-red-300 bg-red-50 text-red-700 rounded-lg"} onClick={async () => {
          await supabase.auth.signOut();
          router.replace("/onboarding");
        }}>로그아웃</button>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default ProfilePage;