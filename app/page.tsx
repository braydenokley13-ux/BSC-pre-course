"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/join");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[#6b7280] font-mono text-sm">Loading...</p>
    </div>
  );
}
