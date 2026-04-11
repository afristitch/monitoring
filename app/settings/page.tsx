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
  Loader2,
  ShieldAlert,
  Info,
  Smartphone,
  Bell,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "@/context/SettingsProvider";
import { useAuth } from "@/context/AuthContext";
import { ServiceHealth, HealthHistoryItem } from "@/context/types";
import { useState, useEffect } from "react";
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
    monitorLocal,
    maintenanceMode,
    maintenanceMessage: providerMaintenanceMessage,
    setMaintenanceMode,
    refreshMaintenanceStatus,
    latestIosVersion: providerIosVersion,
    latestAndroidVersion: providerAndroidVersion,
    iosUpdateUrl: providerIosUrl,
    androidUpdateUrl: providerAndroidUrl,
    forceUpdate: providerForceUpdate,
    updateAppVersions
  } = useSettings();

  const [pinging, setPinging] = useState<Record<string, boolean>>({});
  const [localMaintenanceMessage, setLocalMaintenanceMessage] = useState(providerMaintenanceMessage);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // App Distribution Local State
  const [localIosVersion, setLocalIosVersion] = useState(providerIosVersion);
  const [localAndroidVersion, setLocalAndroidVersion] = useState(providerAndroidVersion);
  const [localIosUrl, setLocalIosUrl] = useState(providerIosUrl);
  const [localAndroidUrl, setLocalAndroidUrl] = useState(providerAndroidUrl);
  const [localForceUpdate, setLocalForceUpdate] = useState(providerForceUpdate);
  const [notifyUsers, setNotifyUsers] = useState(false);
  const [releasing, setReleasing] = useState(false);

  // Sync local version state when provider state changes
  useEffect(() => {
    setLocalIosVersion(providerIosVersion);
    setLocalAndroidVersion(providerAndroidVersion);
    setLocalIosUrl(providerIosUrl);
    setLocalAndroidUrl(providerAndroidUrl);
    setLocalForceUpdate(providerForceUpdate);
  }, [providerIosVersion, providerAndroidVersion, providerIosUrl, providerAndroidUrl, providerForceUpdate]);

  // Sync local message when provider message changes (e.g. on initial load or refresh)
  useEffect(() => {
    setLocalMaintenanceMessage(providerMaintenanceMessage);
  }, [providerMaintenanceMessage]);

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
                            env.id === "local" && !monitorLocal ? "text-stone-600" :
                            health.up ? "text-green-400" : "text-red-400"
                          )}>
                            {env.id === "local" && !monitorLocal ? "DISABLED" : (health.up ? "ONLINE" : "OFFLINE")}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">Latency</span>
                          <span className="text-[10px] font-mono text-stone-400 tracking-widest">
                            {env.id === "local" && !monitorLocal ? "---" : `${health.latency}ms`}
                          </span>
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

          {/* Maintenance Mode Control */}
          <section className="premium-card p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headlines text-md uppercase tracking-wider">System Guard</h3>
                  <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">Public Traffic Control</p>
                </div>
              </div>
              
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                maintenanceMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"
              )}>
                {maintenanceMode ? "MAINTENANCE ACTIVE" : "SYSTEM LIVE"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-200">Global Maintenance Mode</p>
                    <p className="text-xs text-stone-500">Redirects all public traffic to a maintenance screen.</p>
                  </div>
                  <button 
                    disabled={!isSuperAdmin || savingMaintenance}
                    onClick={() => setMaintenanceMode(!maintenanceMode, localMaintenanceMessage)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      maintenanceMode ? 'bg-red-500' : 'bg-white/10',
                      (!isSuperAdmin || savingMaintenance) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-black transition-all",
                      maintenanceMode ? 'left-7' : 'left-1'
                    )} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-stone-900/50 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Info className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">SuperAdmin Notice</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    While maintenance is active, only SuperAdmins and internal API nodes can bypass the block. 
                    Ensure you have updated the message before activating.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Public Display Message</label>
                  <textarea 
                    value={localMaintenanceMessage}
                    onChange={(e) => setLocalMaintenanceMessage(e.target.value)}
                    disabled={!isSuperAdmin || savingMaintenance}
                    placeholder="We are currently performing scheduled maintenance..."
                    className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-stone-300 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all resize-none outline-none"
                  />
                </div>

                <button 
                  disabled={!isSuperAdmin || savingMaintenance || (localMaintenanceMessage === providerMaintenanceMessage)}
                  onClick={async () => {
                    setSavingMaintenance(true);
                    try {
                      await setMaintenanceMode(maintenanceMode, localMaintenanceMessage);
                    } finally {
                      setSavingMaintenance(false);
                    }
                  }}
                  className="w-full py-4 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold uppercase tracking-widest text-accent hover:bg-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {savingMaintenance ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Apply Guard Configuration
                </button>
              </div>
            </div>
          </section>

          {/* App Distribution & Releases */}
          <section className="premium-card p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headlines text-md uppercase tracking-wider">App Distribution</h3>
                  <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">Mobile Release Control</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-stone-500 font-bold">iOS</div>
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-stone-500 font-bold">AD</div>
                 </div>
                 <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Current: {providerIosVersion} / {providerAndroidVersion}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Latest iOS</label>
                    <input 
                      type="text"
                      value={localIosVersion}
                      onChange={(e) => setLocalIosVersion(e.target.value)}
                      disabled={!isSuperAdmin || releasing}
                      placeholder="1.0.0"
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-stone-300 focus:border-accent/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Latest Android</label>
                    <input 
                      type="text"
                      value={localAndroidVersion}
                      onChange={(e) => setLocalAndroidVersion(e.target.value)}
                      disabled={!isSuperAdmin || releasing}
                      placeholder="1.0.0"
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-stone-300 focus:border-accent/40 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      iOS Update URL
                    </label>
                    <input 
                      type="text"
                      value={localIosUrl}
                      onChange={(e) => setLocalIosUrl(e.target.value)}
                      disabled={!isSuperAdmin || releasing}
                      placeholder="https://apps.apple.com/..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-mono text-stone-400 focus:border-accent/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      Android Update URL
                    </label>
                    <input 
                      type="text"
                      value={localAndroidUrl}
                      onChange={(e) => setLocalAndroidUrl(e.target.value)}
                      disabled={!isSuperAdmin || releasing}
                      placeholder="https://play.google.com/..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-mono text-stone-400 focus:border-accent/40 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-stone-200">Critical Update (Forced)</p>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Blocks old app sessions</p>
                      </div>
                      <button 
                        disabled={!isSuperAdmin || releasing}
                        onClick={() => setLocalForceUpdate(!localForceUpdate)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          localForceUpdate ? 'bg-accent' : 'bg-white/10',
                          (!isSuperAdmin || releasing) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-black transition-all",
                          localForceUpdate ? 'left-7' : 'left-1'
                        )} />
                      </button>
                   </div>

                   <hr className="border-white/5" />

                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Bell className={cn("w-3 h-3", notifyUsers ? "text-accent animate-pulse" : "text-stone-600")} />
                          <p className="text-sm font-medium text-stone-200">Broadcast Update Alert</p>
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider text-accent/80">Trigger Push Notifications</p>
                      </div>
                      <button 
                        disabled={!isSuperAdmin || releasing}
                        onClick={() => setNotifyUsers(!notifyUsers)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative border border-accent/20",
                          notifyUsers ? 'bg-accent/20' : 'bg-transparent',
                          (!isSuperAdmin || releasing) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full transition-all",
                          notifyUsers ? 'left-7 bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]' : 'left-1 bg-stone-700'
                        )} />
                      </button>
                   </div>
                </div>

                <div className="pt-2">
                   <button 
                    disabled={!isSuperAdmin || releasing || (
                      localIosVersion === providerIosVersion && 
                      localAndroidVersion === providerAndroidVersion && 
                      localIosUrl === providerIosUrl && 
                      localAndroidUrl === providerAndroidUrl && 
                      localForceUpdate === providerForceUpdate &&
                      !notifyUsers
                    )}
                    onClick={async () => {
                      setReleasing(true);
                      try {
                        await updateAppVersions({
                          latestIosVersion: localIosVersion,
                          latestAndroidVersion: localAndroidVersion,
                          iosUpdateUrl: localIosUrl,
                          androidUpdateUrl: localAndroidUrl,
                          forceUpdate: localForceUpdate,
                          notifyUsers: notifyUsers
                        });
                        setNotifyUsers(false); // Reset notification toggle after success
                      } finally {
                        setReleasing(false);
                      }
                    }}
                    className="w-full py-4 bg-accent text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(var(--accent-rgb),0.2)]"
                  >
                    {releasing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    {notifyUsers ? "Release & Notify All Users" : "Sync App Versions"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}


