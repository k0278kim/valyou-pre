import React, {useState} from "react";
import Image from "next/image";
import CircularLoader from "@/components/CircularLoader";
import { motion } from "framer-motion";
import {roundTransition} from "@/transitions/round_transition";
import {ChatType} from "@/app/(chat)/chat/[persona]/type/chat";

type PhotoChatCardType = {
  text: string;
  metadata: string | null;
  photoLoading: boolean;
  photoLoadingStatus: string;
  messages: ChatType[];
  index: number;
  sendMessage: (message: string) => Promise<void>;
};

export const PhotoChatCard = React.memo(function PhotoChatCard({
                                                                 text,
                                                                 metadata,
                                                                 photoLoading,
                                                                 messages,
                                                                 photoLoadingStatus,
                                                                 index,
  sendMessage
                                                               }: PhotoChatCardType) {
  const [blur, setBlur] = useState(true);
  const current = index === messages.length - 1;
  const cleanedString = metadata ? metadata
    .replaceAll("```json", "")
    .replaceAll("`", "")
    .replaceAll("[이미지 분석 결과]:", "")
    .trim() : `{"summary":""}`;
  const finalJsonObject = JSON.parse(cleanedString);
  return (
    <motion.div initial={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={roundTransition} className={"w-full flex items-end flex-col"}>
      <div
        className={"w-52 h-52 relative rounded-2xl cursor-pointer"}
        onClick={() => setBlur(!blur)}
      >
        <div className={"w-full h-full relative"}>
          <Image
            src={text}
            alt="Captured"
            fill
            className="top-0 left-0 w-full h-full absolute object-cover rounded-2xl bg-black/10"
          />
        </div>
        <motion.div
          className={
            "absolute w-full h-full top-0 left-0 z-10 rounded-2xl flex items-center justify-center duration-200 " +
            (blur && "backdrop-blur-xl")
          }
        >
          {(photoLoading && current) ? (
            <div className={"flex flex-col items-center justify-center w-full h-full bg-black/30 rounded-2xl"}>
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
        </motion.div>
      </div>
      {((!photoLoading && current) || !current) && (
        <div
          className={
            "mt-2.5 text-sm bg-gray-200 p-5 rounded-xl text-[#405166] text-start break-keep flex flex-col space-y-2.5"
          }
        >
          <div className={"flex space-x-1 items-center"}>
            <Image src={"/chat/exclaimation-circle.svg"} alt={""} width={17} height={17} />
            <p className={"font-semibold"}>사진 분석 결과</p>
          </div>
          <p>{finalJsonObject.summary}</p>
          { current && <div className={"grid grid-cols-2 gap-1"}>
            {
              ["얼굴을 분석해줘", "헤어 스타일을 추천해줘", "이 옷은 어때?", "사진을 분석해줘"].map((item, index) => <NextChatButton text={item} loading={false} sendMessage={sendMessage} key={index} />)
            }
          </div> }
        </div>
      )}
    </motion.div>
  );
});

type NextChatButtonProps = {
  text: string;
  sendMessage: (message: string, analyze: boolean) => Promise<void>;
  loading: boolean;
}

export const NextChatButton = ({ text, sendMessage, loading }: NextChatButtonProps) => {
  return <button onClick={async () => {
    if (!loading) {
      await sendMessage(text, true);
    }
  }}
                 className={"rounded-lg p-2.5 bg-white border border-gray-300 text-sm font-medium"}>
    {text}
  </button>
}