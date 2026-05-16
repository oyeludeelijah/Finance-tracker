import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth.jsx";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ThemeProvider } from "@/context/ThemeContext";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--m3-surface)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--m3-primary)" }} />
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
      className="min-h-screen font-sans"
      style={{ background: "var(--m3-surface)", color: "var(--m3-on-surface)" }}
    >
      <Navigation />
      {/* md:ml-64 offsets main content past the fixed 256px sidebar */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
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
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
