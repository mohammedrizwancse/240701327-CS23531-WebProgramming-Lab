import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    try {
      const session = getSession();
      if (session && session.userId) {
        const users = getUsers();
        const found = users.find((u) => u.id === session.userId);
        if (found) {
          setUser({
            id: found.id,
            name: found.name,
            email: found.email,
            createdAt: found.createdAt,
          });
        } else {
          clearSession();
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Session init error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const existing = findUserByEmail(email);
    if (!existing) {
      throw new Error('No account found with this email address.');
    }

    if (existing.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const sessionData = {
      userId: existing.id,
      name: existing.name,
      email: existing.email,
      loginTime: new Date().toISOString(),
    };

    saveSession(sessionData);
    setUser({
      id: existing.id,
      name: existing.name,
      email: existing.email,
      createdAt: existing.createdAt,
    });

    return existing;
  };

  const signup = async ({ name, email, password }) => {
    const newUser = createUser({ name, email, password });

    const sessionData = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      loginTime: new Date().toISOString(),
    };

    saveSession(sessionData);
    setUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    });

    return newUser;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const updateProfile = async ({ name }) => {
    if (!user) throw new Error('Not authenticated');
    const updated = updateUserProfile(user.id, { name });
    setUser((prev) => ({ ...prev, name: updated.name }));
    return updated;
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (!user) throw new Error('Not authenticated');
    const users = getUsers();
    const existing = users.find((u) => u.id === user.id);
    if (!existing) throw new Error('User not found');
    if (existing.password !== currentPassword) {
      throw new Error('Current password does not match.');
    }
    updateUserProfile(user.id, { password: newPassword });
    return true;
  };

  const deleteAccount = async () => {
    if (!user) return;
    deleteUserAccount(user.id);
    setUser(null);
  };

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
