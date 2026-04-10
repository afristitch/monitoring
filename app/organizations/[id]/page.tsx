"use client";

import { useEffect, useState, use } from "react";
import { AppLayout } from "@/components/AppLayout";
import { api } from "@/lib/api-client";
import { Organization, User } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  TrendingDown,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ManagementModal } from "@/components/ManagementModal";
import { Settings2 } from "lucide-react";

interface OrgStats {
  totalOrders: number;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'subscription' | 'delete'>('edit');

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const [orgRes, statsRes, usersRes] = await Promise.all([
        api.get(`/organization/${id}`),
        api.get(`/orders/reports/financial?organizationId=${id}`),
        api.get(`/users?organizationId=${id}`)
      ]);

      if (orgRes.success) setOrganization(orgRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch organization details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-white/20" />
        </div>
      </AppLayout>
    );
  }

  if (!organization) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-stone-500">Organization not found.</p>
          <Link href="/organizations" className="text-accent hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  const kpis = [
    { 
      label: "Revenue", 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: TrendingUp, 
      color: "text-white"
    },
    { 
      label: "Collected", 
      value: formatCurrency(stats?.totalCollected || 0), 
      icon: ShieldCheck, 
      color: "text-white"
    },
    { 
      label: "Outstanding", 
      value: formatCurrency(stats?.totalOutstanding || 0), 
      icon: Activity, 
      color: "text-white"
    },
    { 
      label: "Total Orders", 
      value: (stats?.totalOrders || 0).toString(), 
      icon: ShoppingBag, 
      color: "text-white"
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        <Link href="/organizations" className="inline-flex items-center gap-2 text-stone-500 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Profile Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {organization.logoUrl ? (
                <img src={organization.logoUrl} alt={organization.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-stone-700" />
              )}
            </div>
            <div className="space-y-2">
              <h2 className="font-headlines text-5xl uppercase tracking-tight">{organization.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-stone-400 text-sm">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {organization.email || "No email"}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {organization.phone || "No phone"}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {formatDate(organization.createdAt || "")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
              organization.subscriptionStatus?.toLowerCase() === 'active'
                ? 'bg-green-400/10 text-green-400 border-green-400/20'
                : organization.subscriptionStatus?.toLowerCase() === 'trialing'
                ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                : 'bg-red-400/10 text-red-400 border-red-400/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                organization.subscriptionStatus?.toLowerCase() === 'active' ? 'bg-green-400' :
                organization.subscriptionStatus?.toLowerCase() === 'trialing' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              {organization.subscriptionStatus} Plan
            </span>
            <p className="text-stone-500 text-[10px] uppercase font-bold tracking-tighter">
              Subscription ends {organization.subscriptionEndsAt ? formatDate(organization.subscriptionEndsAt) : "N/A"}
            </p>
            <button 
              onClick={() => {
                setModalMode('edit');
                setIsModalOpen(true);
              }}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Manage Organization
            </button>
          </div>
        </header>

        {/* Stats Grid */}
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
              </div>
              <div>
                <p className="text-stone-500 text-sm font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-stone-500" />
            <h3 className="font-headlines text-xl uppercase">Team Members</h3>
          </div>
          
          <div className="premium-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-stone-500 italic">No members found for this organization.</td>
                  </tr>
                ) : (
                    users.map((user, index) => {
                      const avatarUrl = user.photoUrl || (user as any).photo || (user as any).avatar || (user as any).profile?.photo || (user as any).profile?.avatar;
                      
                      return (
                        <motion.tr 
                          key={user._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold overflow-hidden border border-white/10">
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name.charAt(0)
                                )}
                              </div>
                              <span className="text-sm font-medium">{user.name}</span>
                            </div>
                          </td>
                      <td className="px-6 py-4 text-sm font-medium text-stone-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 bg-white/5 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                      </td>
                    </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ManagementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organization={organization}
        mode={modalMode}
        onUpdate={fetchData}
      />
    </AppLayout>
  );
}
