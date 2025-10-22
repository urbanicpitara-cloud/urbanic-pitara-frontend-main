// In Next.js, this file would be called: app/providers.jsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authRepository } from "@/lib/api/repositories/auth";

export const AuthContext = createContext<{
  user: any;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  logout: async () => {},
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    browserQueryClient = browserQueryClient ?? makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check auth status on mount
    authRepository.me()
      .then(response => setUser(response.user))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await authRepository.logout();
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, setUser, logout }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

// Helper hook to use auth context
export const useAuth = () => useContext(AuthContext);
