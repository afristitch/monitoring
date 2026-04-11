export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  healthUrl: string;
}

export interface ServiceHealth {
  name: string;
  status: string;
  up: boolean;
}

export interface HealthHistoryItem {
  timestamp: string;
  status: 'UP' | 'DOWN';
  latency?: number;
}

export interface AppVersionData {
  latestIosVersion: string;
  latestAndroidVersion: string;
  iosUpdateUrl: string;
  androidUpdateUrl: string;
  forceUpdate: boolean;
  notifyUsers?: boolean;
}

export interface SettingsContextType {
  environments: Environment[];
  activeEnvId: string;
  activeEnvironment: Environment | null;
  monitoringEnabled: boolean;
  checkInterval: number;
  healthStatus: ServiceHealth[];
  environmentsHealth: Record<string, { up: boolean; latency: number }>;
  healthHistory: HealthHistoryItem[];
  lastChecked: Date | null;
  selectedPeriod: '7d' | '30d';
  fetchingHistory: boolean;
  monitorLocal: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  latestIosVersion: string;
  latestAndroidVersion: string;
  iosUpdateUrl: string;
  androidUpdateUrl: string;
  forceUpdate: boolean;
  addEnvironment: (env: Omit<Environment, 'id'>) => void;
  updateEnvironment: (id: string, env: Partial<Environment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvId: (id: string) => void;
  setMonitoringEnabled: (enabled: boolean) => Promise<void>;
  setCheckInterval: (seconds: number) => void;
  setSelectedPeriod: (period: '7d' | '30d') => void;
  refreshHealth: () => Promise<void>;
  pingEnvironment: (id: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  setMaintenanceMode: (enabled: boolean, message: string) => Promise<void>;
  refreshMaintenanceStatus: () => Promise<void>;
  updateAppVersions: (data: AppVersionData) => Promise<void>;
}
