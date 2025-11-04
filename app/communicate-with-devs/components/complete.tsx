import React from "react";
import {useRouter} from "next/navigation";
import { motion } from "framer-motion";

const Complete = () => {
  const router = useRouter();
  return <div className={"w-full h-full px-10 relative"}>
    <motion.div
      initial={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className={"font-bold text-2xl break-keep py-20"}>신청이 완료되었습니다!<br/>다음 실험을 시작하면 연락드리겠습니다.</motion.div>
    <button onClick={() => {
      router.replace("/");
    }} className={`absolute bottom-10 p-5 left-10 right-10 rounded-2xl font-medium bg-blue-600 text-white`}>확인</button>
  </div>
}

export default Complete;