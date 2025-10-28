import React, {useState} from "react";
import Image from "next/image";
import CircularLoader from "@/components/CircularLoader";

type PhotoChatCardType = {
  text: string;
  metadata: string | null;
  current: boolean;
  photoLoading: boolean;
  currentPhotoMetadata: string|null;
  photoLoadingStatus: string;
};

export const PhotoChatCard = React.memo(function PhotoChatCard({
                                                          text,
                                                          metadata,
                                                          current,
                                                          currentPhotoMetadata,
                                                          photoLoading,
  photoLoadingStatus
                                                        }: PhotoChatCardType) {
  const parts = metadata ? metadata.split("__") : "";
  console.log(parts);
  const [blur, setBlur] = useState(true);
  const part = parts.length > 2 ? parts[2] : "";
  const cleanedString = parts.length > 2 ? part
    .replaceAll("```json", "")
    .replaceAll("`", "")
    .replaceAll("[이미지 분석 결과]:", "")
    .trim() : "";
  const finalJsonObject = parts.length > 2 ? JSON.parse(cleanedString) : { summary : currentPhotoMetadata };
  return (
    <div className={"w-full flex items-end flex-col"}>
      <div
        className={"w-52 h-52 relative rounded-2xl cursor-pointer"}
        onClick={() => setBlur(!blur)}
      >
        <div className={"w-full h-full relative"}>
          <Image
            src={text}
            alt="Captured"
            fill
            className="top-0 left-0 w-full h-full absolute object-cover rounded-2xl"
          />
        </div>
        <div
          className={
            "absolute w-full h-full top-0 left-0 z-10 rounded-2xl flex items-center justify-center " +
            (blur && "backdrop-blur-xl")
          }
        >
          {photoLoading && current ? (
            <div className={"flex flex-col items-center"}>
              <div className={"w-7 h-7 z-20"}>
                <CircularLoader />
              </div>
            { (photoLoading && current) && <p className={"break-keep p-2.5 text-sm mt-2.5 text-white/60"}>{photoLoadingStatus}</p> }
            </div>
          ) : (
            blur && <div className={"flex flex-col items-center space-y-2.5"}>
              <Image src={"/chat/eye-slash.svg"} alt={""} width={20} height={20} />
              <p className={"text-sm text-white/50"}>눌러서 블러 해제</p>
            </div>
          )}
        </div>
      </div>
      {((!photoLoading && current) || !current) && (
        <div
          className={
            "mt-2.5 text-sm bg-[#a7c9ef] p-5 rounded-xl text-[#405166] text-start break-keep flex flex-col space-y-2.5"
          }
        >
          <div className={"flex space-x-1 items-center"}>
            <Image src={"/chat/exclaimation-circle.svg"} alt={""} width={17} height={17} />
            <p className={"font-semibold"}>사진 분석 결과</p>
          </div>
          <p>{finalJsonObject.summary}</p>
        </div>
      )}
    </div>
  );
});