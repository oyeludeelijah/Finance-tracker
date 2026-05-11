import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth.jsx";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "FinanceAI - Personal Finance Assistant",
  description:
    "Track your spending, set budgets, and get AI-powered financial advice",
};

function AppShell({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1C1B1F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D0BCFF" }} />
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login') {
    return children;
  }

  return (
    <div
      className="min-h-screen font-sans flex flex-col md:flex-row relative"
      style={{ background: "#1C1B1F", color: "#E6E1E5" }}
    >
      <Navigation />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            cacheTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </QueryClientProvider>
  );
}
