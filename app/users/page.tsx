"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { api } from "@/lib/api-client";
import { User } from "@/lib/types";
import { Pagination } from "@/components/Pagination";
import { UserManagementModal } from "@/components/UserManagementModal";
import { SearchableSelect } from "@/components/SearchableSelect";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  User as UserIcon,
  Loader2,
  Mail,
  Filter,
  UserPlus,
  ExternalLink,
  Edit3,
  ShieldCheck,
  Trash2,
  Camera,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Management State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'security' | 'delete'>('edit');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?search=${search}&page=${currentPage}&limit=${ITEMS_PER_PAGE}&organizationId=${orgFilter}&status=${roleFilter}`);
      if (response.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchFilterData() {
        try {
            const res = await api.get("/organization/all?limit=1000");
            if (res.success) setOrganizations(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch organizations for filter", err);
        }
    }
    fetchFilterData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, currentPage, orgFilter, roleFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleOrgChange = (val: string) => {
    setOrgFilter(val);
    setCurrentPage(1);
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const openModal = (user: User, mode: 'edit' | 'security' | 'delete') => {
    setSelectedUser(user);
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
              <Users className="w-4 h-4 text-accent" />
              Global User Directory
            </div>
            <h2 className="font-headlines text-3xl uppercase">System Users</h2>
            <p className="text-stone-400">Manage all platform users across all organizations.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <SearchableSelect 
              options={organizations}
              value={orgFilter}
              onChange={handleOrgChange}
              allLabel="All Organizations"
              noResultsLabel="No organizations found"
            />


            <SearchableSelect 
              options={[
                { _id: 'SUPER_ADMIN', name: 'Super Admin' },
                { _id: 'ORG_ADMIN', name: 'Org Admin' },
                { _id: 'STAFF', name: 'Staff' },
              ]}
              value={roleFilter}
              onChange={handleRoleChange}
              allLabel="All Roles"
              noResultsLabel="No roles found"
              searchable={false}
            />


            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Organization ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Contact Info</th>
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
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-stone-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white overflow-hidden">
                            {(user as any).photoUrl ? (
                              <img src={(user as any).photoUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.name}</p>
                            <p className="text-xs text-stone-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          user.role === 'SUPER_ADMIN' 
                            ? 'bg-white/20 text-white border border-white/30' 
                            : user.role === 'ORG_ADMIN'
                            ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                            : 'bg-stone-400/10 text-stone-400 border border-stone-400/20'
                        }`}>
                          {user.role === 'SUPER_ADMIN' ? <Shield className="w-2.5 h-2.5" /> : <UserIcon className="w-2.5 h-2.5" />}
                          {user.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-stone-500">
                          {user.organizationId || "N/A (SuperAdmin)"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-stone-400">
                            <Mail className="w-3 h-3" />
                            {user.email}
                            {user.isEmailVerified ? (
                              <ShieldCheck className="w-3 h-3 text-green-400" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`relative ${openMenuId === user._id ? "z-[60]" : "z-0"}`}>
                           <button 
                             onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id as string)}
                             className={`p-2 rounded-lg transition-all ${
                               openMenuId === user._id ? "bg-white/10 text-white" : "text-stone-500 hover:bg-white/5 hover:text-white"
                             }`}
                           >
                             <MoreVertical className="w-4 h-4" />
                           </button>

                           <AnimatePresence>
                             {openMenuId === user._id && (
                               <>
                                 <div 
                                   className="fixed inset-0 z-40" 
                                   onClick={() => setOpenMenuId(null)}
                                 />
                                 {(() => {
                                   const openUpwards = index >= users.length - 2;
                                   return (
                                     <motion.div
                                       initial={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                                       animate={{ opacity: 1, scale: 1, y: 0 }}
                                       exit={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                                       className={`absolute right-0 w-48 bg-stone-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden pointer-events-auto ${
                                         openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                                       }`}
                                     >
                                       <button 
                                         onClick={() => openModal(user, 'edit')}
                                         className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-left"
                                       >
                                         <Edit3 className="w-3.5 h-3.5" />
                                         Edit User
                                       </button>
                                       <button 
                                         onClick={() => openModal(user, 'security')}
                                         className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-left"
                                       >
                                         <ShieldCheck className="w-3.5 h-3.5" />
                                         Manage Role
                                       </button>
                                       <div className="h-px bg-white/5 my-1" />
                                       <button 
                                         onClick={() => openModal(user, 'delete')}
                                         className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-widest text-left"
                                       >
                                         <Trash2 className="w-3.5 h-3.5" />
                                         Delete Account
                                       </button>
                                     </motion.div>
                                   );
                                 })()}
                               </>
                             )}
                           </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))
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

      <UserManagementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
        onUpdate={fetchUsers}
      />
    </AppLayout>
  );
}
