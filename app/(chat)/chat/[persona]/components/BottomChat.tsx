import Image from "next/image";
import React, {ChangeEvent, Dispatch, Ref, SetStateAction} from "react";

type BottomChatProps = {
  loading: boolean;
  input: string;
  setPageState: (state: "CAMERA" | "DEFAULT") => void;
  setInput: (state: string) => void;
  sendMessage: (message: string) => void;
  openGallery: () => void;
  fileInputRef: Ref<HTMLInputElement> | undefined;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
};

export const BottomChat = ({
                             loading,
                             input,
                             setPageState,
                             setInput,
                             sendMessage,
  fileInputRef,
  openGallery,
  handleFileChange
                           }: BottomChatProps) => {
  return (
    <div className="flex flex-col p-3 bg-white w-full border-t border-gray-200">
      <div className={"flex space-x-2.5 items-center w-full"}>
        <button
          onClick={() => setPageState("CAMERA")}
          className={`shrink-0 h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center ${
            loading && "opacity-50"
          }`}
          disabled={loading}
        >
          <Image src={"/chat/camera.svg"} alt={"카메라"} width={15} height={15} />
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className={"sr-only"}
          id="file-upload-button" // id 추가 (label 사용 시)
          required
        />
        <button
          onClick={openGallery}
          disabled={loading}
          className={`cursor-pointer shrink-0 h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center ${loading && "opacity-50"}`}
        >
          <Image src={"/chat/photo.svg"} alt={"사진 첨부"} width={15} height={15} />
        </button>

        <div className={"flex-1"}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지 입력"
            className="w-full px-5 py-3 rounded-full h-12 focus:outline-none bg-gray-100"
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
            loading || input === "" ? "bg-gray-300 opacity-50" : "bg-gray-800"
          }`}
          disabled={loading || input === ""}
        >
          <Image
            src={
              loading || input === ""
                ? "/chat/airplane.svg"
                : "/chat/airplane-white.svg"
            }
            alt={"전송"}
            width={15}
            height={15}
            className={`duration-200 ${
              !(loading || input === "") && "-rotate-45"
            }`}
          />
        </button>
      </div>
    </div>
  );
};