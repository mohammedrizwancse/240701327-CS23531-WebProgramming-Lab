import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BudgetCard } from '../components/BudgetCard';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EmptyState } from '../components/EmptyState';
import {
  EXPENSE_CATEGORIES,
  getCurrentMonthString,
  getMonthName,
  formatCurrency,
} from '../utils/formatters';
import {
  PiggyBank,
  PlusCircle,
  Calendar,
  AlertCircle,
  Check,
  X,
  Layers,
} from 'lucide-react';

export const Budget = () => {
  const { budgets, transactions, currency, saveBudgetItem, removeBudgetItem } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);

  // Form input states
  const [budgetCategory, setBudgetCategory] = useState('Overall');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [formError, setFormError] = useState('');

  // Budgets for the selected month
  const activeMonthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // Overall budget if exists for selected month
  const overallBudget = useMemo(() => {
    return activeMonthBudgets.find((b) => b.category === 'Overall');
  }, [activeMonthBudgets]);

  // Category budgets for selected month
  const categoryBudgets = useMemo(() => {
    return activeMonthBudgets.filter((b) => b.category !== 'Overall');
  }, [activeMonthBudgets]);

  // Calculate actual spending for this month from expense transactions
  const monthExpenses = useMemo(() => {
    return transactions.filter(
      (t) => t.type === 'expense' && (t.date || '').startsWith(selectedMonth)
    );
  }, [transactions, selectedMonth]);

  const totalMonthExpense = useMemo(() => {
    return monthExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [monthExpenses]);

  // Category-wise spent amounts map
  const categorySpentMap = useMemo(() => {
    const map = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      map[cat] = 0;
    });
    monthExpenses.forEach((t) => {
      const cat = t.category || 'Other';
      map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
    });
    return map;
  }, [monthExpenses]);

  const handleOpenAddForm = (existing = null) => {
    if (existing) {
      setEditingBudget(existing);
      setBudgetCategory(existing.category);
      setBudgetAmount(String(existing.amount));
    } else {
      setEditingBudget(null);
      setBudgetCategory('Overall');
      setBudgetAmount('');
    }
    setFormError('');
    setShowAddForm(true);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const num = parseFloat(budgetAmount);
    if (!budgetAmount || isNaN(num) || num <= 0) {
      setFormError('Please enter a valid budget amount greater than 0.');
      return;
    }

    saveBudgetItem({
      month: selectedMonth,
      category: budgetCategory,
      amount: num,
    });

    setShowAddForm(false);
    setEditingBudget(null);
    setBudgetAmount('');
    setFormError('');
  };

  // Categories available to add (excluding ones already added for this month, unless editing)
  const availableCategories = useMemo(() => {
    const currentCategories = activeMonthBudgets.map((b) => b.category);
    const options = ['Overall', ...EXPENSE_CATEGORIES];
    if (editingBudget) return options;
    return options.filter((cat) => !currentCategories.includes(cat));
  }, [activeMonthBudgets, editingBudget]);

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Monthly Budget Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Plan spending limits for {getMonthName(selectedMonth)} and track live utilization
          </p>
        </div>

        {/* Month Selector & Add Button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="month"
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) setSelectedMonth(e.target.value);
              }}
            />
          </div>

          <button
            onClick={() => handleOpenAddForm()}
            className="btn btn-primary"
            disabled={availableCategories.length === 0}
          >
            <PlusCircle size={16} />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Month Summary Overview Banner */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'var(--bg-surface)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            TARGET MONTH
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
            {getMonthName(selectedMonth)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            TOTAL ACTUAL EXPENSES
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-expense)', marginTop: '2px' }}>
            {formatCurrency(totalMonthExpense, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            OVERALL BUDGET LIMIT
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
            {overallBudget ? formatCurrency(overallBudget.amount, currency) : 'Not Set'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            OVERALL REMAINING
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color:
                overallBudget && Number(overallBudget.amount) - totalMonthExpense < 0
                  ? 'var(--color-expense)'
                  : 'var(--color-income)',
              marginTop: '2px',
            }}
          >
            {overallBudget
              ? formatCurrency(Number(overallBudget.amount) - totalMonthExpense, currency)
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Add / Edit Budget Inline Card / Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--color-primary)' }}>
          <div className="card-header">
            <h3 className="card-title">
              <PiggyBank size={18} style={{ color: 'var(--color-primary)' }} />
              <span>{editingBudget ? 'Edit Budget Entry' : 'Add Monthly Budget'}</span>
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-icon"
              style={{ border: 'none' }}
              aria-label="Close budget form"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div className="alert-box alert-danger">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveBudget}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="budget-cat-select">
                  Budget Scope / Category
                </label>
                <select
                  id="budget-cat-select"
                  className="form-select"
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  disabled={!!editingBudget}
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'Overall' ? 'Overall Monthly Budget' : `${cat} (Category)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="budget-amount-input">
                  Budget Amount ({currency})
                </label>
                <input
                  id="budget-amount-input"
                  type="number"
                  step="any"
                  min="1"
                  placeholder="e.g. 15000"
                  className="form-input"
                  value={budgetAmount}
                  onChange={(e) => {
                    setBudgetAmount(e.target.value);
                    if (formError) setFormError('');
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} />
                <span>Save Budget</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overall Budget Card */}
      {overallBudget && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
            Overall Monthly Limit
          </h3>
          <BudgetCard
            budget={overallBudget}
            spent={totalMonthExpense}
            currency={currency}
            onEdit={handleOpenAddForm}
            onDelete={(b) => setDeletingBudget(b)}
          />
        </div>
      )}

      {/* Category Budgets Grid */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--color-primary)' }} />
          <span>Category Budgets ({categoryBudgets.length})</span>
        </h3>

        {categoryBudgets.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '18px',
            }}
          >
            {categoryBudgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                spent={categorySpentMap[b.category] || 0}
                currency={currency}
                onEdit={handleOpenAddForm}
                onDelete={(target) => setDeletingBudget(target)}
              />
            ))}
          </div>
        ) : (
          !overallBudget && (
            <EmptyState
              icon={PiggyBank}
              title={`No budgets set for ${getMonthName(selectedMonth)}`}
              description="Establish overall or category spending budgets to keep your expenses in check and receive timely warnings."
              action={
                <button onClick={() => handleOpenAddForm()} className="btn btn-primary btn-sm">
                  <PlusCircle size={16} />
                  <span>Set Budget for {getMonthName(selectedMonth)}</span>
                </button>
              }
            />
          )
        )}
      </div>

      {/* Delete Budget Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingBudget}
        title="Delete Budget"
        message={`Are you sure you want to remove the ${deletingBudget?.category} budget for ${getMonthName(
          deletingBudget?.month
        )}?`}
        confirmText="Remove Budget"
        onConfirm={() => {
          if (deletingBudget) {
            removeBudgetItem(deletingBudget.id);
            setDeletingBudget(null);
          }
        }}
        onCancel={() => setDeletingBudget(null)}
      />
    </div>
  );
};
