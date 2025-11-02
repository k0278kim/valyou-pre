import React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {PhotoCardType} from "@/app/(protected)/(bnb)/profile/page";

export const PhotoCard = React.memo(function PhotoCard({ photo }: PhotoCardType) {
  const router = useRouter();
  return (
    <div className={"w-full aspect-square relative bg-gray-100 active:scale-90 duration-100 active:rounded-2xl"} onClick={() => {
      router.push("/photo-view/"+photo.photo.replaceAll("/", "**"));
    }}>
      <Image draggable={false} src={photo.signedUrl} alt={""} quality={50} className={"object-cover active:rounded-2xl"} fill />
    </div>
  );
});