import React from "react";
import Image from "next/image";
import {Persona} from "@/model/Persona";
import { motion } from "framer-motion";
import {roundTransition} from "@/transitions/round_transition";

export const TextChatCard = React.memo(function TextChatCard({
                                                        isUser,
                                                        text,
  personaCharacter
                                                      }: {
  isUser: boolean;
  text: string;
  personaCharacter: Persona | null;
}) {
  const deepChat = text.startsWith("deep_chat");
  return (
    <motion.div initial={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={roundTransition} className="flex space-x-2.5 max-w-[80%]">
      {/* 페르소나 프로필 이미지 */}
      {!isUser &&
        (personaCharacter?.avatar_image ? (
          <div className={"w-[56px] h-[56px] rounded-2xl relative"}><Image
            src={personaCharacter.avatar_image}
            alt={`${personaCharacter.display_name} avatar`}
            fill
            className="rounded-2xl h-fit object-cover"
          /></div>
        ) : (
          <div
            className={
              "w-[56px] h-[56px] bg-gray-100 rounded-2xl flex items-center justify-center"
            }
          >
            <Image src={"/chat/user.svg"} alt={""} width={30} height={30} />
          </div>
        ))}

      <div className="flex flex-col space-y-2.5 flex-1">
        {!isUser && <p className="font-semibold">{personaCharacter?.display_name}</p>}
        <div
          className={`w-fit px-4 py-2 rounded-2xl border ${
            isUser ? "bg-gray-800 ml-auto text-white" : "bg-white border-gray-300"
          }`}
        >
          { deepChat && <div className={"font-medium text-sm rounded-lg bg-gray-100 px-2 py-1 w-fit mb-4 mt-2 text-gray-800"}>{text.split("__")[1].replaceAll("_", " ")}</div> }
          <p className="whitespace-pre-line text-sm">{deepChat ? text.split("__")[2] : text}</p>
        </div>
      </div>
    </motion.div>
  );
});