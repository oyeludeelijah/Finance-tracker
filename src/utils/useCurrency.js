import { useState } from "react";

export const CURRENCIES = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
];

export function useCurrency() {
  const [symbol, setSymbol] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currency_symbol") || "₦";
    }
    return "₦";
  });

  const setCurrency = (newSymbol) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currency_symbol", newSymbol);
    }
    setSymbol(newSymbol);
  };

  return { symbol, setCurrency, CURRENCIES };
}
