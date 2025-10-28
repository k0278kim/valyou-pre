'use client'

import {PhotoEmptyCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoEmptyCard";
import {PhotoCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoCard";
import React, {useEffect, useState} from "react";
import {PhotoType, PhotoTypeWithSignedUrl} from "@/app/(protected)/(bnb)/profile/page";
import {useSupabaseClient, useUser} from "@/context/SupabaseProvider";
import {useRouter} from "next/navigation";

const GalleryPage = () => {

  const [photos, setPhotos] = useState<PhotoTypeWithSignedUrl[]>([]);
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const SIGNED_URL_EXPIRES_IN = 60;

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

  return <div className={"w-full h-full"}>
    <div className={"w-full p-5 rounded-2xl flex flex-col space-y-10"}>
      <div className={"flex flex-col h-full"}>
        <p className={"font-bold text-2xl my-7"}>사진</p>
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
}

export default GalleryPage;