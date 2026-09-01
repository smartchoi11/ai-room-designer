import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ReRoomAI - AI 인테리어 디자인 & 가상 스튜디오',
    short_name: 'ReRoomAI',
    description: '방 사진 한 장으로 3초 만에 4K 초고화질 럭셔리 인테리어 시안을 생성하는 AI 서비스입니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
