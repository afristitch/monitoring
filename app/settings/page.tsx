"use client";

import { AppLayout } from "@/components/AppLayout";
import { 
  Settings, 
  Globe, 
  Settings2, 
  ShieldCheck, 
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  ExternalLink,
  Save,
  BarChart3,
  Lock,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "@/context/SettingsProvider";
import { useAuth } from "@/context/AuthContext";
import { ServiceHealth, HealthHistoryItem } from "@/context/types";
import { useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { cn } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    environments, 
    environmentsHealth,
    activeEnvId, 
    activeEnvironment,
    setActiveEnvId, 
    monitoringEnabled, 
    setMonitoringEnabled,
    setCheckInterval,
    checkInterval,
    healthStatus,
    healthHistory,
    selectedPeriod,
    setSelectedPeriod,
    fetchingHistory,
    lastChecked,
    refreshHealth,
    pingEnvironment,
    fetchHistory,
    monitorLocal
  } = useSettings();

  const [pinging, setPinging] = useState<Record<string, boolean>>({});

  const handlePing = async (id: string) => {
    setPinging(prev => ({ ...prev, [id]: true }));
    try {
      await pingEnvironment(id);
    } finally {
      setPinging(prev => ({ ...prev, [id]: false }));
    }
  };

  const isGlobalUp = Object.values(environmentsHealth).every(h => h.up);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium uppercase tracking-widest">
            <Settings className="w-4 h-4 text-accent" />
            Control Panel
          </div>
          <h2 className="font-headlines text-3xl uppercase">Platform Settings</h2>
          <p className="text-stone-400">Manage environments, monitoring protocols, and infrastructure parameters.</p>
        </header>

        {/* Global Infrastructure Sync */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-headlines text-lg uppercase tracking-wider">Infrastructure Grid</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {environments.map((env) => {
                const health = environmentsHealth[env.id] || { up: true, latency: 0 };
                const isActive = env.id === activeEnvId;

                return (
                  <div 
                    key={env.id} 
                    className={cn(
                      "p-6 rounded-2xl border transition-all duration-300",
                      // Local disabled state
                      env.id === "local" && !monitorLocal
                        ? "bg-white/[0.01] border-white/[0.03] opacity-40 grayscale"
                        : isActive 
                        ? "bg-accent/[0.03] border-accent/20 shadow-[0_0_30px_rgba(255,255,255,0.02)]" 
                        : "bg-white/[0.02] border-white/5 opacity-80 hover:opacity-100 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "p-2 rounded-lg",
                           isActive ? "bg-accent/20 text-accent" : "bg-white/5 text-stone-500"
                         )}>
                           <ShieldCheck className="w-4 h-4" />
                         </div>
                         <h4 className="text-xs font-bold uppercase tracking-widest">{env.name}</h4>
                         {env.id === "local" && !monitorLocal && (
                           <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600 border border-stone-700 rounded px-1.5 py-0.5">Disabled</span>
                         )}
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        health.up ? "bg-green-400" : "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                      )} />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePing(env.id);
                        }}
                        disabled={pinging[env.id] || (env.id === "local" && !monitorLocal)}
                        className={cn(
                          "ml-2 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-accent/40 text-stone-500 hover:text-accent transition-all",
                          (pinging[env.id] || (env.id === "local" && !monitorLocal)) && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                        title={env.id === "local" && !monitorLocal ? "Local monitoring disabled" : "Ping Infrastructure"}
                      >
                        {pinging[env.id] ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">Status</span>
                          <span className={cn(
                            "text-[10px] font-headlines uppercase tracking-[0.2em]",
                            health.up ? "text-green-400" : "text-red-400"
                          )}>
                            {health.up ? "ONLINE" : "OFFLINE"}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">Latency</span>
                          <span className="text-[10px] font-mono text-stone-400 tracking-widest">{health.latency}ms</span>
                       </div>
                       
                       <div className="pt-2">
                          <p className="text-[9px] font-mono text-stone-700 break-all bg-black/40 p-2 rounded-lg border border-white/[0.02]">
                            {env.baseUrl}
                          </p>
                       </div>

                       {isActive && (
                         <div className="mt-4 pt-4 border-t border-accent/10">
                            <div className="flex items-center gap-2 text-accent">
                               <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
                               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Context</span>
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
           </div>
        </section>

        {/* Live Monitoring Dashboard (Mini) */}
        <section className="premium-card p-8">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-accent">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headlines text-md uppercase tracking-wider">Health Stream</h3>
                    <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">
                      {lastChecked ? `Last Pulse: ${lastChecked.toLocaleTimeString()}` : 'Initializing stream...'}
                    </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isGlobalUp ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", isGlobalUp ? "text-green-400" : "text-red-400")}>
                    SYSTEM {isGlobalUp ? "OPERATIONAL" : "OUTAGE DETECTED"}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {healthStatus.map((service: ServiceHealth) => (
                 <div key={service.name} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">{service.name}</p>
                        <p className={`text-sm font-medium ${service.up ? 'text-stone-200' : 'text-red-400'}`}>{service.status}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${service.up ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'}`} />
                 </div>
               ))}
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="premium-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/5 rounded-xl text-accent">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-headlines text-md uppercase tracking-wider">Active Workspace</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Selected Environment</label>
                <SearchableSelect 
                  options={environments.map(e => ({ _id: e.id, name: e.name }))}
                  value={activeEnvId}
                  onChange={(id) => setActiveEnvId(id)}
                  searchable={false}
                />
              </div>

              {activeEnvironment && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Base API URL</p>
                    <p className="text-xs font-mono text-stone-400 break-all">{activeEnvironment.baseUrl}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="premium-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-accent">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-headlines text-md uppercase tracking-wider">Monitoring</h3>
              </div>
              
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                isGlobalUp ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {isGlobalUp ? "UP" : "DOWN"}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-200">Global Pulse Checks</p>
                    {!isSuperAdmin && <Lock className="w-3 h-3 text-stone-600" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-stone-500 whitespace-nowrap">Pulse Rate:</p>
                    <div className="w-24">
                      <SearchableSelect 
                        options={[
                          { _id: '30', name: '30s' },
                          { _id: '60', name: '60s' },
                          { _id: '300', name: '5m' },
                          { _id: '600', name: '10m' },
                          { _id: '1800', name: '30m' },
                        ]}
                        value={checkInterval.toString()}
                        onChange={(val) => setCheckInterval(parseInt(val))}
                        searchable={false}
                        disabled={!isSuperAdmin}
                      />
                    </div>
                  </div>
                </div>
                <button 
                  disabled={!isSuperAdmin}
                  onClick={() => setMonitoringEnabled(!monitoringEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${monitoringEnabled ? 'bg-accent' : 'bg-white/10'} ${!isSuperAdmin && 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${monitoringEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Pulse Frequency</p>
                  <p className="text-xs text-stone-400">Fixed at {checkInterval}s for global consistency and session sync.</p>
              </div>

              <button 
                onClick={() => refreshHealth()}
                className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-accent/40 hover:text-accent transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Force Sync Now
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}


