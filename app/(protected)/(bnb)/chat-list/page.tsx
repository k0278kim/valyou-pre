'use client'

import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/supabaseClient";
import {Persona} from "@/model/Persona";
import Image from "next/image";
import {useRouter} from "next/navigation";

const ChatListPage = () => {

  const [personas, setPersonas] = useState<Persona[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchPersonas = async () => {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
      console.log(data);
      if (error) console.error("error", error);
      else setPersonas(data);
    }
    fetchPersonas();
  }, []);

  return <div className={"w-full h-full bg-white px-2"}>
    <p className={"p-5 my-5 font-bold text-center text-xl"}>스타일리스트</p>
    <div className={"flex flex-col space-y-2"}>
      {
        personas.map((persona, index) => <PersonaRoom key={index} persona={persona} />)
      }
    </div>
  </div>
}

type PersonaRoom = {
  persona: Persona;
}

const PersonaRoom = ({ persona }: PersonaRoom) => {
  const router = useRouter();
  return <button className={"w-full h-fit px-5 py-2 flex space-x-4 active:bg-gray-100 rounded-2xl"} onClick={() => router.push(`/chat/${persona.name}`)}>
    <div className={"w-24 h-24 relative"}>
    { persona.avatar_image ? <Image src={persona.avatar_image} alt={persona.display_name} fill className={"rounded-2xl object-cover"} /> : <div className={"w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center"}>
      <Image src={"/chat/user.svg"} alt={""} width={30} height={30} />
    </div> }
    </div>
    <div className={"flex flex-col space-y-0.5 text-start justify-center flex-1"}>
      <p className={"font-bold text"}>{persona.display_name}</p>
      <p className={"text-gray-700 text-xs"}>{persona.role}</p>
    </div>
  </button>
}

export default ChatListPage;