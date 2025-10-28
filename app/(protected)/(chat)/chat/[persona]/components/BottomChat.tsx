import Image from "next/image";
import React, {Dispatch, SetStateAction} from "react";

type BottomChatProps = {
  loading: boolean;
  input: string;
  setPageState: (state: "CAMERA" | "DEFAULT") => void;
  setInput: (state: string) => void;
  sendMessage: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void> | undefined;
  setFile: Dispatch<SetStateAction<File | null>>;
}

export const BottomChat = ({ loading, input, setPageState, setInput, sendMessage, handleSubmit, setFile }: BottomChatProps) => {
  return <div className="flex flex-col p-3 bg-white">

    <div className={"flex space-x-2.5"}>
      <button
        onClick={() => setPageState("CAMERA")}
        className="h-full aspect-square border border-gray-300 rounded-full flex items-center justify-center"
        disabled={loading}
      >
        <Image src={"/chat/camera.svg"} alt={""} width={20} height={20} />
      </button>
      <form onSubmit={handleSubmit} className={"w-fit"}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className={"sr-only"}
          required
        />
        <button
          className="h-full aspect-square border border-gray-300 rounded-full flex items-center justify-center"
          disabled={loading}
        >
          <Image src={"/chat/photo.svg"} alt={""} width={20} height={20} />
        </button>
      </form>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="메시지 입력"
        className="flex-1 px-5 py-3 rounded-full focus:outline-none bg-gray-100"
      />
      <button
        onClick={sendMessage}
        className={`h-full aspect-square rounded-full flex items-center justify-center ${
          input == "" ? "bg-gray-300 opacity-50" : "bg-yellow-300"
        }`}
        disabled={loading || input == ""}
      >
        <Image src={"/chat/airplane.svg"} alt={""} width={20} height={20} />
      </button>
    </div>
  </div>;
}