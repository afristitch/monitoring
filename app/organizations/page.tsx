"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { api } from "@/lib/api-client";
import { Organization } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { 
  Building2, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Loader2,
  Settings2,
  ShieldCheck,
  Trash2,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/Pagination";
import { ManagementModal } from "@/components/ManagementModal";
import { SearchableSelect } from "@/components/SearchableSelect";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Management State
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'subscription' | 'delete'>('edit');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      setLoading(true);
      try {
        const response = await api.get(`/organization/all?search=${search}&page=${currentPage}&limit=${ITEMS_PER_PAGE}&status=${statusFilter}`);
        if (response.success) {
          setOrganizations(response.data.data || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchOrganizations, 300);
    return () => clearTimeout(timer);
  }, [search, currentPage, statusFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/organization/all?search=${search}&page=${currentPage}&limit=${ITEMS_PER_PAGE}&status=${statusFilter}`);
      if (response.success) {
        setOrganizations(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (org: Organization, mode: 'edit' | 'subscription' | 'delete') => {
    setSelectedOrg(org);
    setModalMode(mode);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-stone-500 text-sm font-medium uppercase tracking-widest">
              <Building2 className="w-4 h-4 text-accent" />
              Tenant Directory
            </div>
            <h2 className="font-headlines text-3xl uppercase">Organizations</h2>
            <p className="text-stone-400">Manage all business accounts and their platform status.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <SearchableSelect 
              options={[
                { _id: 'active', name: 'Active' },
                { _id: 'trialing', name: 'Trialing' },
                { _id: 'expired', name: 'Expired' },
                { _id: 'cancelled', name: 'Cancelled' },
              ]}
              value={statusFilter}
              onChange={handleStatusChange}
              allLabel="All Statuses"
              searchable={false}
            />


            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-surface-gray border border-white/5 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/20 transition-all text-sm"
              />
            </div>
          </div>
        </header>

        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Business Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Ends At</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white/20 mx-auto" />
                    </td>
                  </tr>
                ) : organizations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-stone-500">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                    organizations.map((org, index) => {
                      const now = new Date();
                      const endsAt = org.subscriptionEndsAt ? new Date(org.subscriptionEndsAt) : null;
                      const isTrialing = org.subscriptionStatus?.toLowerCase() === 'trialing';
                      const isActuallyExpired = org.subscriptionStatus?.toLowerCase() === 'expired' || (isTrialing && endsAt && endsAt < now);
                      const displayStatus = isActuallyExpired ? 'expired' : (isTrialing ? 'trialing' : (org.subscriptionStatus || 'inactive'));

                      return (
                        <motion.tr
                          key={org._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white overflow-hidden">
                                {org.logoUrl ? (
                                  <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                                ) : (
                                  org.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{org.name}</p>
                                <p className="text-xs text-stone-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{org._id?.toString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{org.email || "No email"}</p>
                            <p className="text-xs text-stone-500">{org.phone || "No phone"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              displayStatus === 'active'
                                ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                                : displayStatus === 'trialing'
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                : 'bg-red-400/10 text-red-400 border border-red-400/20'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                 displayStatus === 'active' ? 'bg-green-400' :
                                 displayStatus === 'trialing' ? 'bg-amber-400' : 'bg-red-400'
                              }`} />
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-500">
                            {org.subscriptionEndsAt ? formatDate(org.subscriptionEndsAt) : "Open Ended"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/organizations/${org._id}`}
                                className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-all"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              
                              <div className={`relative ${openMenuId === org._id ? "z-[60]" : "z-0"}`}>
                                <button 
                                  onClick={() => setOpenMenuId(openMenuId === org._id ? null : org._id as string)}
                                  className={`p-2 rounded-lg transition-all ${
                                    openMenuId === org._id ? "bg-white/10 text-white" : "text-stone-500 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                <AnimatePresence>
                                  {openMenuId === org._id && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setOpenMenuId(null)}
                                      />
                                      {(() => {
                                        const openUpwards = index >= organizations.length - 2;
                                        return (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                                            className={`absolute right-0 w-48 bg-stone-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden ${
                                              openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                                            }`}
                                          >
                                            <button 
                                              onClick={() => openModal(org, 'edit')}
                                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                              Edit Details
                                            </button>
                                            <button 
                                              onClick={() => openModal(org, 'subscription')}
                                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                                            >
                                              <ShieldCheck className="w-3.5 h-3.5" />
                                              Subscription
                                            </button>
                                            <div className="h-px bg-white/5 my-1" />
                                            <button 
                                              onClick={() => openModal(org, 'delete')}
                                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-widest"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              Delete
                                            </button>
                                          </motion.div>
                                        );
                                      })()}
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ManagementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organization={selectedOrg}
        mode={modalMode}
        onUpdate={fetchOrganizations}
      />
    </AppLayout>
  );
}
