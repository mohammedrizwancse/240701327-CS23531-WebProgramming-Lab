/**
 * DailySpend - Local Storage Utility Module
 * Provides robust, fail-safe read/write operations for users, sessions,
 * transactions, budgets, and user preferences with complete user data isolation.
 * Handles missing, malformed, or blocked Local Storage gracefully.
 */

const STORAGE_KEYS = {
  USERS: 'dailyspend_users',
  SESSION: 'dailyspend_session',
  TRANSACTIONS_PREFIX: 'dailyspend_transactions_',
  BUDGETS_PREFIX: 'dailyspend_budgets_',
  SETTINGS_PREFIX: 'dailyspend_settings_',
};

// In-memory fallback in case browser blocks or disables Local Storage
const memoryStorage = {};

const storageDriver = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage getItem unavailable, falling back to memory storage:', e);
    }
    return Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val);
        return;
      }
    } catch (e) {
      console.warn('LocalStorage setItem unavailable, falling back to memory storage:', e);
    }
    memoryStorage[key] = String(val);
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn('LocalStorage removeItem unavailable, falling back to memory storage:', e);
    }
    delete memoryStorage[key];
  },
};

// Safe JSON parse helper with strict type checks
const safeParse = (data, fallback) => {
  if (data === null || data === undefined || data === '' || data === 'undefined') {
    return fallback;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed === null || parsed === undefined) {
      return fallback;
    }
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback;
    }
    if (typeof fallback === 'object' && fallback !== null) {
      return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
    }
    return parsed;
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
  try {
    const data = storageDriver.getItem(STORAGE_KEYS.USERS);
    const parsed = safeParse(data, []);
    if (!Array.isArray(parsed)) return [];
    // Filter out corrupted/incomplete user records
    return parsed.filter(
      (u) => u && typeof u === 'object' && typeof u.id === 'string' && typeof u.email === 'string'
    );
  } catch (err) {
    console.error('getUsers error:', err);
    return [];
  }
};

export const saveUsers = (users) => {
  const cleanUsers = Array.isArray(users) ? users : [];
  const json = safeStringify(cleanUsers);
  if (json !== null) {
    storageDriver.setItem(STORAGE_KEYS.USERS, json);
  }
};

export const findUserByEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;

  const users = getUsers();
  return (
    users.find(
      (u) =>
        u &&
        typeof u.email === 'string' &&
        u.email.toLowerCase().trim() === normalized
    ) || null
  );
};

export const createUser = ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('Full name is required.');
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('Email address is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please log in instead.');
  }

  const users = getUsers();
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    email: normalizedEmail,
    password, // Demo credential for client-side local storage demonstration
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Initialize clean, empty datasets for the new user
  saveTransactions(newUser.id, []);
  saveBudgets(newUser.id, []);
  saveUserSettings(newUser.id, {
    currency: 'INR',
    theme: 'light',
  });

  return newUser;
};

export const updateUserProfile = (userId, updates) => {
  if (!userId) throw new Error('User ID is required.');
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User account not found.');

  if (updates.email) {
    const normalizedEmail = updates.email.toLowerCase().trim();
    if (normalizedEmail !== users[index].email.toLowerCase().trim()) {
      const conflict = users.find(
        (u) => u.id !== userId && u.email.toLowerCase().trim() === normalizedEmail
      );
      if (conflict) {
        throw new Error('Another account is already using that email address.');
      }
      updates.email = normalizedEmail;
    }
  }

  if (updates.name) {
    updates.name = updates.name.trim();
  }

  users[index] = { ...users[index], ...updates };
  saveUsers(users);

  // Update session if it belongs to the active user
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
  if (!userId) return;

  // 1. Remove user from users array
  const users = getUsers();
  const filteredUsers = users.filter((u) => u.id !== userId);
  saveUsers(filteredUsers);

  // 2. Remove user-specific datasets
  storageDriver.removeItem(`${STORAGE_KEYS.TRANSACTIONS_PREFIX}${userId}`);
  storageDriver.removeItem(`${STORAGE_KEYS.BUDGETS_PREFIX}${userId}`);
  storageDriver.removeItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`);

  // 3. Clear session if active
  const session = getSession();
  if (session && session.userId === userId) {
    clearSession();
  }
};

/* ==========================================================================
   SESSION MANAGEMENT
   ========================================================================== */

export const getSession = () => {
  try {
    const data = storageDriver.getItem(STORAGE_KEYS.SESSION);
    const parsed = safeParse(data, null);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.userId) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('getSession error:', err);
    return null;
  }
};

export const saveSession = (sessionData) => {
  if (!sessionData || typeof sessionData !== 'object') return;
  const json = safeStringify(sessionData);
  if (json !== null) {
    storageDriver.setItem(STORAGE_KEYS.SESSION, json);
  }
};

export const clearSession = () => {
  storageDriver.removeItem(STORAGE_KEYS.SESSION);
};

/* ==========================================================================
   USER SETTINGS / PREFERENCES
   ========================================================================== */

export const getUserSettings = (userId) => {
  const fallback = { currency: 'INR', theme: 'light' };
  if (!userId) return fallback;
  try {
    const data = storageDriver.getItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`);
    const parsed = safeParse(data, fallback);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        currency: parsed.currency || 'INR',
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
      };
    }
    return fallback;
  } catch (err) {
    console.error('getUserSettings error:', err);
    return fallback;
  }
};

export const saveUserSettings = (userId, settings) => {
  if (!userId || !settings) return { currency: 'INR', theme: 'light' };
  const current = getUserSettings(userId);
  const updated = { ...current, ...settings };
  const json = safeStringify(updated);
  if (json !== null) {
    storageDriver.setItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${userId}`, json);
  }
  return updated;
};

/* ==========================================================================
   TRANSACTIONS MANAGEMENT (Strictly scoped by userId)
   ========================================================================== */

export const getTransactions = (userId) => {
  if (!userId) return [];
  try {
    const data = storageDriver.getItem(`${STORAGE_KEYS.TRANSACTIONS_PREFIX}${userId}`);
    const parsed = safeParse(data, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => t && typeof t === 'object' && t.id && t.title !== undefined
    );
  } catch (err) {
    console.error('getTransactions error:', err);
    return [];
  }
};

export const saveTransactions = (userId, transactions) => {
  if (!userId) return;
  const cleanTxns = Array.isArray(transactions) ? transactions : [];
  const json = safeStringify(cleanTxns);
  if (json !== null) {
    storageDriver.setItem(`${STORAGE_KEYS.TRANSACTIONS_PREFIX}${userId}`, json);
  }
};

export const addTransaction = (userId, transaction) => {
  if (!userId) throw new Error('Active user session required.');
  if (!transaction || !transaction.title || !transaction.amount) {
    throw new Error('Valid transaction details are required.');
  }

  const transactions = getTransactions(userId);
  const newTxn = {
    id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    type: transaction.type === 'income' ? 'income' : 'expense',
    title: String(transaction.title).trim(),
    amount: Math.abs(Number(transaction.amount) || 0),
    category: transaction.category || (transaction.type === 'income' ? 'Salary' : 'Other'),
    date: transaction.date || new Date().toISOString().split('T')[0],
    notes: (transaction.notes || '').trim(),
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(newTxn);
  saveTransactions(userId, transactions);
  return newTxn;
};

export const updateTransaction = (userId, txnId, updates) => {
  if (!userId) throw new Error('Active user session required.');
  const transactions = getTransactions(userId);
  const index = transactions.findIndex((t) => t.id === txnId);
  if (index === -1) throw new Error('Transaction not found.');

  const updatedTxn = {
    ...transactions[index],
    ...updates,
    amount: updates.amount !== undefined ? Math.abs(Number(updates.amount) || 0) : transactions[index].amount,
    updatedAt: new Date().toISOString(),
  };

  transactions[index] = updatedTxn;
  saveTransactions(userId, transactions);
  return updatedTxn;
};

export const deleteTransaction = (userId, txnId) => {
  if (!userId) throw new Error('Active user session required.');
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
  try {
    const data = storageDriver.getItem(`${STORAGE_KEYS.BUDGETS_PREFIX}${userId}`);
    const parsed = safeParse(data, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b) => b && typeof b === 'object' && b.id && b.month && b.category
    );
  } catch (err) {
    console.error('getBudgets error:', err);
    return [];
  }
};

export const saveBudgets = (userId, budgets) => {
  if (!userId) return;
  const cleanBudgets = Array.isArray(budgets) ? budgets : [];
  const json = safeStringify(cleanBudgets);
  if (json !== null) {
    storageDriver.setItem(`${STORAGE_KEYS.BUDGETS_PREFIX}${userId}`, json);
  }
};

export const upsertBudget = (userId, budgetData) => {
  if (!userId) throw new Error('Active user session required.');
  if (!budgetData || !budgetData.month || !budgetData.category || !budgetData.amount) {
    throw new Error('Complete budget data is required.');
  }

  const budgets = getBudgets(userId);
  const index = budgets.findIndex(
    (b) => b.month === budgetData.month && b.category === budgetData.category
  );

  const budgetItem = {
    id: index !== -1 ? budgets[index].id : 'bgt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    month: budgetData.month,
    category: budgetData.category,
    amount: Math.abs(Number(budgetData.amount) || 0),
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
  if (!userId) throw new Error('Active user session required.');
  const budgets = getBudgets(userId);
  const filtered = budgets.filter((b) => b.id !== budgetId);
  saveBudgets(userId, filtered);
  return true;
};
