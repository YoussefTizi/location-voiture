"use client";

import DynamicFrontend from "@/components/frontend/DynamicFrontend";
import { useRouter } from "next/navigation";

const Index = () => {
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => router.push("/admin")}
        className="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        ⚙ Admin
      </button>
      <DynamicFrontend />
    </div>
  );
};

export default Index;
