import React from 'react';
import { useLocation } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { Menu, Sun, Moon } from 'lucide-react';
import { CURRENCIES } from '../utils/formatters';

const PAGE_TITLES = {
  '/': 'Financial Dashboard',
  '/dashboard': 'Financial Dashboard',
  '/transactions': 'Transaction History',
  '/add-transaction': 'Add Transaction',
  '/budgets': 'Monthly Budget Management',
  '/reports': 'Reports & Financial Summary',
  '/settings': 'Account & Preferences',
};

export const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { theme, updateTheme, currency } = useFinance();

  const currentTitle = PAGE_TITLES[location.pathname] || 'DailySpend';
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.INR;

  const toggleTheme = () => {
    updateTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="btn-icon menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="page-title">{currentTitle}</h1>
      </div>

      <div className="navbar-right">
        {/* Currency indicator pill */}
        <div
          className="badge badge-category"
          style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600 }}
          title={`Active currency: ${currencyInfo.label}`}
        >
          Currency: {currencyInfo.label}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
