import { getEnvironmentById } from "./environments";

// API client for SewDigital SuperAdmin backend
const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        const activeEnvId = localStorage.getItem("sd_active_env") || "local";
        const env = getEnvironmentById(activeEnvId);
        return env.baseUrl;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
};


export const api = {
    get: (endpoint: string) => fetcher(endpoint, { method: "GET" }),
    post: (endpoint: string, body: unknown) => fetcher(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint: string, body: unknown) => fetcher(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    patch: (endpoint: string, body: unknown) => fetcher(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (endpoint: string) => fetcher(endpoint, { method: "DELETE" }),
    // Helper for non-json responses (like logs)
    getText: (endpoint: string) => fetcher(endpoint, { method: "GET" }, true),
    postFormData: (endpoint: string, formData: FormData) => fetcher(endpoint, { method: "POST", body: formData }, false, true),
};

async function fetcher(endpoint: string, options: RequestInit = {}, asText = false, isFormData = false) {
    const activeEnvId = typeof window !== "undefined" ? (localStorage.getItem("sd_active_env") || "local") : "local";
    const tokenKey = `sd_${activeEnvId}_accessToken`;
    const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;

    const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "69420",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only set JSON content type if not sending FormData
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    console.log(`[API] Fetching ${endpoint} on ${activeEnvId}`, { method: options.method || 'GET', hasToken: !!token });

    try {
        const baseUrl = getBaseUrl();
        // Handle full URLs if provided (for logs, etc)
        const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
        
        const response = await fetch(fullUrl, {
            ...options,
            headers,
        });

        console.log(`[API] Response ${response.status} from ${endpoint}`);

        if (response.status === 401) {
            handleAuthError();
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "An error occurred" }));
            const errorMessage = error.message || "Failed to fetch data";
            
            if (errorMessage.toLowerCase().includes("token") && errorMessage.toLowerCase().includes("expired")) {
                handleAuthError();
            }
            
            throw new Error(errorMessage);
        }

        function handleAuthError() {
            if (typeof window !== "undefined") {
                localStorage.removeItem(`sd_${activeEnvId}_accessToken`);
                localStorage.removeItem(`sd_${activeEnvId}_refreshToken`);
                localStorage.removeItem(`sd_${activeEnvId}_user`);
                localStorage.removeItem(`sd_${activeEnvId}_organization`);
                window.location.href = "/login";
            }
        }

        return asText ? response.text() : response.json();
    } catch (err) {
        console.error(`[API] Error fetching ${endpoint}:`, err);
        throw err;
    }
}
