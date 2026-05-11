import { neon } from '@neondatabase/serverless';

const NullishQueryFunction = (strings, ...values) => {
  const query = strings.join('?').toLowerCase();
  
  if (query.includes('user_settings')) {
    return Promise.resolve([{ is_pro: true }]);
  }
  
  if (query.includes('budgets')) {
    if (query.includes('insert')) {
      return Promise.resolve([{ id: Date.now(), category: values[0], limit_amount: values[1], period: values[2] }]);
    }
    return Promise.resolve([
      { id: 1, category: 'Food', limit_amount: 500, period: 'monthly' },
      { id: 2, category: 'Transport', limit_amount: 200, period: 'monthly' },
      { id: 3, category: 'Shopping', limit_amount: 300, period: 'monthly' }
    ]);
  }
  
  if (query.includes('transactions')) {
    if (query.includes('insert')) {
      return Promise.resolve([{ id: Date.now(), amount: values[0], description: values[1], category: values[2], type: values[3] }]);
    }
    return Promise.resolve([
      { id: 1, amount: 480, description: 'Groceries', category: 'Food', type: 'expense', created_at: new Date().toISOString() },
      { id: 2, amount: 50, description: 'Gas', category: 'Transport', type: 'expense', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, amount: 20, description: 'Snacks', category: 'Food', type: 'expense', created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 4, amount: 150, description: 'Shoes', category: 'Shopping', type: 'expense', created_at: new Date(Date.now() - 259200000).toISOString() },
      { id: 5, amount: 2000, description: 'Salary', category: 'Income', type: 'income', created_at: new Date(Date.now() - 345600000).toISOString() }
    ]);
  }
  
  return Promise.resolve([]);
};
NullishQueryFunction.transaction = () => Promise.resolve([]);

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : NullishQueryFunction;

export default sql;