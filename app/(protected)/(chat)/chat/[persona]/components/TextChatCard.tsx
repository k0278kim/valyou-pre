import React from "react";
import Image from "next/image";
import {Persona} from "@/model/Persona";

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
    <div className="flex space-x-2.5 max-w-[80%]">
      {/* 페르소나 프로필 이미지 */}
      {!isUser &&
        (personaCharacter?.avatar_image ? (
          <Image
            src={personaCharacter.avatar_image}
            alt={`${personaCharacter.display_name} avatar`}
            width={56}
            height={56}
            className="rounded-2xl h-fit"
          />
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
          className={`w-fit px-4 py-2 rounded-2xl ${
            isUser ? "bg-yellow-300 ml-auto" : "bg-white"
          }`}
        >
          { deepChat && <p className={"text-lg font-semibold"}>{text.split("__")[1].replaceAll("_", " ")}</p> }
          { deepChat && <div className={"w-full h-[1px] border-b border-gray-200 my-2.5"}></div> }
          <p className="whitespace-pre-line">{deepChat ? text.split("__")[2] : text}</p>
        </div>
      </div>
    </div>
  );
});