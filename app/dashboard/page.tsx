"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  TrendingDown,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { SearchableSelect } from "@/components/SearchableSelect";


interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
}

const mockData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
];

import { useSettings } from "@/context/SettingsProvider";
import { ServiceHealth } from "@/context/types";

export default function DashboardPage() {
  const { healthStatus, monitoringEnabled } = useSettings();
  const [stats, setStats] = useState<Stats | null>(null);

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7m");
  const [orgCount, setOrgCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchChartData = async (period: string) => {
    setChartLoading(true);
    try {
      const res = await api.get(`/orders/reports/revenue-chart?period=${period}`);
      if (res.success) {
        setRevenueData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch chart data", err);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [finRes, orgRes, userRes] = await Promise.all([
          api.get("/orders/reports/financial"),
          api.get("/organization/all"),
          api.get("/users")
        ]);

        if (finRes.success) setStats(finRes.data);
        if (orgRes.success) setOrgCount(orgRes.data.pagination?.total || orgRes.data.data?.length || 0);
        if (userRes.success) setUserCount(userRes.data.pagination?.total || userRes.data.data?.length || 0);
        
        // Fetch initial chart data
        await fetchChartData(selectedPeriod);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Update chart when period changes
  useEffect(() => {
    if (!loading) {
      fetchChartData(selectedPeriod);
    }
  }, [selectedPeriod]);


  const kpis = [
    { 
      label: "Global Revenue", 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: TrendingUp, 
      color: "text-white",
      trend: "+12.5%",
      trendUp: true
    },
    { 
      label: "Total Organizations", 
      value: orgCount.toString(), 
      icon: Building2, 
      color: "text-white",
      trend: "+2 this week",
      trendUp: true
    },
    { 
      label: "Active Users", 
      value: userCount.toString(), 
      icon: Users, 
      color: "text-white",
      trend: "+4.3%",
      trendUp: true
    },
    { 
      label: "Total Orders", 
      value: (stats?.totalOrders || 0).toString(), 
      icon: ShoppingBag, 
      color: "text-white",
      trend: "-1.2%",
      trendUp: false
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium uppercase tracking-widest">
            <Activity className="w-4 h-4 text-accent" />
            Live Platform Overview
          </div>
          <h2 className="font-headlines text-3xl uppercase">Command Center</h2>
          <p className="text-stone-400 max-w-2xl">
            Real-time analytics and platform performance metrics for the entire SewDigital network.
          </p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="premium-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.trend}
                  {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </div>
              </div>
              <div>
                <p className="text-stone-500 text-sm font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{loading ? "..." : kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 premium-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headlines text-lg uppercase tracking-wider">Revenue Stream</h3>
              <SearchableSelect 
                options={[
                  { _id: '30d', name: 'Last 30 Days' },
                  { _id: '90d', name: 'Last Quarter' },
                  { _id: '6m', name: 'Last 6 Months' },
                  { _id: '12m', name: 'Last 12 Months' },
                  { _id: 'ytd', name: 'Year to Date' },
                ]}
                value={selectedPeriod}
                onChange={(val) => setSelectedPeriod(val)} 
                searchable={false}
                showAllOption={false}
                allLabel="All Periods"
                noResultsLabel="No periods found"
                className="min-w-[180px]"
              />



            </div>
            <div className="h-80 w-full relative">
              {chartLoading && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                  <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                </div>
              )}
              {!loading && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#78716C', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#78716C', fontSize: 12 }} 
                      tickFormatter={(val) => `GH₵${val/1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#FFFFFF" 
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-600 italic text-sm">
                  {loading || chartLoading ? "Decrypting financial stream..." : "No revenue data found for the selected period."}
                </div>
              )}
            </div>

          </div>

          <div className="premium-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headlines text-lg uppercase tracking-wider">System Health</h3>
              {monitoringEnabled && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
            </div>
            <div className="space-y-6">
              {healthStatus.map((service: ServiceHealth) => (
                <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className={`text-xs font-bold ${service.up ? 'text-green-400' : 'text-orange-400'}`}>{service.status}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${service.up ? 'bg-green-400' : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 rounded-xl border border-accent/20 bg-accent/5">

              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Notice</p>
              <p className="text-xs text-stone-400 leading-relaxed">
                Platform maintenance scheduled for May 14th. All org nodes will remain active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
