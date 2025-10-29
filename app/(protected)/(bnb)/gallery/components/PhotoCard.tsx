import React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {PhotoCardType} from "@/app/(protected)/(bnb)/profile/page";

export const PhotoCard = React.memo(function PhotoCard({ photo }: PhotoCardType) {
  const router = useRouter();
  return (
    <div className={"w-full aspect-square relative bg-gray-100"} onClick={() => {
      router.push("/photo-view/"+photo.photo.replaceAll("/", "**"));
    }}>
      <Image src={photo.signedUrl} alt={""} quality={50} className={"object-cover"} fill />
    </div>
  );
});