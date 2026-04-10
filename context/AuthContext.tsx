"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Organization } from "@/lib/types";

interface AuthContextType {
    user: User | null;
    organization: Organization | null;
    loading: boolean;
    login: (data: { user: User; accessToken: string; refreshToken: string; organization?: Organization }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = () => {
            const activeEnvId = localStorage.getItem("sd_active_env") || "local";
            const token = localStorage.getItem(`sd_${activeEnvId}_accessToken`);
            const storedUser = localStorage.getItem(`sd_${activeEnvId}_user`);
            const storedOrg = localStorage.getItem(`sd_${activeEnvId}_organization`);

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    
                    if (storedOrg && storedOrg !== "undefined") {
                        setOrganization(JSON.parse(storedOrg));
                    }
                } catch (e) {
                    console.error("Auth restoration failed", e);
                    localStorage.removeItem(`sd_${activeEnvId}_accessToken`);
                    localStorage.removeItem(`sd_${activeEnvId}_refreshToken`);
                    localStorage.removeItem(`sd_${activeEnvId}_user`);
                    localStorage.removeItem(`sd_${activeEnvId}_organization`);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (data: { user: User; accessToken: string; refreshToken: string; organization?: Organization }) => {
        const activeEnvId = localStorage.getItem("sd_active_env") || "local";
        
        localStorage.setItem(`sd_${activeEnvId}_accessToken`, data.accessToken);
        localStorage.setItem(`sd_${activeEnvId}_refreshToken`, data.refreshToken);
        localStorage.setItem(`sd_${activeEnvId}_user`, JSON.stringify(data.user));
        
        if (data.organization) {
            localStorage.setItem(`sd_${activeEnvId}_organization`, JSON.stringify(data.organization));
            setOrganization(data.organization);
        } else {
            localStorage.removeItem(`sd_${activeEnvId}_organization`);
            setOrganization(null);
        }

        setUser(data.user);
        router.push("/dashboard");
    };

    const logout = () => {
        const activeEnvId = localStorage.getItem("sd_active_env") || "local";
        
        localStorage.removeItem(`sd_${activeEnvId}_accessToken`);
        localStorage.removeItem(`sd_${activeEnvId}_refreshToken`);
        localStorage.removeItem(`sd_${activeEnvId}_user`);
        localStorage.removeItem(`sd_${activeEnvId}_organization`);
        
        setUser(null);
        setOrganization(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, organization, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
