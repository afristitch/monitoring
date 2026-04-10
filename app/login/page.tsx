"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useSettings } from "@/context/SettingsProvider";
import { SearchableSelect } from "@/components/SearchableSelect";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { activeEnvId, setActiveEnvId, environments } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.success) {
        // Double check if the user is a SUPER_ADMIN
        if (response.data.user.role !== "SUPER_ADMIN") {
          setError("Access Denied: SuperAdmin privileges required.");
          return;
        }
        login(response.data);
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-black">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529731-11885f84728a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center animate-slow-zoom opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black to-black" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex w-15 h-15 bg-white rounded-3xl items-center justify-center mb-6 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <img 
              src="https://res.cloudinary.com/dewxjdmd2/image/upload/v1771505641/playstore_pl3iei.png" 
              alt="SewDigital" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-headlines text-4xl tracking-cinematic uppercase mb-3">
            SewDigital
          </h1>
          <p className="text-stone-500 font-medium tracking-tight">SuperAdmin Management Console</p>
        </div>

        <div className="bg-surface-gray border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
          {/* Subtle Environment Selector */}
          <div className="absolute top-4 right-4 z-10 scale-75 origin-top-right">
            <SearchableSelect 
              options={environments.map(e => ({ _id: e.id, name: e.name }))}
              value={activeEnvId}
              onChange={(id) => setActiveEnvId(id)}
              showAllOption={false}
              searchable={false}
              className="!bg-transparent !border-none"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2 px-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 transition-all text-white"
                placeholder="admin@sewdigital.app"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2 px-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 transition-all text-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-sm px-1 font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-stone-600 text-sm">
          Platform Security Enforcement Active
        </p>
      </motion.div>
    </div>
  );
}
