"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Save, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  Building2, 
  Mail, 
  Phone,
  ShieldCheck,
  Loader2,
  Edit3
} from "lucide-react";
import { Organization } from "@/lib/types";
import { api } from "@/lib/api-client";

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onUpdate: () => void;
  mode?: 'edit' | 'subscription' | 'delete';
}

export function ManagementModal({ 
  isOpen, 
  onClose, 
  organization, 
  onUpdate, 
  mode: initialMode = 'edit' 
}: ManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'subscription' | 'delete'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    logoUrl: "",
    subscriptionStatus: "",
    subscriptionEndsAt: "",
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        email: organization.email || "",
        phone: organization.phone || "",
        logoUrl: organization.logoUrl || "",
        subscriptionStatus: organization.subscriptionStatus || "trialing",
        subscriptionEndsAt: organization.subscriptionEndsAt ? new Date(organization.subscriptionEndsAt).toISOString().split('T')[0] : "",
      });
      setActiveTab(initialMode);
    }
  }, [organization, initialMode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const data = new FormData();
    data.append("image", file);

    try {
      const result = await api.postFormData("/upload", data);
      if (result.success) {
        setFormData({ ...formData, logoUrl: result.data.url });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!organization?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/organization/${organization._id}`, formData);
      if (res.success) {
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!organization?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/organization/${organization._id}`);
      if (res.success) {
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete organization");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !organization) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-black border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent overflow-hidden">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-headlines uppercase tracking-tight">Manage Business</h3>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{organization.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 mx-6 mt-6 rounded-xl border border-white/5">
              {[
                { id: 'edit', label: 'Details', icon: Building2 },
                { id: 'subscription', label: 'Subscription', icon: ShieldCheck },
                { id: 'delete', label: 'Danger Zone', icon: Trash2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? "bg-white text-black shadow-lg" 
                      : "text-stone-500 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5 mb-2">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                      <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-accent/50">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-accent" />
                        ) : formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-stone-700" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Edit3 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <input 
                        type="file" 
                        id="logo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-widest">Business Brand Asset</h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed max-w-[200px]">
                        Click the container to upload a new logo. Recommended size 512x512 PNG.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                        <input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                        <input 
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Account Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['active', 'trialing', 'suspended', 'expired'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFormData({...formData, subscriptionStatus: status})}
                          className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            formData.subscriptionStatus === status 
                              ? "bg-white text-black border-white" 
                              : "bg-white/5 text-stone-500 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             status === 'active' ? 'bg-green-400' :
                             status === 'trialing' ? 'bg-amber-400' :
                             status === 'suspended' ? 'bg-red-400' : 'bg-stone-500'
                          }`} />
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Subscription End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input 
                        type="date"
                        value={formData.subscriptionEndsAt}
                        onChange={(e) => setFormData({...formData, subscriptionEndsAt: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 transition-all font-medium [color-scheme:dark]"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2 italic">* Manually set this date to extend trial access or suspend a portal.</p>
                  </div>
                </div>
              )}

              {activeTab === 'delete' && (
                <div className="space-y-6">
                  <div className="p-6 bg-red-400/5 border border-red-400/20 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-400/10 rounded-xl text-red-500">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-headlines text-md uppercase text-red-500">Purge Organization</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          This action is permanent and cannot be undone. All data associated with <span className="text-white font-bold">{organization.name}</span>, including clients, orders, and measurements, will be purged from the cluster.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-stone-500">
                      Type <span className="text-white font-mono font-bold select-all">{organization.name}</span> to confirm.
                    </p>
                    <input 
                      type="text"
                      placeholder="Organization Name"
                      className="mt-3 w-full bg-black border border-red-400/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400/40 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3 mt-auto">
              <button 
                onClick={onClose}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-white transition-all"
              >
                Discard
              </button>
              
              {activeTab === 'delete' ? (
                <button 
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 group disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Permanent Purge
                </button>
              ) : (
                <button 
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-8 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              )}
            </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
