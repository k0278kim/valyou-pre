'use client'

import React, {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/supabaseClient";
import {Persona} from "@/model/Persona";
import Image from "next/image";
import {useRouter} from "next/navigation";
import { motion } from "framer-motion";

const ChatListPage = () => {

  const [personas, setPersonas] = useState<Persona[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchPersonas = async () => {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("access", "TRUE")
      console.log(data);
      if (error) console.error("error", error);
      else setPersonas(data);
    }
    fetchPersonas();
  }, []);

  return <div className={"w-full h-full bg-white px-2"}>
    <p className={"p-5 mt-5 font-bold text-center text-xl"}>스타일리스트</p>
    <div className={"flex flex-col space-y-2"}>
      <div className={"w-full p-5 rounded-lg bg-gray-100 text-sm space-y-2 flex flex-col items-center mb-2.5"}>
        <p className={"font-semibold"}>Valyou는 당신의 숨겨진 아름다움을 찾기 위해 최선을 다하고 있어요!</p>
        <p className={"text-center mb-5"}>Valyou 팀은 여러 실험을 통해 서비스를 개선하고 있어요.</p>
        <button className={"p-2.5 rounded-lg bg-black text-sm text-white"} onClick={() => router.push("/communicate-with-devs")}>
          <div className={"font-semibold flex items-center space-x-2"}>
            <Image src={"/chat-list/envelope-open.svg"} alt={""} width={15} height={15} />
            <p>다음 실험이 나오면 알려주세요!</p>
          </div>
        </button>
      </div>
      <button className={"w-full border border-gray-200 rounded-lg flex flex-col justify-center items-center mb-10"} onClick={() => {
        window.open("https://open.kakao.com/o/sPpbZKZh");
      }}>
        <div className={"w-full h-44 relative border-b border-gray-200"}>
          <Image src={"/profile/openchat-banner.png"} alt={""} fill className={"object-contain rounded-2xl"} />
        </div>
        <p className={"font-bold pt-3"}>개발자와 대화하기</p>
        <p className={"text-sm pb-3"}>개발자의 카카오톡 오픈채팅방으로 연결됩니다.</p>
      </button>
      {
        personas.map((persona, index) => <PersonaRoom key={index} persona={persona} index={index} />)
      }
    </div>
  </div>
}

type PersonaRoom = {
  persona: Persona;
  index: number;
}

const PersonaRoom = ({ persona, index }: PersonaRoom) => {
  const router = useRouter();
  return <motion.button
    initial={{ opacity: 0, translateY: "10%" }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ delay: 0.05 * index }}
    className={"w-full h-fit px-5 py-2 flex flex-col space-y-4 active:bg-gray-100 rounded-2xl"} onClick={() => router.push(`/chat/${persona.name}`)}>
    <div className={"w-full aspect-square relative"}>
      { persona.avatar_image ? <Image src={persona.avatar_image} alt={persona.display_name} fill className={"rounded-2xl object-cover"} /> : <div className={"w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center"}>
        <Image src={"/chat/user.svg"} alt={""} width={30} height={30} />
      </div>
      }
      <div className={"w-full h-fit absolute bottom-0 flex flex-col space-y-4 p-7 bg-gradient-to-b from-black/0 to-black/100 rounded-b-2xl"}>
        <div className={"flex flex-col space-y-2 text-start justify-center flex-1"}>
          <p className={"font-bold text-2xl text-white"}>{persona.display_name}</p>
          <p className={"text-white/60"}>{persona.role}</p>
        </div>
      </div>
    </div>
  </motion.button>
}

export default ChatListPage;