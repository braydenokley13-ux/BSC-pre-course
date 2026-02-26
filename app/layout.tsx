import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BSC Pre-Course | Front Office Game",
  description: "BOW Sports Capital Pre-Course Multiplayer Learning Game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0c10] text-gray-200">
        <header className="border-b border-[#1e2435] px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#c9a84c] font-mono font-bold text-lg tracking-wider hover:text-[#e8c56a]">
              BOW
            </Link>
            <span className="text-[#1e2435]">|</span>
            <span className="text-[#6b7280] font-mono text-xs tracking-widest uppercase">
              Front Office Simulator
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/join" className="bsc-btn-ghost text-[10px] px-2 py-1.5">
              Team Mode
            </Link>
            <Link href="/teacher" className="bsc-btn-ghost text-[10px] px-2 py-1.5">
              Teacher
            </Link>
            <span className="text-[#6b7280] font-mono text-xs">Pre-Course</span>
          </div>
        </header>
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  );
}
