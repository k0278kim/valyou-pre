import {motion} from "framer-motion";
import React, {useState} from "react";
import {PulseLoader} from "react-spinners";
import {useSupabaseClient} from "@/context/SupabaseProvider";

type PhoneNumberProps = {
  setPage: (page: "PHONE_NUMBER"|"COMPLETE") => void;
}

const PhoneNumber = ({ setPage }: PhoneNumberProps) => {

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();
  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 11) {
      return;
    }
    setPhoneNumber(e.target.value);
  }

  const selectedBlock = phoneNumber.length < 3 ? 0 : (phoneNumber.length < 7 ? 1 : phoneNumber.length === 11 ? -1 : 2);
  const disabled = phoneNumber.length != 11;

  return <div className={"w-full h-full px-10 relative"}>
    <div className={"font-bold text-2xl break-keep py-20"}>다음 실험을 알려드리기 위해<br/>전화번호가 필요해요.</div>
    <div className={"flex space-x-2.5 h-20 text-2xl font-medium relative"}>
      <motion.div
        className={`rounded-2xl flex-[3] flex items-center justify-center duration-100 ${
          selectedBlock === 0 ? "bg-blue-100 scale-105 border-2 border-blue-400 text-blue-700" : "bg-gray-100 border-none"
        }`}
      >
        {phoneNumber.slice(0, 3)}
      </motion.div>
      <motion.div
        className={`rounded-2xl flex-[4] flex items-center justify-center duration-100 ${
          selectedBlock === 1 ? "bg-blue-100 scale-105 border-2 border-blue-400 text-blue-700" : "bg-gray-100 border-none"
        }`}
      >
        {phoneNumber.slice(3, 7)}
      </motion.div>
      <motion.div
        className={`rounded-2xl flex-[4] flex items-center justify-center duration-100 ${
          selectedBlock === 2 ? "bg-blue-100 scale-105 border-2 border-blue-400 text-blue-700" : "bg-gray-100 border-none"
        }`}
      >
        {phoneNumber.slice(7, 11)}
      </motion.div>
      <input
        type={"number"}
        disabled={loading}
        inputMode={"numeric"}
        pattern="[0-9]*"
        value={phoneNumber}
        maxLength={11}
        className={"opacity-0 absolute w-full h-full"}
        onChange={onValueChange}
      />
    </div>
    <button onClick={async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("submits")
        .insert([{
          phone_number: phoneNumber,
          project_id: "pretotype-A"
        }]);

      if (error) {
        console.error("데이터 저장 실패:", error);
      } else {
        setLoading(false);
        setPage("COMPLETE");
      }
    }} className={`absolute bottom-10 p-5 left-10 right-10 rounded-2xl font-medium ${!disabled ? loading ? "bg-blue-800" : "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`} disabled={disabled || loading}>{
      loading
      ? <PulseLoader size={8} margin={2} color={"#FFFFFF60"} />
      : <p>다음 실험 때 연락 받기</p>
    }</button>
  </div>;
}

export default PhoneNumber;