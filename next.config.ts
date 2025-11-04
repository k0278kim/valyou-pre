import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yxedlmhisxzugnafzdet.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/photos/**', // Supabase 스토리지 경로에 맞게 설정
      },
      {
        protocol: 'https', // 프로토콜 (http 또는 https)
        hostname: 'image.zeta-ai.io', // <--- 이 호스트 이름을 추가
        port: '', // 포트 번호 (없으면 빈 문자열)
        pathname: '/**', // 모든 경로 허용 (필요에 따라 더 구체적으로 설정 가능)
      },
      {
        protocol: 'https', // Google images are served over https
        hostname: 'lh3.googleusercontent.com', // <-- Add this entry
        port: '',
        pathname: '/**', // Allow all paths for Google profile images
      },
      {
        protocol: 'https',
        hostname: 'nfsccphiyyuzwiongvcj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**', // Path for Supabase Storage
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**', // github.com의 모든 경로 허용
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**', // 이 호스트의 모든 경로를 허용
      },
      {
        protocol: 'https',
        hostname: 'i.namu.wiki',
        port: '',
        pathname: '/**', // i.namu.wiki의 모든 이미지 경로 허용
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**', // i.pinimg.com의 모든 이미지 경로 허용
      },
      // ... 여기에 다른 호스트 이름 패턴을 추가할 수 있습니다.
    ],
  },
};

export default nextConfig;
