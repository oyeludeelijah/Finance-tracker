import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useCurrency } from "@/utils/useCurrency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

// M3 Dark tokens
const M3 = {
  surface: "#1C1B1F",
  surfaceVariant: "#49454F",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",
  primary: "#D0BCFF",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",
  secondary: "#CCC2DC",
  secondaryContainer: "#4A4458",
  tertiary: "#EFB8C8",
  tertiaryContainer: "#633B48",
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

const CATEGORY_COLORS = ["#D0BCFF", "#CCC2DC", "#EFB8C8", "#80CBC4", "#FFB74D"];

function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub, positive }) {
  return (
    <div style={card} className="p-4 md:p-6">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: M3.onSurfaceVariant }}>
          {label}
        </p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: M3.onSurface }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-2" style={{ color: positive ? M3.green : M3.error }}>
          {positive ? "↑" : "↓"} {sub}
        </p>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, symbol }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: M3.surfaceContainerHighest, border: `1px solid ${M3.outline}`, borderRadius: 12, padding: "10px 14px" }}>
        <p style={{ color: M3.onSurface, fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill, fontSize: 13 }}>
            {p.name}: {symbol}{parseFloat(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { symbol } = useCurrency();
  const { session } = useAuth();
  const token = session?.access_token;

  const [formData, setFormData] = useState({ amount: "", description: "", category: "Food", type: "expense" });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", token],
    queryFn: async () => {
      const res = await fetch("/api/transactions", { headers: { Authorization: token ? `Bearer ${token}` : "" } });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets", token],
    queryFn: async () => {
      const res = await fetch("/api/budgets", { headers: { Authorization: token ? `Bearer ${token}` : "" } });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added!");
      setFormData({ amount: "", description: "", category: "Food", type: "expense" });
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message || "Failed to add transaction"),
  });

  const stats = transactions.reduce(
    (acc, t) => {
      const amt = parseFloat(t.amount);
      if (t.type === "income") acc.income += amt;
      else acc.expense += amt;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = stats.income - stats.expense;
  const totalBudgetLimits = budgets.reduce((s, b) => s + parseFloat(b.limit_amount || 0), 0);
  const safeToSpend = balance - totalBudgetLimits;

  // Money flow chart — last 6 months
  const monthlyData = (() => {
    const months = {};
    transactions.forEach((t) => {
      const key = format(new Date(t.created_at), "MMM");
      if (!months[key]) months[key] = { name: key, income: 0, expenses: 0 };
      if (t.type === "income") months[key].income += parseFloat(t.amount);
      else months[key].expenses += parseFloat(t.amount);
    });
    return Object.values(months).slice(-6);
  })();

  // Budget donut
  const categoryData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const ex = acc.find((i) => i.name === t.category);
      if (ex) ex.value += parseFloat(t.amount);
      else acc.push({ name: t.category, value: parseFloat(t.amount) });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const inputStyle = {
    background: M3.surfaceContainerHighest,
    border: `1px solid ${M3.outline}`,
    borderRadius: 12,
    color: M3.onSurface,
    padding: "10px 14px",
    outline: "none",
    fontSize: 14,
    width: "100%",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: M3.onSurface }}>Good morning 👋</h1>
          <p className="text-sm mt-1" style={{ color: M3.onSurfaceVariant }}>Here's your financial overview</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200"
          style={{ background: M3.primary, color: "#21005D" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </header>

      {/* Add Transaction Form */}
      {showForm && (
        <div style={{ ...card, background: M3.surfaceContainer }} className="p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold" style={{ color: M3.onSurface }}>New Transaction</h3>
            <button onClick={() => setShowForm(false)} style={{ color: M3.onSurfaceVariant }}>
              <X size={18} />
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addMutation.mutate(formData); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <input
              type="number" placeholder={`Amount (${symbol})`} required
              style={inputStyle} value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <input
              type="text" placeholder="Description" required
              style={inputStyle} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <select
              style={inputStyle} value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {["Food", "Transport", "Shopping", "Housing", "Entertainment", "Salary", "Business"].map((c) => (
                <option key={c} style={{ background: M3.surfaceContainerHighest }}>{c}</option>
              ))}
            </select>
            <select
              style={inputStyle} value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="expense" style={{ background: M3.surfaceContainerHighest }}>Expense</option>
              <option value="income" style={{ background: M3.surfaceContainerHighest }}>Income</option>
            </select>
            <button
              type="submit" disabled={addMutation.isPending}
              className="md:col-span-2 py-3 rounded-full font-semibold text-sm transition-all"
              style={{ background: M3.primary, color: "#21005D", opacity: addMutation.isPending ? 0.6 : 1 }}
            >
              {addMutation.isPending ? "Saving…" : "Save Transaction"}
            </button>
          </form>
        </div>
      )}

      {/* Safe-to-Spend Hero */}
      <div
        className="p-4 md:p-7 md:px-8"
        style={{
          borderRadius: 24,
          background: safeToSpend >= 0
            ? `linear-gradient(135deg, ${M3.primaryContainer}, #6B21A8)`
            : `linear-gradient(135deg, ${M3.errorContainer}, #B91C1C)`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#D0BCFFaa" }}>Safe to Spend</p>
            <h2 className="text-4xl font-bold" style={{ color: "#fff" }}>
              {symbol}{Math.abs(safeToSpend).toLocaleString()}
            </h2>
            <p className="text-xs mt-2" style={{ color: "#ffffff99" }}>After expenses & committed budget limits</p>
          </div>
          <div className="flex sm:block gap-4 text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 space-y-0 sm:space-y-1 justify-between" style={{ color: "#ffffff99" }}>
            <p className="text-[10px] md:text-xs">Income <br className="sm:hidden" /><span className="text-white font-semibold">{symbol}{stats.income.toLocaleString()}</span></p>
            <p className="text-[10px] md:text-xs">Spent <br className="sm:hidden" /><span className="text-white font-semibold">{symbol}{stats.expense.toLocaleString()}</span></p>
            <p className="text-[10px] md:text-xs">Reserved <br className="sm:hidden" /><span className="text-white font-semibold">{symbol}{totalBudgetLimits.toLocaleString()}</span></p>
          </div>
        </div>
        {safeToSpend < 0 && (
          <p className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-full inline-block" style={{ background: "#ffffff22", color: "#fff" }}>
            ⚠️ Budget overcommitted
          </p>
        )}
      </div>

      {/* 4-Column KPI widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net Balance" value={`${symbol}${balance.toLocaleString()}`}
          icon={Wallet} iconBg={M3.primaryContainer} iconColor={M3.onPrimaryContainer} />
        <StatCard label="Income" value={`${symbol}${stats.income.toLocaleString()}`}
          icon={ArrowUpRight} iconBg={M3.greenContainer} iconColor={M3.green} />
        <StatCard label="Expenses" value={`${symbol}${stats.expense.toLocaleString()}`}
          icon={ArrowDownLeft} iconBg={M3.errorContainer} iconColor={M3.error} />
        <StatCard
          label="Net Worth" value={`${balance < 0 ? "-" : ""}${symbol}${Math.abs(balance).toLocaleString()}`}
          icon={balance >= 0 ? TrendingUp : TrendingDown}
          iconBg={balance >= 0 ? M3.greenContainer : M3.errorContainer}
          iconColor={balance >= 0 ? M3.green : M3.error}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Money Flow Chart — spans 2 cols */}
        <div style={{ ...card, gridColumn: "span 1 / span 1" }} className="lg:col-span-2 p-4 md:p-6 w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold" style={{ color: M3.onSurface }}>Money Flow</h3>
              <p className="text-xs mt-0.5" style={{ color: M3.onSurfaceVariant }}>Income vs Expenses</p>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: M3.onSurfaceVariant }}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: M3.primary }} /> Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: M3.error }} /> Expenses</span>
            </div>
          </div>
          <div className="h-[200px] md:h-[240px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`${M3.outline}44`} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    style={{ fontSize: 11, fill: M3.onSurfaceVariant }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: 11, fill: M3.onSurfaceVariant }} />
                  <Tooltip content={<CustomTooltip symbol={symbol} />} cursor={{ fill: `${M3.primary}10` }} />
                  <Bar dataKey="income" fill={M3.primary} radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="expenses" fill={M3.error} radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: M3.onSurfaceVariant }}>
                <p className="text-sm">No data yet — add transactions to see flow</p>
              </div>
            )}
          </div>
        </div>

        {/* Donut chart */}
        <div style={card} className="p-4 md:p-6 w-full">
          <h3 className="font-semibold mb-1" style={{ color: M3.onSurface }}>By Category</h3>
          <p className="text-xs mb-4" style={{ color: M3.onSurfaceVariant }}>Expense breakdown</p>
          {categoryData.length > 0 ? (
            <div className="h-[200px] md:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="45%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip symbol={symbol} />} />
                  <Legend
                    formatter={(v) => <span style={{ color: M3.onSurfaceVariant, fontSize: 11 }}>{v}</span>}
                    iconType="circle" iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] md:h-[240px] flex items-center justify-center" style={{ color: M3.onSurfaceVariant }}>
              <p className="text-sm text-center">Add expenses to see breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Budgets + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Budget progress */}
        <div style={card} className="p-4 md:p-6 w-full">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold" style={{ color: M3.onSurface }}>Budget Limits</h3>
              <p className="text-xs mt-0.5" style={{ color: M3.onSurfaceVariant }}>Monthly targets</p>
            </div>
          </div>
          {budgets.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: M3.onSurfaceVariant }}>
              No budgets set — go to Budgets to add some
            </p>
          ) : (
            <div className="space-y-4">
              {budgets.map((b) => {
                const spent = transactions
                  .filter((t) => t.type === "expense" && t.category === b.category)
                  .reduce((s, t) => s + parseFloat(t.amount), 0);
                const pct = Math.min((spent / parseFloat(b.limit_amount)) * 100, 100);
                const over = pct >= 100;
                return (
                  <div key={b.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium" style={{ color: M3.onSurface }}>{b.category}</span>
                      <span className="text-xs" style={{ color: over ? M3.error : M3.onSurfaceVariant }}>
                        {symbol}{spent.toLocaleString()} / {symbol}{parseFloat(b.limit_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: M3.surfaceVariant }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: over ? M3.error : pct > 75 ? "#FFB74D" : M3.primary,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions table */}
        <div style={card} className="p-4 md:p-6 w-full">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold" style={{ color: M3.onSurface }}>Recent Transactions</h3>
              <p className="text-xs mt-0.5" style={{ color: M3.onSurfaceVariant }}>Latest activity</p>
            </div>
            <a href="/history" className="text-xs font-semibold flex items-center gap-1" style={{ color: M3.primary, textDecoration: "none" }}>
              See all <ChevronRight size={13} />
            </a>
          </div>

          {transactions.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: M3.onSurfaceVariant }}>No transactions yet</p>
          ) : (
            <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${M3.outlineVariant}` }}>
              {/* Table header */}
              <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ background: M3.surfaceContainer, color: M3.onSurfaceVariant }}>
                <span>Description</span>
                <span className="text-center">Category</span>
                <span className="text-right">Amount</span>
              </div>
              {/* Rows */}
              <div className="max-h-[280px] overflow-y-auto">
                {transactions.slice(0, 12).map((t, idx) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-3 px-4 py-3 items-center text-sm transition-colors"
                    style={{
                      background: idx % 2 === 0 ? M3.surfaceContainerHigh : "transparent",
                      borderTop: `1px solid ${M3.outlineVariant}`,
                    }}
                  >
                    <div>
                      <p className="font-medium truncate" style={{ color: M3.onSurface, maxWidth: 120 }}>{t.description}</p>
                      <p className="text-xs" style={{ color: M3.onSurfaceVariant }}>
                        {format(new Date(t.created_at), "MMM d")}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: t.type === "income" ? M3.greenContainer : M3.secondaryContainer,
                        color: t.type === "income" ? M3.green : M3.secondary,
                      }}>
                        {t.category}
                      </span>
                    </div>
                    <p className="text-right font-semibold" style={{ color: t.type === "income" ? M3.green : M3.error }}>
                      {t.type === "income" ? "+" : "-"}{symbol}{parseFloat(t.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
