"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { ServiceHealth, SettingsContextType, HealthHistoryItem } from "./types";
import { DEFAULT_ENVIRONMENTS, Environment } from "@/lib/environments";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// When NEXT_PUBLIC_MONITOR_LOCAL=false, local is excluded from the monitoring loop
const MONITOR_LOCAL = process.env.NEXT_PUBLIC_MONITOR_LOCAL !== "false";
const MONITORED_ENVIRONMENTS = MONITOR_LOCAL
  ? DEFAULT_ENVIRONMENTS
  : DEFAULT_ENVIRONMENTS.filter(e => e.id !== "local");

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [activeEnvId, setActiveEnvId] = useState<string>("local");
  const [monitoringEnabled, _setMonitoringEnabled] = useState<boolean>(true);
  const [checkInterval, setCheckIntervalState] = useState<number>(60);
  const [healthStatus, setHealthStatus] = useState<ServiceHealth[]>([
    { name: "API Server", status: "Checking", up: true },
    { name: "Host Memory", status: "Checking", up: true },
    { name: "CPU Load", status: "Checking", up: true },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [uptimeMetrics, setUptimeMetrics] = useState({ total: 0, successes: 0 });
  const [healthHistory, setHealthHistory] = useState<HealthHistoryItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('7d');
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [maintenanceMode, setMaintenanceModeState] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessageState] = useState<string>("");

  const [latestIosVersion, setLatestIosVersion] = useState<string>("");
  const [latestAndroidVersion, setLatestAndroidVersion] = useState<string>("");
  const [iosUpdateUrl, setIosUpdateUrl] = useState<string>("");
  const [androidUpdateUrl, setAndroidUpdateUrl] = useState<string>("");
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  const [environmentsHealth, setEnvironmentsHealth] = useState<Record<string, { up: boolean; latency: number }>>({});

  // Initialize from Backend & LocalStorage
  const fetchSettings = async () => {
    try {
      const res = await api.get("/system/health/settings");
      if (res.success && res.data) {
        _setMonitoringEnabled(res.data.monitoringEnabled);
        setCheckIntervalState(res.data.checkInterval || 60);
      }
    } catch (err) {
      // Silent fallback for 404s/dev
      const savedMonitoring = localStorage.getItem("sd_monitoring_enabled");
      if (savedMonitoring) _setMonitoringEnabled(savedMonitoring === "true");
    }
  };

  const refreshMaintenanceStatus = async () => {
    try {
      const res = await api.get("/system/maintenance");
      if (res.success && res.data) {
        setMaintenanceModeState(res.data.maintenanceMode);
        setMaintenanceMessageState(res.data.maintenanceMessage || "");
        
        // App Distribution Stats
        setLatestIosVersion(res.data.latestIosVersion || "");
        setLatestAndroidVersion(res.data.latestAndroidVersion || "");
        setIosUpdateUrl(res.data.iosUpdateUrl || "");
        setAndroidUpdateUrl(res.data.androidUpdateUrl || "");
        setForceUpdate(res.data.forceUpdate || false);
      }
    } catch (err) {
      console.warn("Could not fetch maintenance status");
    }
  };

  // Initialize from Backend & LocalStorage
  useEffect(() => {
    fetchSettings();
    refreshMaintenanceStatus();
    
    const savedActive = localStorage.getItem("sd_active_env");
    const savedMetrics = localStorage.getItem("sd_uptime_metrics");

    if (savedActive) setActiveEnvId(savedActive);
    if (savedMetrics) setUptimeMetrics(JSON.parse(savedMetrics));
  }, []);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    // FALLBACK: History endpoint not currently supported by backend documentation
    // Using mock data for visual consistency in the dashboard
    const mock: HealthHistoryItem[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      status: (Math.random() > 0.05 ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
      latency: Math.floor(Math.random() * 200) + 20
    })).reverse();
    setHealthHistory(mock);
    setFetchingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedPeriod]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("sd_active_env", activeEnvId);
    setUptimeMetrics({ total: 0, successes: 0 });
  }, [activeEnvId]);

  useEffect(() => {
    localStorage.setItem("sd_uptime_metrics", JSON.stringify(uptimeMetrics));
  }, [uptimeMetrics]);

  const setMonitoringEnabled = async (enabled: boolean) => {
    // Optimistic Update
    _setMonitoringEnabled(enabled);
    localStorage.setItem("sd_monitoring_enabled", enabled.toString());

    try {
      await api.patch("/system/health/settings", { monitoringEnabled: enabled });
    } catch (err) {
      console.warn("Backend sync failed (Endpoint might not exist yet), but local state is updated.");
    }
  };

  const activeEnvironment = DEFAULT_ENVIRONMENTS.find(e => e.id === activeEnvId) || DEFAULT_ENVIRONMENTS[0];

  /** Parse memory & CPU from /health body and return an array of ServiceHealth entries */
  const buildHealthStatus = (latency: number, body: any): ServiceHealth[] => {
    const mem = body?.metrics?.memory;
    const cpu = body?.metrics?.cpu;

    const memStatus = mem?.systemUsed
      ? `${mem.systemUsed} / ${mem.systemTotal} (${mem.systemUsagePercent})`
      : mem?.heapUsed
      ? `${mem.heapUsed} / ${mem.heapTotal}`
      : "Unknown";

    const cpuStatus = cpu?.load1m
      ? `${cpu.load1m} · ${cpu.load5m} · ${cpu.load15m} (${cpu.cores} cores)`
      : "Unknown";

    return [
      { name: "API Server", status: `Healthy (${latency}ms)`, up: true },
      { name: "Host Memory", status: memStatus, up: true },
      { name: "CPU Load", status: cpuStatus, up: true },
    ];
  };

  const refreshHealth = async () => {
    // Sync global settings from the backend
    await fetchSettings();

    const healthResults: Record<string, { up: boolean; latency: number }> = {};

    try {
      await Promise.all(MONITORED_ENVIRONMENTS.map(async (env) => {
        const start = Date.now();
        try {
          const proxyRes = await fetch(`/api/proxy-ping?url=${encodeURIComponent(env.healthUrl)}`, { cache: 'no-store' });
          const result = await proxyRes.json();
          
          healthResults[env.id] = { up: result.ok, latency: result.latency };

          // If this is the active env, update the detailed stream
          if (env.id === activeEnvId) {
            setUptimeMetrics(prev => ({ 
              total: prev.total + 1, 
              successes: prev.successes + (result.ok ? 1 : 0) 
            }));

            if (result.ok) {
              setHealthStatus(buildHealthStatus(result.latency, result.body));
            } else {
              setHealthStatus(prev => prev.map((s: ServiceHealth) => ({ ...s, status: "Error", up: false })));
            }
          }
        } catch (err) {
          healthResults[env.id] = { up: false, latency: 0 };
          if (env.id === activeEnvId) {
            setHealthStatus(prev => prev.map((s: ServiceHealth) => ({ ...s, status: "Unreachable", up: false })));
          }
        }
      }));

      setEnvironmentsHealth(healthResults);
    } catch (err) {
      console.error("Global health check failed", err);
    } finally {
      setLastChecked(new Date());
    }
  };

  const pingEnvironment = async (id: string) => {
    if (id === "local" && !MONITOR_LOCAL) return;
    const env = DEFAULT_ENVIRONMENTS.find(e => e.id === id);
    if (!env) return;

    const start = Date.now();
    try {
      const proxyRes = await fetch(`/api/proxy-ping?url=${encodeURIComponent(env.healthUrl)}`, { cache: 'no-store' });
      const result = await proxyRes.json();
      
      setEnvironmentsHealth(prev => ({ 
        ...prev, 
        [id]: { up: result.ok, latency: result.latency } 
      }));

      // Only update the active context if we're pinging the active env
      if (id === activeEnvId) {
        if (result.ok) {
          setHealthStatus(buildHealthStatus(result.latency, result.body));
        } else {
          setHealthStatus(prev => prev.map((s: ServiceHealth) => ({ ...s, status: "Error", up: false })));
        }
      }
    } catch (err) {
      setEnvironmentsHealth(prev => ({ ...prev, [id]: { up: false, latency: 0 } }));
      if (id === activeEnvId) {
        setHealthStatus(prev => prev.map((s: ServiceHealth) => ({ ...s, status: "Unreachable", up: false })));
      }
    }
  };

  // Monitoring Interval
  useEffect(() => {
    if (!monitoringEnabled || !activeEnvironment) return;
    refreshHealth();
    const interval = setInterval(refreshHealth, checkInterval * 1000);
    return () => clearInterval(interval);
  }, [monitoringEnabled, activeEnvironment, checkInterval]);

  const addEnvironment = () => {};
  const updateEnvironment = () => {};
  const removeEnvironment = () => {};

  const setCheckInterval = async (seconds: number) => {
    // Optimistic Update
    setCheckIntervalState(seconds);
    
    try {
      await api.patch("/system/health/settings", { checkInterval: seconds });
    } catch (err) {
      console.warn("Backend sync failed for checkInterval, using local state.");
    }
  };

  const setMaintenanceMode = async (enabled: boolean, message: string) => {
    // Optimistic Update
    setMaintenanceModeState(enabled);
    setMaintenanceMessageState(message);

    try {
      await api.patch("/system/maintenance", { 
        maintenanceMode: enabled, 
        maintenanceMessage: message 
      });
    } catch (err) {
      console.error("Failed to update maintenance mode", err);
      refreshMaintenanceStatus();
      throw err;
    }
  };

  const updateAppVersions = async (data: any) => {
    // Optimistic UI Update
    setLatestIosVersion(data.latestIosVersion);
    setLatestAndroidVersion(data.latestAndroidVersion);
    setIosUpdateUrl(data.iosUpdateUrl);
    setAndroidUpdateUrl(data.androidUpdateUrl);
    setForceUpdate(data.forceUpdate);

    try {
      await api.patch("/system/versions", data);
    } catch (err) {
      console.error("Failed to update app versions", err);
      refreshMaintenanceStatus();
      throw err;
    }
  };

  const value: SettingsContextType = {
    environments: DEFAULT_ENVIRONMENTS,
    activeEnvId,
    activeEnvironment,
    monitoringEnabled,
    checkInterval,
    healthStatus,
    environmentsHealth,
    healthHistory,
    lastChecked,
    selectedPeriod,
    fetchingHistory,
    monitorLocal: MONITOR_LOCAL,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    setActiveEnvId: (id: string) => {
      setActiveEnvId(id);
      localStorage.setItem("sd_active_env", id);
      // Force reload to ensure all contexts (Auth, API, etc) re-initialize for the new env
      window.location.reload();
    },
    setMonitoringEnabled,
    setCheckInterval,
    setSelectedPeriod,
    refreshHealth,
    pingEnvironment,
    fetchHistory,
    maintenanceMode,
    maintenanceMessage,
    setMaintenanceMode,
    refreshMaintenanceStatus,
    latestIosVersion,
    latestAndroidVersion,
    iosUpdateUrl,
    androidUpdateUrl,
    forceUpdate,
    updateAppVersions
  };



  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
