import React from "react";
import { LayoutDashboard, History, Target, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useLocation, Link } from "react-router";

import { M3 } from "@/lib/theme";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "History", path: "/history", icon: History },
  { name: "Budgets", path: "/budgets", icon: Target },
];

export default function Navigation() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-64 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch px-2 py-2 md:p-4 gap-1 md:gap-2 md:min-h-screen"
      style={{
        background: M3.surfaceContainer,
        borderRight: `1px solid ${M3.outline}22`,
        borderTop: `1px solid ${M3.outline}22`,
      }}
    >
      {/* Logo */}
      <div className="hidden md:flex items-center gap-3 px-3 py-2 mb-0 md:mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: M3.primaryContainer }}
        >
          <span style={{ color: M3.onPrimaryContainer, fontWeight: 700, fontSize: "1.1rem" }}>F</span>
        </div>
        <span
          className="text-lg font-semibold tracking-tight"
          style={{ color: M3.onSurface, fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
        >
          FinanceAI
        </span>
      </div>

      {/* Nav items */}
      <div className="flex flex-row md:flex-col gap-1 w-full md:w-auto flex-1 justify-around md:justify-start">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 py-2 md:px-4 md:py-3 rounded-xl md:rounded-full transition-all duration-200 group flex-1 md:flex-none"
              style={{
                background: isActive ? M3.primaryContainer : "transparent",
                color: isActive ? M3.onPrimaryContainer : M3.onSurfaceVariant,
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = `${M3.primary}14`;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <item.icon size={24} className="md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium">{item.name}</span>
              {isActive && (
                <span
                  className="absolute right-3 w-2 h-2 rounded-full hidden md:block"
                  style={{ background: M3.primary }}
                />
              )}
            </Link>
          );
        })}
        {/* Sign out mobile inline */}
        <button
          onClick={signOut}
          className="md:hidden relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 flex-1"
          style={{ color: "#F2B8B8" }}
        >
          <LogOut size={24} />
          <span className="text-[10px] font-medium">Log out</span>
        </button>
      </div>

      {/* Sign out desktop */}
      <div className="mt-auto hidden md:block">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 w-full justify-start"
          style={{ color: "#F2B8B8" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#8C1D1822")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
