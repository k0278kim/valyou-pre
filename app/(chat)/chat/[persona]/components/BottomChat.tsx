import { motion } from "framer-motion";
import Image from "next/image";
import React, {ChangeEvent, Dispatch, Ref, SetStateAction} from "react";
import {roundTransition} from "@/transitions/round_transition";
import {NextChatButton} from "@/app/(chat)/chat/[persona]/components/PhotoChatCard";

type BottomChatProps = {
  loading: boolean;
  input: string;
  setPageState: (state: "CAMERA" | "DEFAULT") => void;
  setInput: (state: string) => void;
  sendMessage: (message: string, analyze?: boolean) => Promise<void>;
  openGallery: () => void;
  fileInputRef: Ref<HTMLInputElement> | undefined;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  recommendedNextQuestions: string[];
};

export const BottomChat = ({
                             loading,
                             input,
                             setPageState,
                             setInput,
                             sendMessage,
  fileInputRef,
  openGallery,
  handleFileChange,
  recommendedNextQuestions
                           }: BottomChatProps) => {
  return (
    <div className="flex flex-col p-3 bg-white w-full border-t border-gray-200">
      <div className={"grid grid-cols-2 gap-1 pb-5 " + (loading ? "opacity-50" : "")}>
        {
          recommendedNextQuestions.map((q, index) => <NextChatButton text={q} loading={loading} sendMessage={sendMessage} key={index} />)
        }
      </div>
      <div className={"flex space-x-2.5 items-center w-full"}>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => setPageState("CAMERA")}
          className={`${input != "" && "hidden"} shrink-0 h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center ${
            loading && "opacity-50"
          }`}
          disabled={loading}
        >
          <Image src={"/chat/camera.svg"} alt={"카메라"} width={15} height={15} />
        </motion.button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className={"sr-only"}
          id="file-upload-button" // id 추가 (label 사용 시)
          required
        />
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={openGallery}
          disabled={loading}
          className={`${input != "" && "hidden"} cursor-pointer shrink-0 h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center ${loading && "opacity-50"}`}
        >
          <Image src={"/chat/photo.svg"} alt={"사진 첨부"} width={15} height={15} />
        </motion.button>

        <motion.div className={"flex-1"} layoutId={"bottom-chat"} transition={{ duration: 0.2 }}>
          <motion.input
            layoutId={"bottom-input"}
            value={input}
            transition={{ duration: 0.2 }}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지 입력"
            className="w-full px-5 py-3 rounded-full h-12 focus:outline-none bg-gray-100"
          />
        </motion.div>
        <button
          onClick={() => sendMessage(input)}
          className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
            loading || input === "" ? "bg-gray-300 opacity-50" : "bg-gray-800"
          }`}
          disabled={loading || input === ""}
        >
          <Image
            src={
              loading || input === ""
                ? "/chat/airplane.svg"
                : "/chat/airplane-white.svg"
            }
            alt={"전송"}
            width={15}
            height={15}
            className={`duration-200 ${
              !(loading || input === "") && "-rotate-45"
            }`}
          />
        </button>
      </div>
    </div>
  );
};