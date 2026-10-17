import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  getUsers,
  createUser,
  findUserByEmail,
  updateUserProfile,
  deleteUserAccount,
} from '../utils/storage';

const AuthContext = createContext(null);

// Synchronously recover session on initial app load
const getInitialUser = () => {
  try {
    const session = getSession();
    if (session && session.userId) {
      const users = getUsers();
      const found = users.find((u) => u && u.id === session.userId);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          email: found.email,
          createdAt: found.createdAt,
        };
      } else {
        clearSession();
      }
    }
  } catch (err) {
    console.error('Session init error:', err);
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  // Synchronous initialization means loading is false immediately on page load/refresh
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      if (!email || typeof email !== 'string' || !email.trim()) {
        throw new Error('Please enter your email address.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existing = findUserByEmail(normalizedEmail);
      if (!existing) {
        throw new Error('No account found with this email address. Please sign up first.');
      }

      if (existing.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }

      const sessionData = {
        userId: existing.id,
        name: existing.name,
        email: existing.email,
        loginTime: new Date().toISOString(),
      };

      saveSession(sessionData);
      const authenticatedUser = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        createdAt: existing.createdAt,
      };

      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      const newUser = createUser({ name, email, password });

      const sessionData = {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        loginTime: new Date().toISOString(),
      };

      saveSession(sessionData);
      const authenticatedUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async ({ name }) => {
    if (!user) throw new Error('Not authenticated.');
    const updated = updateUserProfile(user.id, { name });
    setUser((prev) => (prev ? { ...prev, name: updated.name } : null));
    return updated;
  }, [user]);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (!user) throw new Error('Not authenticated.');
    const users = getUsers();
    const existing = users.find((u) => u.id === user.id);
    if (!existing) throw new Error('User account not found.');
    if (existing.password !== currentPassword) {
      throw new Error('Current password does not match.');
    }
    updateUserProfile(user.id, { password: newPassword });
    return true;
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    deleteUserAccount(user.id);
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
