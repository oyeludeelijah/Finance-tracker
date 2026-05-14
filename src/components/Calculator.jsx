import React, { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { M3 } from "@/lib/theme";

// Always mounted — state survives open/close on every device.
export default function Calculator({ show, onClose }) {
  // ── Calc state (persists across open/close) ───────────────────────
  const [display, setDisplay] = useState("0");
  const [operator, setOperator] = useState(null);
  const [prevValue, setPrevValue] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // ── Layout ────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 90 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const posRef = useRef(pos);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop initial position (right side, near header)
  useEffect(() => {
    setPos({ x: Math.max(window.innerWidth - 310, 20), y: 90 });
  }, []);

  useEffect(() => { posRef.current = pos; }, [pos]);

  // ── Drag (desktop only) ───────────────────────────────────────────
  const onHeaderMouseDown = useCallback((e) => {
    if (isMobile) return;
    dragging.current = true;
    offset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    e.preventDefault();
  }, [isMobile]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // ── Calc logic ────────────────────────────────────────────────────
  const fmtResult = (n) => {
    if (!Number.isFinite(n)) return "Error";
    if (Number.isInteger(n)) return String(n);
    const s = parseFloat(n.toFixed(10)).toString();
    return s.length > 12 ? n.toExponential(4) : s;
  };

  const inputDigit = (d) => {
    if (waitingForOperand) { setDisplay(d); setWaitingForOperand(false); }
    else setDisplay(display === "0" ? d : display + d);
  };

  const inputDecimal = () => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const clear = () => {
    setDisplay("0"); setOperator(null); setPrevValue(null); setWaitingForOperand(false);
  };

  const toggleSign = () => {
    const n = parseFloat(display);
    if (!isNaN(n)) setDisplay(String(n * -1));
  };

  const percentage = () => {
    const n = parseFloat(display);
    if (!isNaN(n)) setDisplay(String(n / 100));
  };

  const doCalc = (a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : Infinity;
      default:  return b;
    }
  };

  const handleOperator = (op) => {
    const cur = parseFloat(display);
    if (prevValue !== null && !waitingForOperand) {
      const res = doCalc(prevValue, cur, operator);
      const fmt = fmtResult(res);
      setDisplay(fmt);
      setPrevValue(fmt === "Error" ? cur : res);
    } else {
      setPrevValue(cur);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    if (operator === null || prevValue === null) return;
    const res = doCalc(prevValue, parseFloat(display), operator);
    setDisplay(fmtResult(res));
    setOperator(null); setPrevValue(null); setWaitingForOperand(true);
  };

  // ── Button definitions ────────────────────────────────────────────
  const btns = [
    { l: "C",  a: clear,                     t: "fn" },
    { l: "±",  a: toggleSign,                t: "fn" },
    { l: "%",  a: percentage,                t: "fn" },
    { l: "÷",  a: () => handleOperator("÷"), t: "op" },
    { l: "7",  a: () => inputDigit("7"),      t: "n"  },
    { l: "8",  a: () => inputDigit("8"),      t: "n"  },
    { l: "9",  a: () => inputDigit("9"),      t: "n"  },
    { l: "×",  a: () => handleOperator("×"), t: "op" },
    { l: "4",  a: () => inputDigit("4"),      t: "n"  },
    { l: "5",  a: () => inputDigit("5"),      t: "n"  },
    { l: "6",  a: () => inputDigit("6"),      t: "n"  },
    { l: "−",  a: () => handleOperator("−"), t: "op" },
    { l: "1",  a: () => inputDigit("1"),      t: "n"  },
    { l: "2",  a: () => inputDigit("2"),      t: "n"  },
    { l: "3",  a: () => inputDigit("3"),      t: "n"  },
    { l: "+",  a: () => handleOperator("+"), t: "op" },
    { l: "0",  a: () => inputDigit("0"),      t: "n", wide: true },
    { l: ".",  a: inputDecimal,               t: "n"  },
    { l: "=",  a: handleEquals,              t: "eq" },
  ];

  const btnStyle = (t, wide) => ({
    gridColumn: wide ? "span 2" : "span 1",
    height: 54,
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: t === "eq" ? 700 : 500,
    transition: "opacity 0.1s, transform 0.08s",
    background:
      t === "fn" ? M3.surfaceContainerHighest :
      t === "op" ? M3.primaryContainer :
      t === "eq" ? M3.primary :
                   M3.surfaceContainerHigh,
    color:
      t === "op" ? M3.onPrimaryContainer :
      t === "eq" ? "#21005D" :
                   M3.onSurface,
  });

  const isActiveOp = (l) => operator === l && waitingForOperand;

  // ── Shared card JSX ───────────────────────────────────────────────
  const card = (
    <div
      style={{
        width: 272,
        background: M3.surfaceContainer,
        borderRadius: 24,
        border: `1px solid ${M3.outlineVariant}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
        overflow: "hidden",
        userSelect: "none",
      }}
      // Stop overlay click propagating through the card on mobile
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header / drag handle */}
      <div
        onMouseDown={onHeaderMouseDown}
        style={{
          padding: "14px 14px 0",
          cursor: isMobile ? "default" : "grab",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: M3.onSurfaceVariant, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
          CALCULATOR
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: M3.onSurfaceVariant, display: "flex", padding: 4, borderRadius: 8 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${M3.primary}22`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <X size={15} />
        </button>
      </div>

      {/* Display */}
      <div style={{ padding: "8px 16px 10px", textAlign: "right" }}>
        <div style={{ color: M3.onSurfaceVariant, fontSize: 12, minHeight: 18, opacity: 0.65 }}>
          {prevValue !== null ? `${fmtResult(prevValue)} ${operator}` : ""}
        </div>
        <div style={{
          color: M3.onSurface,
          fontSize: display.length > 10 ? 24 : 38,
          fontWeight: 300,
          letterSpacing: -1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          transition: "font-size 0.15s",
        }}>
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: "4px 10px 14px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
        {btns.map((btn, i) => (
          <button
            key={i}
            onClick={btn.a}
            style={{
              ...btnStyle(btn.t, btn.wide),
              outline: isActiveOp(btn.l) ? `2px solid ${M3.primary}` : "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {btn.l}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Mobile: blur overlay, centered, click-outside closes ──────────
  if (isMobile) {
    return (
      <div
        style={{
          display: show ? "flex" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background: "rgba(0,0,0,0.4)",
        }}
        onClick={onClose}
      >
        {card}
      </div>
    );
  }

  // ── Desktop: fixed, draggable, no overlay ─────────────────────────
  return (
    <div
      style={{
        display: show ? "block" : "none",
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
      }}
    >
      {card}
    </div>
  );
}
