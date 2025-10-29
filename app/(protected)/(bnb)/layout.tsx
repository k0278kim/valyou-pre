import {BottomNavigationBar} from "@/app/(protected)/(bnb)/components/BottomNav";

export default async function BNBLayout({ children }: { children: React.ReactNode }) {

  return <div className={"w-full h-dvh flex flex-col"}>
    <div className={"flex-1 overflow-y-scroll"}>{children}</div>
    <div className={"h-fit"}>
      <BottomNavigationBar />
    </div>
  </div>;
}