'use client'

import { motion } from "framer-motion";
import {useEffect, useState} from "react";
import PhoneNumber from "@/app/(protected)/communicate-with-devs/components/phone_number";
import Complete from "@/app/(protected)/communicate-with-devs/components/complete";
import {useSupabaseClient, useUser} from "@/context/SupabaseProvider";

const CommunicateWithDevsPage = () => {

  const [page, setPage] = useState<"INIT"|"PHONE_NUMBER" | "COMPLETE">("INIT");
  const supabase = useSupabaseClient();
  const { user, isLoading } = useUser();

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("submits")
          .select("user_id") // 존재 여부만 확인
          .eq("user_id", user.id) // 💡 user.id를 사용
          .maybeSingle(); // 💡 1개 또는 0개의 행만 가져옴

        if (error) {
          console.error("Error checking submission status:", error);
          return;
        }

        if (data) {
          setPage("COMPLETE");
        } else {
          setPage("PHONE_NUMBER");
        }
      }
    };

    if (!isLoading) {
      checkSubmissionStatus();
    }
  }, [user, isLoading, supabase]);

  return page === "INIT" ? <></> : page === "PHONE_NUMBER" ? <PhoneNumber setPage={setPage} /> : <Complete />;
}

export default CommunicateWithDevsPage;