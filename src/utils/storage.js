/**
 * DailySpend - Local Storage Utility Module
 * Provides robust, safe read/write operations for users, sessions,
 * transactions, budgets, and user preferences with complete user data isolation.
 */

const STORAGE_KEYS = {
  USERS: 'dailyspend_users',
  SESSION: 'dailyspend_session',
  TRANSACTIONS_PREFIX: 'dailyspend_transactions_',
  BUDGETS_PREFIX: 'dailyspend_budgets_',
  SETTINGS_PREFIX: 'dailyspend_settings_',
};

// Safe JSON parse helper
const safeParse = (data, fallback) => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('LocalStorage parse error:', err);
    return fallback;
  }
};

// Safe JSON stringify helper
const safeStringify = (data) => {
  try {
    return JSON.stringify(data);
  } catch (err) {
    console.error('LocalStorage stringify error:', err);
    return null;
  }
};

/* ==========================================================================
   USERS MANAGEMENT
   ========================================================================== */

export const getUsers = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return safeParse(data, []);
};

export const saveUsers = (users) => {
  const json = safeStringify(users);
  if (json !== null) {
    localStorage.setItem(STORAGE_KEYS.USERS, json);
  }
};

export const findUserByEmail = (email) => {
  if (!email) return null;
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
};

export const createUser = ({ name, email, password }) => {
  const users = getUsers();
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // Demo local storage credential
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Initialize empty datasets for the new user
  saveTransactions(newUser.id, []);
  saveBudgets(newUser.id, []);
  saveUserSettings(newUser.id, {
    currency: 'INR',
    theme: 'light',
  });

  return newUser;
};

export const updateUserProfile = (userId, updates) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found.');

  // If email is being changed, check if new email is already taken
  if (updates.email && updates.email.toLowerCase() !== users[index].email.toLowerCase()) {
    const conflict = users.find(
      (u) => u.id !== userId && u.email.toLowerCase() === updates.email.toLowerCase().trim()
    );
    if (conflict) {
      throw new Error('Another account is already using that email address.');
    }
  }

  users[index] = { ...users[index], ...updates };
  saveUsers(users);

  // Update session if it's the current user
  const session = getSession();
  if (session && session.userId === userId) {
    saveSession({
      ...session,
      name: users[index].name,
      email: users[index].email,
    });
  }

  return users[index];
};

export const deleteUserAccount = (userId) => {
  // 1. Remove user record
  const users = getUsers();
  const filteredUsers = users.filter((u) => u.id !== userId);
  saveUsers(filteredUsers);

  // 2. Remove user-specific datasets
  localStorage.removeItem(`${STORAGE_KEYS.TRANSACTIONS_PREFIX}${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.BUDGETS_PREFIX}${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`);

  // 3. Clear session if currently logged in as this user
  const session = getSession();
  if (session && session.userId === userId) {
    clearSession();
  }
};

/* ==========================================================================
   SESSION MANAGEMENT
   ========================================================================== */

export const getSession = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  return safeParse(data, null);
};

export const saveSession = (sessionData) => {
  const json = safeStringify(sessionData);
  if (json !== null) {
    localStorage.setItem(STORAGE_KEYS.SESSION, json);
  }
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

/* ==========================================================================
   USER SETTINGS / PREFERENCES
   ========================================================================== */

export const getUserSettings = (userId) => {
  if (!userId) return { currency: 'INR', theme: 'light' };
  const data = localStorage.getItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`);
  return safeParse(data, { currency: 'INR', theme: 'light' });
};

export const saveUserSettings = (userId, settings) => {
  if (!userId) return;
  const current = getUserSettings(userId);
  const updated = { ...current, ...settings };
  const json = safeStringify(updated);
  if (json !== null) {
    localStorage.setItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`, json);
  }
  return updated;
};

/* ==========================================================================
   TRANSACTIONS MANAGEMENT (Strictly scoped by userId)
   ========================================================================== */

export const getTransactions = (userId) => {
  if (!userId) return [];
  const data = localStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS_PREFIX}${userId}`);
  return safeParse(data, []);
};

export const saveTransactions = (userId, transactions) => {
  if (!userId) return;
  const json = safeStringify(transactions);
  if (json !== null) {
    localStorage.setItem(`${STORAGE_KEYS.TRANSACTIONS_PREFIX}${userId}`, json);
  }
};

export const addTransaction = (userId, transaction) => {
  if (!userId) throw new Error('User session required');
  const transactions = getTransactions(userId);

  const newTxn = {
    id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    type: transaction.type, // 'income' or 'expense'
    title: transaction.title.trim(),
    amount: Number(transaction.amount),
    category: transaction.category,
    date: transaction.date, // 'YYYY-MM-DD'
    notes: (transaction.notes || '').trim(),
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(newTxn);
  saveTransactions(userId, transactions);
  return newTxn;
};

export const updateTransaction = (userId, txnId, updates) => {
  if (!userId) throw new Error('User session required');
  const transactions = getTransactions(userId);
  const index = transactions.findIndex((t) => t.id === txnId);
  if (index === -1) throw new Error('Transaction not found');

  transactions[index] = {
    ...transactions[index],
    ...updates,
    amount: Number(updates.amount !== undefined ? updates.amount : transactions[index].amount),
    updatedAt: new Date().toISOString(),
  };

  saveTransactions(userId, transactions);
  return transactions[index];
};

export const deleteTransaction = (userId, txnId) => {
  if (!userId) throw new Error('User session required');
  const transactions = getTransactions(userId);
  const filtered = transactions.filter((t) => t.id !== txnId);
  saveTransactions(userId, filtered);
  return true;
};

export const clearUserTransactions = (userId) => {
  if (!userId) return;
  saveTransactions(userId, []);
};

/* ==========================================================================
   BUDGETS MANAGEMENT (Strictly scoped by userId)
   ========================================================================== */

export const getBudgets = (userId) => {
  if (!userId) return [];
  const data = localStorage.getItem(`${STORAGE_KEYS.BUDGETS_PREFIX}${userId}`);
  return safeParse(data, []);
};

export const saveBudgets = (userId, budgets) => {
  if (!userId) return;
  const json = safeStringify(budgets);
  if (json !== null) {
    localStorage.setItem(`${STORAGE_KEYS.BUDGETS_PREFIX}${userId}`, json);
  }
};

export const upsertBudget = (userId, budgetData) => {
  if (!userId) throw new Error('User session required');
  const budgets = getBudgets(userId);

  // A budget is uniquely identified by (month + category)
  // category = 'Overall' for total monthly budget, or category name e.g. 'Food'
  const index = budgets.findIndex(
    (b) => b.month === budgetData.month && b.category === budgetData.category
  );

  const budgetItem = {
    id: index !== -1 ? budgets[index].id : 'bgt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    month: budgetData.month, // 'YYYY-MM'
    category: budgetData.category, // 'Overall' or specific category
    amount: Number(budgetData.amount),
    updatedAt: new Date().toISOString(),
  };

  if (index !== -1) {
    budgets[index] = budgetItem;
  } else {
    budgets.push(budgetItem);
  }

  saveBudgets(userId, budgets);
  return budgetItem;
};

export const deleteBudget = (userId, budgetId) => {
  if (!userId) throw new Error('User session required');
  const budgets = getBudgets(userId);
  const filtered = budgets.filter((b) => b.id !== budgetId);
  saveBudgets(userId, filtered);
  return true;
};
