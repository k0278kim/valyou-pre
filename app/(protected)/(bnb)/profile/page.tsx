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
        "w-full h-full flex flex-col px-5 space-y-5 relative mb-20"
      }
    >
      <div className={"w-full flex justify-end mt-5"}>
        <Image
          src={"/home/logout.svg"}
          alt={""}
          className={"cursor-pointer duration-100 active:scale-90"}
          width={25}
          height={25}
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/onboarding");
          }}
        />
      </div>
      <div className={"flex space-x-5 items-center"}>
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
    </div>
  ) : (
    <></>
  );
};

export default ProfilePage;