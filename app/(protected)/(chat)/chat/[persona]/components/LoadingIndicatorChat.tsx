import {Persona} from "@/model/Persona";
import Image from "next/image";
import React from "react";

type LoadingIndicatorChatProps = {
  avatar: string | null;
  persona: string;
  personaCharacter: Persona | null;
}

export const LoadingIndicatorChat = ({ avatar, persona, personaCharacter }: LoadingIndicatorChatProps) => {
  return <div className={"flex space-x-2.5"}>
    { (avatar ? (
      <Image
        src={avatar}
        alt={`${persona} avatar`}
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
    )) }
    <div className={"flex flex-col space-y-2.5"}>
      <p className={"font-semibold"}>{personaCharacter?.display_name}</p>
      <div className="rounded-full p-4 h-fit bg-white/30 flex space-x-2 w-fit">
        <div
          className={"w-2 aspect-square bg-gray-400 rounded-full"}
        ></div>
        <div
          className={"w-2 aspect-square bg-gray-400 rounded-full"}
        ></div>
        <div
          className={"w-2 aspect-square bg-gray-400 rounded-full"}
        ></div>
      </div>
    </div>
  </div>
}