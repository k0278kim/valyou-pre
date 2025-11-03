import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/context/SupabaseProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {Analytics} from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Valyou.ai",
  description: "AI 이미지 분석으로 당신의 숨겨진 아름다움을 찾아드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <body
      className={`antialiased`}
    >
    <Analytics />
    <GoogleAnalytics />
    <SupabaseProvider>
      <div className={"w-svw min-h-[100dvh] bg-black flex justify-center"}>
        <div className={"w-full md:max-w-[500px] h-dvh bg-white"}>
          {children}
        </div>
      </div>
    </SupabaseProvider>
    </body>
    </html>
  );
}
