"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="font-headlines text-accent text-xl tracking-cinematic animate-pulse">
        RE-ROUTING...
      </div>
    </div>
  );
}
