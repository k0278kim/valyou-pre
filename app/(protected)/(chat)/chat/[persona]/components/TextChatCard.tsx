import React from "react";
import Image from "next/image";

export const TextChatCard = React.memo(function TextChatCard({
                                                        isUser,
                                                        avatar,
                                                        persona,
                                                        text,
                                                      }: {
  isUser: boolean;
  avatar: string | null;
  persona: string;
  text: string;
}) {
  return (
    <div className="flex space-x-2.5 max-w-[80%]">
      {/* 페르소나 프로필 이미지 */}
      {!isUser &&
        (avatar ? (
          <Image
            src={avatar}
            alt={`${persona} avatar`}
            width={56}
            height={56}
            className="rounded-2xl h-fit"
          />
        ) : (
          <div
            className={
              "w-[56px] h-[56px] bg-gray-100 rounded-2xl flex items-center justify-center"
            }
          >
            <Image src={"/chat/user.svg"} alt={""} width={30} height={30} />
          </div>
        ))}

      <div className="flex flex-col space-y-2.5 flex-1">
        {!isUser && <p className="font-semibold">{persona}</p>}
        <div
          className={`w-fit px-4 py-2 rounded-2xl ${
            isUser ? "bg-yellow-300 ml-auto" : "bg-white"
          }`}
        >
          <p className="whitespace-pre-line">{text}</p>
        </div>
      </div>
    </div>
  );
});