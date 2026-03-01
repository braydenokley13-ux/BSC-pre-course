import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BSC Pre-Course | Front Office Game",
  description: "BOW Sports Capital Pre-Course Multiplayer Learning Game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen page-bg text-[#0f172a] font-sans">
        <header className="border-b border-[#e2e8f0] px-6 py-3 flex items-center justify-between sticky top-0 z-50 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-[#2563eb] font-bold text-base tracking-tight">BOW</span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="text-[#64748b] text-xs font-medium tracking-wide">
              Front Office Simulator
            </span>
          </div>
          <span className="text-[#64748b] text-xs">Pre-Course</span>
        </header>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
