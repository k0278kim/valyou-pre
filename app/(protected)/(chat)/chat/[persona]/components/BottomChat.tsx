import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";

type BottomChatProps = {
  loading: boolean;
  input: string;
  setPageState: (state: "CAMERA" | "DEFAULT") => void;
  setInput: (state: string) => void;
  sendMessage: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void> | undefined;
  setFile: Dispatch<SetStateAction<File | null>>;
};

export const BottomChat = ({
                             loading,
                             input,
                             setPageState,
                             setInput,
                             sendMessage,
                             handleSubmit,
                             setFile,
                           }: BottomChatProps) => {
  return (
    // SafeArea 고려 (선택 사항)
    <div className="flex flex-col p-3 bg-white w-full pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
      <div className={"flex space-x-2.5 items-center"}>
        <button
          onClick={() => setPageState("CAMERA")}
          className={`shrink-0 h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center ${
            loading && "opacity-50"
          }`}
          disabled={loading}
        >
          <Image src={"/chat/camera.svg"} alt={"카메라"} width={20} height={20} />
        </button>

        {/* --- 파일 업로드 버튼 (주석 처리됨) ---
        <form onSubmit={handleSubmit} className={"w-fit shrink-0"}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className={"sr-only"}
            id="file-upload-button" // id 추가 (label 사용 시)
            required
          />
          <label
            htmlFor="file-upload-button" // input과 연결
            // 💡 표준 크기 및 shrink-0 적용, 버튼 스타일 추가
            className={`cursor-pointer shrink-0 h-12 w-12 border border-gray-300 rounded-full flex items-center justify-center ${loading && "opacity-50"}`}
          >
            <Image src={"/chat/photo.svg"} alt={"사진 첨부"} width={20} height={20} />
          </label>
        </form>
        --- 파일 업로드 버튼 끝 --- */}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력"
          // 💡 표준 높이 (h-12) 및 min-w-0 적용
          className="flex-1 px-5 py-3 rounded-full h-12 focus:outline-none bg-gray-100"
        />
        <button
          onClick={sendMessage}
          // 💡 표준 크기 (h-12 w-12) 및 shrink-0 적용
          className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
            input === "" ? "bg-gray-300 opacity-50" : "bg-gray-800"
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
            width={20}
            height={20}
            className={`duration-200 ${
              !(loading || input === "") && "-rotate-45"
            }`}
          />
        </button>
      </div>
    </div>
  );
};