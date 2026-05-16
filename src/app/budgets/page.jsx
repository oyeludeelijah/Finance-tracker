import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, Plus, TrendingUp, TrendingDown, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/utils/useCurrency";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { getBudgetStats, calculateTotalDailyLimit } from "@/utils/financeMath";

import { M3, card, inputStyle } from "@/lib/theme";

export default function BudgetsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ category: "Food", limit_amount: "" });
  const { symbol, setCurrency, CURRENCIES } = useCurrency();

  const today = new Date();

  const { budgets, addBudget, isAdding, deleteBudget } = useBudgets();
  const { transactions } = useTransactions(100);
  const budgetStats = getBudgetStats(budgets, transactions);
  const totalLimit = calculateTotalDailyLimit(budgets);
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
        background: "linear-gradient(135deg, #5B3F9A, #6B21A8)",
        border: "none",
        borderRadius: 24,
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#D0BCFFaa" }}>
              Daily Overview
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#fff" }}>
              {symbol}{totalSpent.toLocaleString()}
              <span className="text-sm md:text-lg font-normal ml-2" style={{ color: "#ffffff88" }}>
                / {symbol}{totalLimit.toLocaleString()}
              </span>
            </h2>
            <p className="text-[10px] md:text-xs mt-2" style={{ color: "#ffffff99" }}>
              Today's spending across all budgets
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
      <AnimatePresence>
        {showAdd && (
          <motion.form
            key="budget-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden", ...card, background: M3.surfaceContainer }}
            className="p-4 md:p-6"
            onSubmit={(e) => {
            e.preventDefault();
            addBudget(formData, {
              onSuccess: () => {
                setFormData({ category: "Food", limit_amount: "" });
                setShowAdd(false);
              }
            });
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold" style={{ color: M3.onSurface }}>Set Daily Budget</h3>
            <button type="button" onClick={() => setShowAdd(false)} style={{ color: M3.onSurfaceVariant }}>
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
              placeholder={`Daily limit (${symbol})`}
              style={inputStyle}
              value={formData.limit_amount}
              onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
            />
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap min-h-[48px]"
              style={{ background: M3.primary, color: "#21005D", minWidth: 100 }}
            >
              {isAdding ? "Saving…" : "Create"}
            </button>
          </div>
          </motion.form>
        )}
      </AnimatePresence>

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
          {budgetStats.map((b, idx) => {
            const barColor = b.percent > 90 ? M3.error : b.percent > 75 ? "#FFB74D" : M3.primary;
            const remaining = parseFloat(b.limit_amount) - b.spent;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.3, ease: "easeOut" }}
                style={{ ...card }}
                className="p-4 md:p-6 transition-all duration-200 hover:scale-[1.01] w-full group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 items-center">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg"
                      style={{ background: M3.primaryContainer, color: M3.onPrimaryContainer }}
                    >
                      {b.category[0]}
                    </div>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      title="Delete budget"
                    >
                      <Trash2 size={16} style={{ color: M3.error }} />
                    </button>
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
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${b.percent}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: idx * 0.08 + 0.2 }}
                      style={{ background: barColor }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                {b.percent >= 100 && (
                  <div className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: M3.errorContainer }}>
                    <TrendingDown size={14} style={{ color: M3.error }} />
                    <p className="text-xs font-medium" style={{ color: M3.error }}>
                      Budget exceeded for today
                    </p>
                  </div>
                )}
                {b.percent < 80 && (
                  <div className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: M3.greenContainer }}>
                    <TrendingUp size={14} style={{ color: M3.green }} />
                    <p className="text-xs font-medium" style={{ color: M3.green }}>On track for today</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
