"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useSupabaseClient } from "@/context/SupabaseProvider";
import {PhotoCard} from "@/app/(protected)/(bnb)/profile/components/PhotoCard";
import {PhotoEmptyCard} from "@/app/(protected)/(bnb)/profile/components/PhotoEmptyCard";
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
  const [photos, setPhotos] = useState<PhotoTypeWithSignedUrl[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setPhotos([]);
      return;
    }

    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from("photos")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        const photosData: PhotoType[] = data || [];

        const photosLink: PhotoTypeWithSignedUrl[] = await Promise.all(
          photosData.map(async (phot) => {
            const { data: urlData, error: urlError } = await supabase.storage
              .from("photos")
              .createSignedUrl(phot.photo, SIGNED_URL_EXPIRES_IN);

            if (urlError || !urlData) {
              console.error("Signed URL 생성 실패:", phot.photo, urlError);
              return { ...phot, signedUrl: "/placeholder-image.png" };
            }

            return { ...phot, signedUrl: urlData.signedUrl };
          })
        );
        setPhotos(photosLink);
      } catch (e) {
        console.error(e);
        setPhotos([]);
      }
    };

    fetchPhotos();

  }, [user, supabase]);

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
            router.replace("/login");
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
      <div className={"w-full p-5 rounded-2xl flex flex-col space-y-10"}>
        <div className={"flex flex-col h-full"}>
          <p className={"font-bold text-2xl mb-7"}>사진</p>
          {
            photos.length === 0 && <PhotoEmptyCard />
          }
          <div className={"grid grid-cols-3 gap-1 flex-1"}>
            {photos.map((photo: PhotoTypeWithSignedUrl) => (
              <div className={"w-full h-full"} key={photo.id}><PhotoCard photo={photo} /></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default ProfilePage;