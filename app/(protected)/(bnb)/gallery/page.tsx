'use client'

import {PhotoEmptyCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoEmptyCard";
import {PhotoCard} from "@/app/(protected)/(bnb)/gallery/components/PhotoCard";
import React, {useEffect, useState} from "react";
import {PhotoType, PhotoTypeWithSignedUrl} from "@/app/(protected)/(bnb)/profile/page";
import {useSupabaseClient, useUser} from "@/context/SupabaseProvider";
import {useRouter} from "next/navigation";
import Image from "next/image";
import CircularLoader from "@/components/CircularLoader";
import {AnimatePresence, motion} from "framer-motion";
import {roundTransition} from "@/transitions/round_transition";

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

  return <div className={`w-full h-full relative ${(blur && photos.length != 0) && "overflow-y-hidden" }`}>
    <div className={"w-full rounded-2xl flex flex-col space-y-10"}>
      <div className={"flex flex-col h-full"}>
        <div className={`w-full h-full relative flex justify-center items-center`}>
          {
            loading ? <div className={"w-12 h-12"}><CircularLoader /></div> : photos.length === 0 && <PhotoEmptyCard />
          }
        </div>
        { !loading && <div className={`grid grid-cols-3 gap-1 flex-1 relative p-1`}>
          {photos.map((photo: PhotoTypeWithSignedUrl) => (
            <div className={"w-full h-full"} key={photo.id}><PhotoCard photo={photo} /></div>
          ))}
          <AnimatePresence>{ (blur && photos.length != 0) && <motion.div
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className={`w-full h-full absolute top-0 left-0 z-30 bg-white/20 flex flex-col items-center justify-center backdrop-blur-sm space-y-2.5`}></motion.div> }</AnimatePresence>
        </div>
        }
      </div>
    </div>
    <AnimatePresence>
    { (blur && photos.length != 0) && <motion.div
      initial={{ opacity: 0, translateY: "100%" }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: "100%" }}
      transition={roundTransition}
      className={"absolute bottom-0 flex flex-col space-y-2.5 items-center justify-center z-50 h-[50%] w-full bg-gradient-to-b from-white/0 to-white to-50%"}>
      <div className={"w-5 h-5 relative"}>
        <Image src={"/bnb/lock.svg"} alt={""} fill className={"object-cover"} />
      </div>
      <p className={"font-semibold text-black/70"}>사진을 보려면 해제하세요</p>
      <button className={"p-2 font-medium rounded-lg border border-black/30 text-black/70 text-sm"} onClick={() => setBlur(!blur)}>사진 보기</button>
    </motion.div>
    }
    </AnimatePresence>
  </div>
}

export default GalleryPage;