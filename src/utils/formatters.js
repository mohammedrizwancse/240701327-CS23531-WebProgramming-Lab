/**
 * DailySpend - Formatters and Constants Utility
 */

export const INCOME_CATEGORIES = [
  'Salary',
  'Allowance',
  'Scholarship',
  'Freelance',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
];

export const CURRENCIES = {
  INR: { label: 'INR (₹)', symbol: '₹', locale: 'en-IN' },
  USD: { label: 'USD ($)', symbol: '$', locale: 'en-US' },
  EUR: { label: 'EUR (€)', symbol: '€', locale: 'de-DE' },
  GBP: { label: 'GBP (£)', symbol: '£', locale: 'en-GB' },
};

export const formatCurrency = (amount, currencyCode = 'INR') => {
  const num = Number(amount) || 0;
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;

  try {
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${curr.symbol}${num.toLocaleString()}`;
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getMonthName = (monthStr) => {
  // expects 'YYYY-MM'
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getCurrentMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCategoryBadgeStyle = (category, type) => {
  if (type === 'income') {
    return {
      bg: 'var(--badge-income-bg)',
      color: 'var(--badge-income-text)',
      border: 'var(--badge-income-border)',
    };
  }
  return {
    bg: 'var(--badge-expense-bg)',
    color: 'var(--badge-expense-text)',
    border: 'var(--badge-expense-border)',
  };
};
