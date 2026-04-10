"use client";

import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsProvider";
import { Activity, ShieldCheck, ShieldAlert } from "lucide-react";


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { healthStatus, environmentsHealth, environments, activeEnvId, monitorLocal } = useSettings();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Derive global system health from all environments
  const allUp = Object.values(environmentsHealth).every(h => h.up);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-headlines text-accent text-2xl tracking-cinematic uppercase"
        >
          SewDigital
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-surface-gray overflow-hidden font-body relative">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Global Persistence Status Bar */}
      <div className="fixed top-6 right-10 z-[100] flex items-center gap-3">
        <div className="premium-card p-1.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl">
          {environments.map((env) => {
            const health = environmentsHealth[env.id] || { up: true, latency: 0 };
            const isActive = env.id === activeEnvId;
            const shortCode = env.name.charAt(0);
            const isDisabled = env.id === "local" && !monitorLocal;

            return (
              <div 
                key={env.id}
                title={isDisabled ? `${env.name}: Monitoring disabled` : `${env.name}: ${health.up ? 'Up' : 'Down'} (${health.latency || 0}ms)`}
                className={cn(
                  "relative group flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300",
                  isDisabled
                    ? "bg-black/20 border-white/[0.03] opacity-30 grayscale"
                    : isActive 
                    ? "bg-white/10 border-white/20 shadow-lg scale-110" 
                    : "bg-black/40 border-white/5 hover:border-white/10"
                )}
              >
                <span className={cn(
                  "text-[11px] font-headlines transition-colors",
                  isDisabled ? "text-stone-600" : health.up ? "text-stone-300" : "text-red-500 animate-pulse"
                )}>
                  {shortCode}
                </span>
                
                {/* Status LED */}
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-black",
                  isDisabled 
                    ? "bg-stone-700"
                    : health.up ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]" : "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                )} />

                {/* Hover Tooltip - Name */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[9px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {isDisabled ? `${env.name} (off)` : env.name}
                </div>
              </div>
            );
          })}

          <div className="h-6 w-px bg-white/10 mx-1" />
          
          <div className={cn(
            "p-2 rounded-xl transition-all",
            allUp ? "text-green-400" : "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          )}>
            {allUp ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
          </div>
        </div>
      </div>

      <main className={cn(
        "flex-1 p-10 overflow-y-auto min-h-screen transition-all duration-300 scrollbar-hide",
        isCollapsed ? "ml-20" : "ml-64"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

