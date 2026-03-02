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
      <body className="min-h-screen arena-bg text-slate-100 font-sans">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
