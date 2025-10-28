import GoogleSignInButton from "@/components/GoogleSignInButton";
import Image from "next/image";

const LoginPage = () => {
  return <div className={"w-full h-full flex flex-col relative items-center justify-center"}>
    <div className={"text-5xl font-bold p-10 flex flex-col space-y-5 items-center"}>
      <div className={"w-full aspect-square relative"}>
        <Image src={"/title.svg"} alt={""} fill className={"object-cover"} />
      </div>
      <p>Valyou.</p>
      <p className={"text-xl font-medium"}>당신의 가치를 찾아드립니다.</p>
    </div>
    <div className={"absolute bottom-0 w-full p-10"}><GoogleSignInButton /></div>
  </div>
}

export default LoginPage;