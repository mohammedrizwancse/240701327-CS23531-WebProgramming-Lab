import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getTransactions,
  addTransaction as storageAddTxn,
  updateTransaction as storageUpdateTxn,
  deleteTransaction as storageDeleteTxn,
  clearUserTransactions as storageClearTxns,
  getBudgets,
  upsertBudget as storageUpsertBudget,
  deleteBudget as storageDeleteBudget,
  getUserSettings,
  saveUserSettings,
} from '../utils/storage';
import { getCurrentMonthString } from '../utils/formatters';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [settings, setSettings] = useState({ currency: 'INR', theme: 'light' });
  const [toasts, setToasts] = useState([]);

  // Toast notification system
  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Synchronize state whenever logged in user changes
  useEffect(() => {
    if (user && user.id) {
      const userTxns = getTransactions(user.id);
      const userBudgets = getBudgets(user.id);
      const userSettings = getUserSettings(user.id);

      setTransactions(userTxns);
      setBudgets(userBudgets);
      setSettings(userSettings);

      // Apply theme to document element
      document.documentElement.setAttribute('data-theme', userSettings.theme || 'light');
    } else {
      setTransactions([]);
      setBudgets([]);
      setSettings({ currency: 'INR', theme: 'light' });
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [user]);

  // Overall financial calculations (across all records)
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const currentBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const totalSavings = useMemo(() => {
    return currentBalance; // Net savings represented by balance
  }, [currentBalance]);

  // Transaction CRUD handlers
  const addTxn = (data) => {
    if (!user) return;
    const created = storageAddTxn(user.id, data);
    setTransactions((prev) => [created, ...prev]);
    addToast('Transaction recorded successfully!', 'success');
    return created;
  };

  const editTxn = (txnId, updates) => {
    if (!user) return;
    const updated = storageUpdateTxn(user.id, txnId, updates);
    setTransactions((prev) => prev.map((t) => (t.id === txnId ? updated : t)));
    addToast('Transaction updated successfully!', 'success');
    return updated;
  };

  const removeTxn = (txnId) => {
    if (!user) return;
    storageDeleteTxn(user.id, txnId);
    setTransactions((prev) => prev.filter((t) => t.id !== txnId));
    addToast('Transaction deleted.', 'info');
  };

  const clearAllTxns = () => {
    if (!user) return;
    storageClearTxns(user.id);
    setTransactions([]);
    addToast('All transaction records have been cleared.', 'info');
  };

  // Budget CRUD handlers
  const saveBudgetItem = (data) => {
    if (!user) return;
    const saved = storageUpsertBudget(user.id, data);
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.month === data.month && b.category === data.category);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    addToast('Monthly budget saved successfully!', 'success');
    return saved;
  };

  const removeBudgetItem = (budgetId) => {
    if (!user) return;
    storageDeleteBudget(user.id, budgetId);
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    addToast('Budget entry removed.', 'info');
  };

  // Settings handlers
  const updateCurrency = (code) => {
    if (!user) return;
    const updated = saveUserSettings(user.id, { currency: code });
    setSettings(updated);
    addToast(`Currency preference set to ${code}.`, 'info');
  };

  const updateTheme = (newTheme) => {
    if (!user) return;
    const updated = saveUserSettings(user.id, { theme: newTheme });
    setSettings(updated);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Detailed helper for monthly summary calculations
  const getMonthlySummary = useCallback(
    (monthStr = getCurrentMonthString()) => {
      const monthTxns = transactions.filter((t) => (t.date || '').startsWith(monthStr));

      const incomeTxns = monthTxns.filter((t) => t.type === 'income');
      const expenseTxns = monthTxns.filter((t) => t.type === 'expense');

      const monthIncome = incomeTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const monthExpense = expenseTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const monthBalance = monthIncome - monthExpense;

      // Find highest expense in this month
      let highestExpense = null;
      if (expenseTxns.length > 0) {
        highestExpense = expenseTxns.reduce((max, t) =>
          Number(t.amount) > Number(max.amount) ? t : max,
          expenseTxns[0]
        );
      }

      // Category-wise expense calculation
      const catExpenseMap = {};
      expenseTxns.forEach((t) => {
        const cat = t.category || 'Other';
        if (!catExpenseMap[cat]) {
          catExpenseMap[cat] = { category: cat, amount: 0, count: 0 };
        }
        catExpenseMap[cat].amount += Number(t.amount) || 0;
        catExpenseMap[cat].count += 1;
      });

      const categoryExpenses = Object.values(catExpenseMap)
        .map((item) => ({
          ...item,
          percentage: monthExpense > 0 ? (item.amount / monthExpense) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Category-wise income calculation
      const catIncomeMap = {};
      incomeTxns.forEach((t) => {
        const cat = t.category || 'Other';
        if (!catIncomeMap[cat]) {
          catIncomeMap[cat] = { category: cat, amount: 0, count: 0 };
        }
        catIncomeMap[cat].amount += Number(t.amount) || 0;
        catIncomeMap[cat].count += 1;
      });

      const categoryIncomes = Object.values(catIncomeMap)
        .map((item) => ({
          ...item,
          percentage: monthIncome > 0 ? (item.amount / monthIncome) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        month: monthStr,
        transactions: monthTxns,
        incomeTxns,
        expenseTxns,
        totalIncome: monthIncome,
        totalExpenses: monthExpense,
        netBalance: monthBalance,
        incomeCount: incomeTxns.length,
        expenseCount: expenseTxns.length,
        highestExpense,
        categoryExpenses,
        categoryIncomes,
      };
    },
    [transactions]
  );

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        settings,
        currency: settings.currency || 'INR',
        theme: settings.theme || 'light',
        totalIncome,
        totalExpenses,
        currentBalance,
        totalSavings,
        addTxn,
        editTxn,
        removeTxn,
        clearAllTxns,
        saveBudgetItem,
        removeBudgetItem,
        updateCurrency,
        updateTheme,
        getMonthlySummary,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
