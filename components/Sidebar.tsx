"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ScrollText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Organizations", href: "/organizations" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: ScrollText, label: "System Logs", href: "/logs" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (showLogoutConfirm) {
      logout();
    } else {
      setShowLogoutConfirm(true);
      setTimeout(() => setShowLogoutConfirm(false), 3000); // Reset after 3 seconds
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-black border-r border-white/5 flex flex-col fixed left-0 top-0 z-40"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="https://res.cloudinary.com/dewxjdmd2/image/upload/v1771505641/playstore_pl3iei.png" 
              alt="SewDigital" 
              className="w-full h-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-headlines text-xl tracking-cinematic uppercase whitespace-nowrap"
            >
              SewDigital
            </motion.h1>
          )}
        </div>

        {/* Prominent Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-white/10 flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-110 transition-all z-50 group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-white/5 text-accent" 
                    : "text-stone-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 shrink-0",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1 h-4 bg-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-6 px-2"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate">{user?.name || "Super Admin"}</p>
              <p className="text-[10px] text-stone-500 truncate uppercase tracking-widest font-bold">Platform Console</p>
            </div>
          </motion.div>
        )}
        
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group",
            showLogoutConfirm 
              ? "bg-red-400/10 text-red-400 border border-red-400/20" 
              : "text-stone-500 hover:text-red-400 hover:bg-red-400/5"
          )}
        >
          <LogOut className={cn(
            "w-5 h-5 transition-transform",
            !showLogoutConfirm && "group-hover:-translate-x-1"
          )} />
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-sm whitespace-nowrap"
            >
              {showLogoutConfirm ? "Confirm Sign Out" : "Sign Out"}
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
