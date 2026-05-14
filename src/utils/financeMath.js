/**
 * Calculates the total income, expenses, and balance for a set of transactions.
 * @param {Array} transactions 
 * @returns {Object} { income, expense, balance }
 */
export function calculateTotals(transactions) {
  const stats = transactions.reduce(
    (acc, t) => {
      const amt = parseFloat(t.amount || 0);
      if (t.type === "income") acc.income += amt;
      else acc.expense += amt;
      return acc;
    },
    { income: 0, expense: 0 }
  );
  return { ...stats, balance: stats.income - stats.expense };
}

/**
 * Calculates today's total spending across all expense transactions.
 * @param {Array} transactions 
 * @param {Date} date - defaults to today
 * @returns {number}
 */
export function calculateDailySpent(transactions, date = new Date()) {
  return transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const txDate = new Date(t.created_at);
      return txDate.toDateString() === date.toDateString();
    })
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
}

/**
 * Calculates the total daily budget limit across all budgets.
 * @param {Array} budgets 
 * @returns {number}
 */
export function calculateTotalDailyLimit(budgets) {
  return budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount || 0), 0);
}

/**
 * Maps budgets to include their current spending and percentage used.
 * @param {Array} budgets 
 * @param {Array} transactions 
 * @param {Date} date - defaults to today
 * @returns {Array} mapped budgets with `spent` and `percent` fields
 */
export function getBudgetStats(budgets, transactions, date = new Date()) {
  return budgets.map((b) => {
    const spent = transactions
      .filter((t) => {
        if (t.category !== b.category || t.type !== "expense") return false;
        const txDate = new Date(t.created_at);
        return txDate.toDateString() === date.toDateString();
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const limit = parseFloat(b.limit_amount || 0);
    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    return { ...b, spent, percent };
  });
}
