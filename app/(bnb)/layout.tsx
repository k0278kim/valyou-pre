'use client'

import {BottomNavigationBar} from "@/app/(bnb)/components/BottomNav";
import {createClient} from "@/utils/supabase/supabaseClient";
import {useEffect} from "react";

export default function BNBLayout({ children }: { children: React.ReactNode }) {

  const supabase = createClient();

  useEffect(() => {
    async function getSession() {
      let { data: {session } } = await supabase.auth.getSession();
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) console.error("Error signing in anonymously:", error);
        else {
          session = data.session;
          console.log("signed in", session);
        }
      }
      return session;
    }

    getSession();
  }, []);
  return <div className={"w-full h-dvh flex flex-col"}>
    <div className={"flex-1 overflow-y-scroll scrollbar-hide"}>{children}</div>
    {/*<div className={"h-fit"}>*/}
    {/*  <BottomNavigationBar />*/}
    {/*</div>*/}
  </div>;
}