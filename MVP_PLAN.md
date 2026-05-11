# MVP Strategy: Personal Finance Tracker (Single User) - Updated

This document outlines the lean strategy for transforming the current system into a high-utility, low-friction personal tool by stripping away commercial "bloat" while maintaining mobile usability.

## 🎯 The Core Objective
**Minimize Friction, Maximize Visibility.** 
As a solo user, the app should be a tool for *recording* and *viewing* financial truth, while staying easy to navigate on mobile devices.

---

## ✅ WHAT STAYS (The Essentials)

| Feature | Rationale |
| :--- | :--- |
| **Multi-Page Navigation** | Essential for mobile usability to avoid excessive scrolling. |
| **Simplified Budgeting** | Track limits for core categories without over-complex setup. |
| **Safe-to-Spend Hero** | Provides immediate clarity on financial "headroom." |
| **Fast Transaction Entry** | 3-second entry for Amount, Category, and Description. |
| **Running Net Balance** | The "North Star" metric: How much money do I have right now? |
| **Recent History** | A dedicated page for auditing past entries. |
| **Supabase Integration** | Reliable, secure cloud storage for data persistence. |

---

## ❌ WHAT LEAVES (The Bloat)

| Feature | Why it goes |
| :--- | :--- |
| **AI Advisor** | High complexity/latency. For a personal tool, the data should speak for itself. |
| **Complex Ratios (DTI, 50/30/20)** | These are "analytical noise" for a daily tracker. They clutter the UI. |
| **Credit Score Tracker** | Static data that doesn't benefit from being inside a transaction tracker. |
| **Pricing/Paywall Logic** | Entirely unnecessary for a personal-use system. |

## 🏗️ The "MVP" Architecture
- **Structure**: Maintain the current multi-page structure (`/`, `/history`, `/budgets`) to optimize for mobile usability.
- **Logic**: Use simplified category-based budgeting that directly updates the "Safe-to-Spend" calculation.
- **Backend**: Focused API routes for `transactions` and `budgets` only.

---

## 🚀 Implementation Priority
1. **Cleanup**: Delete `src/app/advisor` and any remaining paywall/pricing code.
2. **Refinement**: Simplify the `Budget` entry form and the Dashboard KPI cards.
3. **UI Polishing**: Ensure the navigation remains intuitive and the `Safe-to-Spend` card is the focal point of the main dashboard.
