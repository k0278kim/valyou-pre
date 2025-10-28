"use client";

import { useEffect, useRef, useState } from "react";

type CameraProps = {
  photo: string|null;
  setPhoto: (photo: string|null) => void;
}

export default function Camera({ photo, setPhoto } : CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ✅ 전면 카메라(facingMode: "user")

    if (!photo) {
      const constraints = {
        video: { facingMode: "user" },
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("카메라 접근 오류:", err));

      return () => {
        // 컴포넌트가 사라질 때 스트림 정리
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    }
  }, [photo]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ✅ 캔버스 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ✅ 좌우 반전 (거울 모드 유지)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ✅ Base64로 변환
    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className={"w-full h-full bg-black flex relative justify-center"}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            transform: "scaleX(-1)", // ✅ 비디오 거울 모드
          }}
          className="shadow-lg w-full h-full bg-black"
        />
        <div onClick={capturePhoto} className={"z-20 bg-white w-20 aspect-square rounded-full flex items-center justify-center absolute bottom-20 active:scale-90 duration-100 cursor-pointer"}>
          <div className={"z-30 bg-gray-200 w-14 aspect-square rounded-full"}></div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
