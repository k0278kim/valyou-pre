import {Persona} from "@/model/Persona";
import Image from "next/image";
import React from "react";
import {PulseLoader} from "react-spinners";

type LoadingIndicatorChatProps = {
  persona: string;
  personaCharacter: Persona | null;
}

export const LoadingIndicatorChat = ({ persona, personaCharacter }: LoadingIndicatorChatProps) => {
  return <div className={"flex space-x-2.5"}>
    { (personaCharacter?.avatar_image ? (
      <Image
        src={personaCharacter.avatar_image}
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
        <PulseLoader size={6} margin={2} color={"#405166"} />
      </div>
    </div>
  </div>
}