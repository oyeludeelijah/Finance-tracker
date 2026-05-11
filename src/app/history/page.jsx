import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameDay, subWeeks, isToday,
} from "date-fns";
import { Download, TrendingUp, ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useCurrency } from "@/utils/useCurrency";

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

const CustomTooltip = ({ active, payload, label, symbol }) => {
  if (!active || !payload?.length) return null;
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
};

export default function HistoryPage() {
  const { session } = useAuth();
  const { symbol } = useCurrency();
  const token = session?.access_token;

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", token],
    queryFn: async () => {
      const res = await fetch("/api/transactions", { headers: { Authorization: token ? `Bearer ${token}` : "" } });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const weekStart = startOfWeek(
    weekOffset === 0 ? new Date() : subWeeks(new Date(), Math.abs(weekOffset)),
    { weekStartsOn: 1 }
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const chartData = weekDays.map((day) => {
    const dayTxns = transactions.filter((t) => isSameDay(new Date(t.created_at), day));
    const income = dayTxns.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
    const expenses = dayTxns.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
    return { name: format(day, "EEE"), fullDate: format(day, "d MMM"), date: day, income, expenses, balance: income - expenses };
  });

  const weekNet = chartData.reduce((s, d) => s + d.balance, 0);
  const dayTransactions = selectedDay
    ? transactions.filter((t) => isSameDay(new Date(t.created_at), selectedDay))
    : [];
  const weekLabel = `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;

  const navBtn = {
    background: M3.surfaceContainerHighest,
    border: `1px solid ${M3.outline}`,
    borderRadius: 12,
    color: M3.onSurfaceVariant,
    padding: "8px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: M3.onSurface }}>Weekly History</h1>
          <p className="text-sm mt-1" style={{ color: M3.onSurfaceVariant }}>Tap a bar to drill into that day</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Week nav */}
          <button style={navBtn} onClick={() => { setWeekOffset(w => w - 1); setSelectedDay(null); }}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold min-w-[150px] text-center" style={{ color: M3.onSurface }}>
            {weekLabel}
          </span>
          <button
            style={{ ...navBtn, opacity: weekOffset === 0 ? 0.3 : 1, cursor: weekOffset === 0 ? "not-allowed" : "pointer" }}
            onClick={() => { if (weekOffset < 0) { setWeekOffset(w => w + 1); setSelectedDay(null); } }}
            disabled={weekOffset === 0}
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{ background: M3.secondaryContainer, color: M3.secondary }}
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </header>

      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Bar chart — 3 cols */}
        <div style={card} className="lg:col-span-3 p-4 md:p-6 w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold" style={{ color: M3.onSurface }}>Income vs Expenses</h3>
              <p className="text-xs mt-0.5" style={{ color: M3.onSurfaceVariant }}>Click a bar to see transactions</p>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: M3.onSurfaceVariant }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: M3.primary }} /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: M3.error }} /> Expenses
              </span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="w-full min-w-[400px] h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                onClick={(e) => {
                  if (e?.activePayload?.length > 0) {
                    const d = e.activePayload[0].payload.date;
                    setSelectedDay(prev => prev && isSameDay(prev, d) ? null : d);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`${M3.outline}44`} />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  style={{ fontSize: 11, fill: M3.onSurfaceVariant }} dy={8} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: 11, fill: M3.onSurfaceVariant }} />
                <Tooltip content={<CustomTooltip symbol={symbol} />} cursor={{ fill: `${M3.primary}10` }} />
                <Bar dataKey="income" radius={[6, 6, 0, 0]} barSize={22} cursor="pointer">
                  {chartData.map((entry, i) => (
                    <Cell key={i}
                      fill={selectedDay && isSameDay(selectedDay, entry.date) ? M3.onPrimaryContainer : M3.primary}
                    />
                  ))}
                </Bar>
                <Bar dataKey="expenses" radius={[6, 6, 0, 0]} barSize={22} cursor="pointer">
                  {chartData.map((entry, i) => (
                    <Cell key={i}
                      fill={selectedDay && isSameDay(selectedDay, entry.date) ? "#FF6B6B" : M3.error}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar — week net + daily stats */}
        <div className="space-y-4 lg:col-span-1">
          {/* Week net card */}
          <div className="p-4 md:p-5" style={{
            borderRadius: 20,
            background: weekNet >= 0
              ? `linear-gradient(135deg, ${M3.primaryContainer}, #6B21A8)`
              : `linear-gradient(135deg, ${M3.errorContainer}, #B91C1C)`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#D0BCFFaa" }}>Week Net</p>
            <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>
              {weekNet >= 0 ? "+" : ""}{symbol}{Math.abs(weekNet).toLocaleString()}
            </h2>
            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit"
              style={{ background: "#ffffff22" }}>
              <TrendingUp size={12} style={{ color: "#fff", transform: weekNet < 0 ? "rotate(180deg)" : "none" }} />
              <span className="text-xs font-semibold" style={{ color: "#fff" }}>
                {weekNet >= 0 ? "Positive flow" : "Negative flow"}
              </span>
            </div>
          </div>

          {/* Daily stats list */}
          <div style={card} className="p-4 md:p-6">
            <h4 className="font-semibold mb-3 text-sm" style={{ color: M3.onSurface }}>Daily Stats</h4>
            <div className="space-y-1">
              {chartData.map((d, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDay(prev => prev && isSameDay(prev, d.date) ? null : d.date)}
                  className="flex justify-between items-center p-2 rounded-xl cursor-pointer transition-colors"
                  style={{
                    background: selectedDay && isSameDay(selectedDay, d.date) ? M3.primaryContainer : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!(selectedDay && isSameDay(selectedDay, d.date))) e.currentTarget.style.background = `${M3.primary}14`; }}
                  onMouseLeave={(e) => { if (!(selectedDay && isSameDay(selectedDay, d.date))) e.currentTarget.style.background = "transparent"; }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: M3.onSurface }}>{d.name}</p>
                    <p className="text-xs" style={{ color: M3.onSurfaceVariant }}>{d.fullDate}</p>
                  </div>
                  <p className="text-sm font-bold" style={{
                    color: d.balance > 0 ? M3.green : d.balance < 0 ? M3.error : M3.onSurfaceVariant
                  }}>
                    {d.balance > 0 ? "+" : ""}{symbol}{d.balance.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down panel */}
      {selectedDay && (
        <div style={{ ...card, background: M3.surfaceContainer }} className="p-4 md:p-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: M3.onSurface }}>
                {format(selectedDay, "EEEE, d MMMM")}
                {isToday(selectedDay) && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{ background: M3.primaryContainer, color: M3.onPrimaryContainer }}>
                    Today
                  </span>
                )}
              </h3>
              <p className="text-sm" style={{ color: M3.onSurfaceVariant }}>{format(selectedDay, "yyyy")}</p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 rounded-full transition-colors"
              style={{ color: M3.onSurfaceVariant }}
              onMouseEnter={(e) => (e.currentTarget.style.background = M3.surfaceContainerHighest)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={18} />
            </button>
          </div>

          {dayTransactions.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: M3.onSurfaceVariant }}>
              No transactions on this day
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${M3.outlineVariant}` }}>
              <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ background: M3.surfaceContainerHighest, color: M3.onSurfaceVariant }}>
                <span>Description</span>
                <span className="text-center">Category</span>
                <span className="text-right">Amount</span>
              </div>
              {dayTransactions.map((t, idx) => (
                <div
                  key={t.id}
                  className="grid grid-cols-3 px-4 py-3 items-center text-sm"
                  style={{
                    background: idx % 2 === 0 ? M3.surfaceContainerHigh : "transparent",
                    borderTop: `1px solid ${M3.outlineVariant}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: t.type === "income" ? M3.greenContainer : M3.errorContainer }}>
                      {t.type === "income"
                        ? <ArrowUpRight size={15} style={{ color: M3.green }} />
                        : <ArrowDownLeft size={15} style={{ color: M3.error }} />
                      }
                    </div>
                    <p className="font-medium truncate" style={{ color: M3.onSurface, maxWidth: 100 }}>
                      {t.description}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: M3.secondaryContainer, color: M3.secondary }}>
                      {t.category}
                    </span>
                  </div>
                  <p className="text-right font-semibold"
                    style={{ color: t.type === "income" ? M3.green : M3.error }}>
                    {t.type === "income" ? "+" : "-"}{symbol}{parseFloat(t.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
