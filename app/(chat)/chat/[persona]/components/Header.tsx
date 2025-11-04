import Image from "next/image";
import React from "react";
import {Persona} from "@/model/Persona";
import {useRouter} from "next/navigation";

type HeaderProps = {
  personaCharacter: Persona | null;
}

const Header = ({ personaCharacter }: HeaderProps) => {
  const router = useRouter();
  return <div className="text-xl font-bold p-4 bg-white flex items-center space-x-3 border-b border-gray-200">
    <button
      className={"w-8 h-8 rounded-full flex items-center justify-center"}
      onClick={() => router.back()}
    >
      <Image src={"/chat/arrow-left.svg"} alt={""} width={20} height={20} />
    </button>
    {personaCharacter?.avatar_image ? (
      <div className={"w-10 h-10 rounded-full relative"}><Image
        src={personaCharacter.avatar_image}
        alt={`${personaCharacter.display_name} avatar`}
        fill
        className="rounded-full object-cover"
      /></div>
    ) : (
      <div
        className={
          "w-[40px] h-[40px] bg-gray-100 rounded-full flex items-center justify-center"
        }
      >
        <Image src={"/chat/user.svg"} alt={""} width={25} height={25} />
      </div>
    )}
    <p>{personaCharacter?.display_name}</p>
  </div>
}

export default Header;