"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Save, 
  Trash2, 
  AlertCircle, 
  User as UserIcon, 
  Mail, 
  Shield,
  Loader2,
  Edit3,
  Camera
} from "lucide-react";
import { User } from "@/lib/types";
import { api } from "@/lib/api-client";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: () => void;
  mode?: 'edit' | 'security' | 'delete';
}

export function UserManagementModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdate, 
  mode: initialMode = 'edit' 
}: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'security' | 'delete'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    photoUrl: "",
    isEmailVerified: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "STAFF",
        photoUrl: (user as any).photoUrl || "",
        isEmailVerified: user.isEmailVerified || false,
      });
      setActiveTab(initialMode);
    }
  }, [user, initialMode]);

  const handleUpdate = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/users/${user._id}/admin`, formData);
      if (res.success) {
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/users/${user._id}/admin`);
      if (res.success) {
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

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
        setFormData({ ...formData, photoUrl: result.data.url });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !user) return null;

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
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent overflow-hidden">
                  {formData.photoUrl || (user as any).photoUrl ? (
                    <img src={formData.photoUrl || (user as any).photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-headlines uppercase tracking-tight">User Governance</h3>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{user.name}</p>
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
                { id: 'edit', label: 'Details', icon: UserIcon },
                { id: 'security', label: 'Security', icon: Shield },
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
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5 mb-2">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                      <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-accent/50">
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-accent" />
                        ) : formData.photoUrl || (user as any).photoUrl ? (
                          <img src={formData.photoUrl || (user as any).photoUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-8 h-8 text-stone-700" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-widest">Public Avatar</h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed max-w-[200px]">
                        The primary identity for this user across the platform.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 transition-all font-medium"
                      />
                    </div>
                  </div>

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

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest">Email Verification</h4>
                      <p className="text-[10px] text-stone-500 mt-1">Manually mark this user's email as verified.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isEmailVerified: !formData.isEmailVerified})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isEmailVerified ? 'bg-accent' : 'bg-stone-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.isEmailVerified ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">System Role</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'ORG_ADMIN', label: 'Org Admin', desc: 'Business owner access', icon: UserIcon },
                        { id: 'STAFF', label: 'Staff', desc: 'Standard business staff', icon: UserIcon },
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setFormData({...formData, role: role.id})}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.role === role.id 
                              ? "bg-white text-black border-white" 
                              : "bg-white/5 text-stone-400 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <role.icon className={`w-4 h-4 ${formData.role === role.id ? "text-black" : "text-stone-500"}`} />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest">{role.label}</p>
                              <p className={`text-[10px] ${formData.role === role.id ? "text-black/60" : "text-stone-600"}`}>{role.desc}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
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
                        <h4 className="font-headlines text-md uppercase text-red-500">Purge User</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          This action will permanently delete <span className="text-white font-bold">{user.name}</span>. If this user is an Org Admin, all business data for their organization might be affected.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-stone-500">
                      Type <span className="text-white font-mono font-bold select-all">{user.email}</span> to confirm.
                    </p>
                    <input 
                      type="text"
                      className="mt-3 w-full bg-black border border-red-400/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400/40 transition-all font-mono"
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
                  className="px-6 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Account
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
