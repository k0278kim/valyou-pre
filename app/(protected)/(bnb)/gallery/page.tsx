'use client'

import {PhotoEmptyCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoEmptyCard";
import {PhotoCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoCard";
import React, {useEffect, useState} from "react";
import {PhotoType, PhotoTypeWithSignedUrl} from "@/app/(protected)/(bnb)/profile/page";
import {useSupabaseClient, useUser} from "@/context/SupabaseProvider";
import {useRouter} from "next/navigation";
import Image from "next/image";
import CircularLoader from "@/components/CircularLoader";

const GalleryPage = () => {

  const [photos, setPhotos] = useState<PhotoTypeWithSignedUrl[]>([]);
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [blur, setBlur] = useState(true);
  const [loading, setLoading] = useState(false);

  const SIGNED_URL_EXPIRES_IN = 60;

  useEffect(() => {
    if (!user) {
      setPhotos([]);
      return;
    }

    const fetchPhotos = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      } catch (e) {
        console.error(e);
        setPhotos([]);
        setLoading(false);
      }
    };

    fetchPhotos();

  }, [user, supabase]);

  return <div className={"w-full h-full"}>
    <div className={"w-full p-5 rounded-2xl flex flex-col space-y-10"}>
      <div className={"flex flex-col h-full"}>
        <p className={"font-bold text-2xl my-7"}>사진</p>
        <div className={`w-full h-fit relative flex justify-center`}>
          {
            loading ? <div className={"w-12 h-12"}><CircularLoader /></div> : photos.length === 0 && <PhotoEmptyCard />
          }
        </div>
        { !loading && <div className={`grid grid-cols-3 gap-1 flex-1 relative`}>
          {photos.map((photo: PhotoTypeWithSignedUrl) => (
            <div className={"w-full h-full"} key={photo.id}><PhotoCard photo={photo} /></div>
          ))}
          { (blur && photos.length != 0) && <div className={`w-full h-full absolute top-0 left-0 z-30 backdrop-brightness-150 bg-white/20 flex flex-col items-center justify-center backdrop-blur-xl space-y-2.5`}>
            <div className={"w-5 h-5 relative"}>
              <Image src={"/bnb/lock.svg"} alt={""} fill className={"object-cover"} />
            </div>
            <p className={"font-semibold text-black/70"}>사진을 보려면 해제하세요</p>
            <button className={"p-2 font-medium rounded-lg border border-black/30 text-black/70 text-sm"} onClick={() => setBlur(!blur)}>사진 보기</button>
          </div>
          }
        </div>
        }
      </div>
    </div>
  </div>
}

export default GalleryPage;