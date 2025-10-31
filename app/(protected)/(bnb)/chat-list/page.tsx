'use client'

import {useEffect, useState} from "react";
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
      <div className={"w-full p-5 rounded-lg bg-gray-100 text-sm space-y-2 flex flex-col items-center mb-10"}>
        <p className={"font-semibold"}>Valyou는 당신의 숨겨진 아름다움을 찾기 위해 최선을 다하고 있어요!</p>
        <p className={"text-center"}>이 실험은 10.30-11.05 동안 운영합니다.</p>
        <button className={"p-2.5 border border-gray-300 rounded-lg bg-white text-sm"} onClick={() => router.push("/communicate-with-devs")}>
          <div className={"font-semibold flex items-center space-x-2"}>
            <Image src={"/chat-list/envelope-open.svg"} alt={""} width={15} height={15} />
            <p>다음 실험이 나오면 알려주세요!</p>
          </div>
        </button>
      </div>
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
    className={"w-full h-fit px-5 py-2 flex space-x-4 active:bg-gray-100 rounded-2xl"} onClick={() => router.push(`/chat/${persona.name}`)}>
    <div className={"w-24 h-24 relative"}>
    { persona.avatar_image ? <Image src={persona.avatar_image} alt={persona.display_name} fill className={"rounded-2xl object-cover"} /> : <div className={"w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center"}>
      <Image src={"/chat/user.svg"} alt={""} width={30} height={30} />
    </div> }
    </div>
    <div className={"flex flex-col space-y-0.5 text-start justify-center flex-1"}>
      <p className={"font-bold text"}>{persona.display_name}</p>
      <p className={"text-gray-700 text-xs"}>{persona.role}</p>
    </div>
  </motion.button>
}

export default ChatListPage;