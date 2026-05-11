import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, TrendingUp, TrendingDown, X } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/utils/useCurrency";
import { useAuth } from "@/hooks/useAuth.jsx";

const M3 = {
  surface: "#1C1B1F",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",
  surfaceVariant: "#49454F",
  primary: "#D0BCFF",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",
  secondary: "#CCC2DC",
  secondaryContainer: "#4A4458",
  onSurface: "#E6E1E5",
  onSurfaceVariant: "#CAC4D0",
  outline: "#49454F",
  outlineVariant: "#49454F44",
  error: "#F2B8B8",
  errorContainer: "#8C1D18",
  green: "#6DD58C",
  greenContainer: "#0A3818",
};

const card = {
  background: M3.surfaceContainerHigh,
  border: `1px solid ${M3.outlineVariant}`,
  borderRadius: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.32)",
};

const inputStyle = {
  background: M3.surfaceContainerHighest,
  border: `1px solid ${M3.outline}`,
  borderRadius: 12,
  color: M3.onSurface,
  padding: "10px 14px",
  outline: "none",
  fontSize: 14,
  width: "100%",
  minHeight: "48px",
};

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ category: "Food", limit_amount: "" });
  const { symbol, setCurrency, CURRENCIES } = useCurrency();
  const { session } = useAuth();
  const token = session?.access_token;

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const timePercent = (daysPassed / daysInMonth) * 100;

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", token],
    queryFn: async () => {
      const res = await fetch("/api/budgets", { headers: { Authorization: token ? `Bearer ${token}` : "" } });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", token],
    queryFn: async () => {
      const res = await fetch("/api/transactions", { headers: { Authorization: token ? `Bearer ${token}` : "" } });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created!");
      setShowAdd(false);
      setFormData({ category: "Food", limit_amount: "" });
    },
    onError: () => toast.error("Failed to create budget"),
  });

  const budgetStats = budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.category === b.category && t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const percent = Math.min((spent / parseFloat(b.limit_amount)) * 100, 100);
    const isOverpacing = percent > timePercent * 1.1;
    return { ...b, spent, percent, isOverpacing };
  });

  const totalLimit = budgets.reduce((s, b) => s + parseFloat(b.limit_amount || 0), 0);
  const totalSpent = budgetStats.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: M3.onSurface }}>Budget Goals</h1>
          <p className="text-sm mt-1" style={{ color: M3.onSurfaceVariant }}>Track spending limits by category</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            style={{ ...inputStyle, width: "auto", padding: "8px 12px" }}
            value={symbol}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.symbol} style={{ background: M3.surfaceContainerHighest }}>
                {c.symbol} {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200"
            style={{ background: M3.primary, color: "#21005D" }}
          >
            <Plus size={18} />
            New Budget
          </button>
        </div>
      </header>

      {/* Overview hero */}
      <div className="p-4 md:p-7 md:px-8" style={{
        ...card,
        background: `linear-gradient(135deg, ${M3.primaryContainer}, #6B21A8)`,
        border: "none",
        borderRadius: 24,
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#D0BCFFaa" }}>
              Monthly Overview
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#fff" }}>
              {symbol}{totalSpent.toLocaleString()}
              <span className="text-sm md:text-lg font-normal ml-2" style={{ color: "#ffffff88" }}>
                / {symbol}{totalLimit.toLocaleString()}
              </span>
            </h2>
            <p className="text-[10px] md:text-xs mt-2" style={{ color: "#ffffff99" }}>
              {Math.round(timePercent)}% of the month has passed
            </p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto" style={{ color: "#ffffff99" }}>
            <p className="text-[10px] md:text-xs">Budgets active</p>
            <p className="text-xl md:text-2xl font-bold" style={{ color: "#fff" }}>{budgets.length}</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#ffffff22" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background: overallPct > 90 ? "#F2B8B8" : overallPct > 75 ? "#FFB74D" : "#D0BCFF",
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "#ffffff88" }}>{Math.round(overallPct)}% of total budget used</p>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ ...card, background: M3.surfaceContainer }} className="p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold" style={{ color: M3.onSurface }}>Set Monthly Budget</h3>
            <button onClick={() => setShowAdd(false)} style={{ color: M3.onSurfaceVariant }}>
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              style={inputStyle}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {["Food", "Transport", "Shopping", "Housing", "Entertainment"].map((c) => (
                <option key={c} style={{ background: M3.surfaceContainerHighest }}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder={`Monthly limit (${symbol})`}
              style={inputStyle}
              value={formData.limit_amount}
              onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
            />
            <button
              onClick={() => addMutation.mutate(formData)}
              className="px-8 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap min-h-[48px]"
              style={{ background: M3.primary, color: "#21005D", minWidth: 100 }}
            >
              {addMutation.isPending ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgetStats.length === 0 ? (
        <div
          className="col-span-full py-16 text-center rounded-3xl flex flex-col items-center gap-3"
          style={{ border: `2px dashed ${M3.outline}`, color: M3.onSurfaceVariant }}
        >
          <Target size={48} style={{ opacity: 0.3 }} />
          <p className="font-medium">No budgets yet — create your first one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetStats.map((b) => {
            const barColor = b.percent > 90 || b.isOverpacing ? M3.error : b.percent > 75 ? "#FFB74D" : M3.primary;
            const remaining = parseFloat(b.limit_amount) - b.spent;
            return (
              <div
                key={b.id}
                style={{ ...card }}
                className="p-4 md:p-6 transition-all duration-200 hover:scale-[1.01] w-full"
              >
                {/* Card top */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg"
                    style={{ background: M3.primaryContainer, color: M3.onPrimaryContainer }}
                  >
                    {b.category[0]}
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: M3.onSurfaceVariant }}>
                      Limit
                    </p>
                    <p className="font-bold" style={{ color: M3.onSurface }}>
                      {symbol}{parseFloat(b.limit_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-0.5" style={{ color: M3.onSurface }}>{b.category}</h3>
                <p className="text-sm mb-5" style={{ color: M3.onSurfaceVariant }}>
                  {symbol}{b.spent.toLocaleString()} spent
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: barColor }}>{Math.round(b.percent)}%</span>
                    <span style={{ color: remaining >= 0 ? M3.onSurfaceVariant : M3.error }}>
                      {remaining >= 0 ? `${symbol}${remaining.toLocaleString()} left` : `${symbol}${Math.abs(remaining).toLocaleString()} over`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: M3.surfaceVariant }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${b.percent}%`, background: barColor }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: M3.onSurfaceVariant }}>
                    {Math.round(timePercent)}% of month passed
                  </p>
                </div>

                {/* Status badge */}
                {b.isOverpacing && b.percent < 100 && (
                  <div className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: M3.errorContainer }}>
                    <TrendingDown size={14} style={{ color: M3.error }} />
                    <p className="text-xs font-medium" style={{ color: M3.error }}>
                      Spending too fast — {Math.round(b.percent)}% used, {Math.round(timePercent)}% of month
                    </p>
                  </div>
                )}
                {!b.isOverpacing && b.percent < 80 && (
                  <div className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: M3.greenContainer }}>
                    <TrendingUp size={14} style={{ color: M3.green }} />
                    <p className="text-xs font-medium" style={{ color: M3.green }}>On track</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
