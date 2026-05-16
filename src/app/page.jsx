import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Calculator from "@/components/Calculator";

import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown, ChevronRight, X, Trash2, Calculator as CalcIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useCurrency } from "@/utils/useCurrency";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { calculateTotals, calculateDailySpent, calculateTotalDailyLimit } from "@/utils/financeMath";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

import { M3, card, inputStyle, CATEGORY_COLORS } from "@/lib/theme";

function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub, positive, index = 0 }) {
  return (
    <motion.div
      style={card}
      className="p-4 md:p-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
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
    </motion.div>
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
  const { transactions, addTransaction, isAdding, deleteTransaction } = useTransactions(100);
  const { budgets } = useBudgets();
  const [showForm, setShowForm] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const { symbol } = useCurrency();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ amount: "", description: "", category: "Food", type: "expense" });

  const { income, expense: totalExpense, balance } = calculateTotals(transactions);
  const todaySpent = calculateDailySpent(transactions);
  const totalDailyLimit = calculateTotalDailyLimit(budgets);
  const dailySafeToSpend = totalDailyLimit - todaySpent;

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


  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Calculator — always mounted so state persists across open/close */}
      <Calculator show={showCalc} onClose={() => setShowCalc(false)} />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: M3.onSurface }}>{greeting} 👋</h1>
          <p className="text-sm mt-1" style={{ color: M3.onSurfaceVariant }}>Here's your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Calculator toggle */}
          <button
            onClick={() => setShowCalc((v) => !v)}
            className="flex items-center justify-center rounded-full transition-all duration-200"
            title="Toggle Calculator"
            style={{
              width: 40, height: 40,
              background: showCalc ? M3.primaryContainer : M3.surfaceContainerHigh,
              color: showCalc ? M3.onPrimaryContainer : M3.onSurfaceVariant,
              border: `1px solid ${M3.outlineVariant}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <CalcIcon size={18} />
          </button>
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
        </div>
      </header>

      {/* Add Transaction Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="txn-form"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ ...card, background: M3.surfaceContainer }} className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold" style={{ color: M3.onSurface }}>New Transaction</h3>
            <button onClick={() => setShowForm(false)} style={{ color: M3.onSurfaceVariant }}>
              <X size={18} />
            </button>
          </div>
          <form
            onSubmit={(e) => { 
              e.preventDefault(); 
              addTransaction(formData, {
                onSuccess: () => {
                  setFormData({ amount: "", description: "", category: "Food", type: "expense" });
                  setShowForm(false);
                }
              }); 
            }}
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
              type="submit" disabled={isAdding}
              className="md:col-span-2 py-3 rounded-full font-semibold text-sm transition-all"
              style={{ background: M3.primary, color: "#21005D", opacity: isAdding ? 0.6 : 1 }}
            >
              {isAdding ? "Saving…" : "Save Transaction"}
            </button>
          </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe-to-Spend Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="p-4 md:p-7 md:px-8"
        style={{
          borderRadius: 24,
          background: balance >= 0
            ? "linear-gradient(135deg, #5B3F9A, #6B21A8)"
            : "linear-gradient(135deg, #8C1D18, #B91C1C)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#D0BCFFaa" }}>Current Balance</p>
            <h2 className="text-4xl font-bold" style={{ color: "#fff" }}>
              {symbol}{Math.abs(balance).toLocaleString()}
            </h2>
            <p className="text-xs mt-2" style={{ color: "#ffffff99" }}>
              {balance < 0 ? "⚠️ You're spending more than you earn" : "After all your recorded expenses"}
            </p>
          </div>
          <div className="flex sm:block gap-4 text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 space-y-0 sm:space-y-1 justify-between" style={{ color: "#ffffff99" }}>
            <p className="text-[10px] md:text-xs">Spent Today <br className="sm:hidden" /><span className="text-white font-semibold">{symbol}{todaySpent.toLocaleString()}</span></p>
            <p className="text-[10px] md:text-xs">Safe to Spend <br className="sm:hidden" /><span className="text-white font-semibold" style={{ color: dailySafeToSpend < 0 ? "#FF6B6B" : "#fff" }}>{symbol}{dailySafeToSpend.toLocaleString()}</span></p>
            <p className="text-[10px] md:text-xs">Daily Limit <br className="sm:hidden" /><span className="text-white font-semibold">{symbol}{totalDailyLimit.toLocaleString()}</span></p>
          </div>
        </div>
      </motion.div>

      {/* 4-Column KPI widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net Balance" value={`${symbol}${balance.toLocaleString()}`}
          icon={Wallet} iconBg={M3.primaryContainer} iconColor={M3.onPrimaryContainer} index={0} />
        <StatCard label="Income" value={`${symbol}${income.toLocaleString()}`}
          icon={ArrowUpRight} iconBg={M3.greenContainer} iconColor={M3.green} index={1} />
        <StatCard label="Expenses" value={`${symbol}${totalExpense.toLocaleString()}`}
          icon={ArrowDownLeft} iconBg={M3.errorContainer} iconColor={M3.error} index={2} />
        <StatCard
          label="Net Worth" value={`${balance < 0 ? "-" : ""}${symbol}${Math.abs(balance).toLocaleString()}`}
          icon={balance >= 0 ? TrendingUp : TrendingDown}
          iconBg={balance >= 0 ? M3.greenContainer : M3.errorContainer}
          iconColor={balance >= 0 ? M3.green : M3.error}
          index={3}
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={M3.outlineAlpha44} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    style={{ fontSize: 11, fill: M3.onSurfaceVariant }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: 11, fill: M3.onSurfaceVariant }} />
                  <Tooltip content={<CustomTooltip symbol={symbol} />} cursor={{ fill: M3.primaryAlpha10 }} />
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
              <p className="text-xs mt-0.5" style={{ color: M3.onSurfaceVariant }}>Daily targets</p>
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
                  .filter((t) => {
                    if (t.type !== "expense" || t.category !== b.category) return false;
                    return new Date(t.created_at).toDateString() === new Date().toDateString();
                  })
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
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.22, ease: "easeOut" }}
                    className="grid grid-cols-3 px-4 py-3 items-center text-sm transition-colors group"
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
                    <div className="flex justify-end items-center gap-3">
                      <p className="text-right font-semibold" style={{ color: t.type === "income" ? M3.green : M3.error }}>
                        {t.type === "income" ? "+" : "-"}{symbol}{parseFloat(t.amount).toLocaleString()}
                      </p>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete transaction"
                      >
                        <Trash2 size={14} style={{ color: M3.error }} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
