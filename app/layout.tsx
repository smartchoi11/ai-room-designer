import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_KR({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://roomfit-ai.vercel.app"),
  title: "RoomFit AI — 사진 한 장으로 완성하는 AI 인테리어 & 가구 맞춤배치",
  description:
    "방 사진을 올리고 스타일을 고르면, AI가 10초 만에 공간을 다시 디자인합니다. 가구 치수와 공간 크기에 꼭 맞는 AI 인테리어 솔루션.",
  openGraph: {
    title: "RoomFit AI — 사진 한 장으로 완성하는 AI 인테리어 & 가구 맞춤배치",
    description:
      "방 사진을 올리고 스타일을 고르면, AI가 10초 만에 공간을 다시 디자인합니다.",
    url: "https://roomfit-ai.vercel.app",
    siteName: "RoomFit AI",
    images: [
      {
        url: "/living_room_after.png",
        width: 1200,
        height: 1200,
        alt: "RoomFit AI 인테리어 리디자인 쇼케이스",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RoomFit AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full antialiased ${notoSerif.variable}`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
