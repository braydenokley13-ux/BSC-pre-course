import type { Metadata } from "next";
import "@/styles/globals.css";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "BSC Pre-Course | Front Office Game",
  description: "BOW Sports Capital Pre-Course Multiplayer Learning Game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen arena-bg text-gray-200">
        <header className="border-b border-[#1a2030] px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-[rgba(2,4,8,0.85)]">
          <div className="flex items-center gap-3">
            <span className="text-[#c9a84c] font-mono font-bold text-lg tracking-wider" style={{ textShadow: "0 0 12px rgba(201,168,76,0.4)" }}>BOW</span>
            <span className="text-[#1a2030]">|</span>
            <span className="text-[#6b7280] font-mono text-xs tracking-widest uppercase">
              Front Office Simulator
            </span>
          </div>
          <span className="text-[#6b7280] font-mono text-xs tracking-wider">Pre-Course</span>
        </header>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
