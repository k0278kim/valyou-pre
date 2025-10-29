'use client'

import { motion } from "framer-motion";
import Image from "next/image";
import ChatListPage from "@/app/(protected)/(bnb)/chat-list/page";
import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import ProfilePage from "@/app/(protected)/(bnb)/profile/page";
import GalleryPage from "@/app/(protected)/(bnb)/gallery/page";

export const BottomNavigationBar = () => {

  const router = useRouter();

  const pathname = usePathname();
  const index = pathname === "/chat-list" ? 0 : pathname === "/gallery" ? 1 : 2;

  const navItems = [
    { name: "채팅", href: "/chat-list", page: <ChatListPage />, icon: "/bnb/chat.svg", selected_icon: "/bnb/chat-selected.svg" },
    { name: "사진", href: "/gallery", page: <GalleryPage />, icon: "/bnb/gallery.svg", selected_icon: "/bnb/gallery-selected.svg" },
    { name: "프로필", href: "/profile", page: <ProfilePage />, icon: "/bnb/my.svg", selected_icon: "/bnb/my-selected.svg" }
  ];

  return <div className={"flex w-full h-20 bg-white border-t-[1px] border-t-gray-200 items-center justify-center rounded-t-xl px-5 py-3 space-x-10 relative"}>
    <div className={"flex items-center space-x-5 justify-center"}>
      {
        navItems.map((item, i) => <motion.div key={i} className={"flex cursor-pointer justify-center items-center relative"} onClick={() => {
          router.replace(item.href);
        }}>
          { index === i && <motion.div layoutId="bnb-bg" className={"absolute w-full h-full bg-gray-100 rounded-xl"}></motion.div> }
          <motion.div className={"flex flex-col items-center active:scale-90 duration-100 px-5 py-2"}>
            <Image src={index === i ? item.selected_icon ? item.selected_icon : item.icon : item.icon} alt={item.name} width={25} height={25} className={"z-10 mb-1.5"} />
            <p className={"z-10 text-xs font-medium"}>{item.name}</p>
          </motion.div>
        </motion.div>)
      }
    </div>
  </div>
}

export type BottomNavigationItem = {
  title: string;
  icon: string;
  selected_icon?: string;
}