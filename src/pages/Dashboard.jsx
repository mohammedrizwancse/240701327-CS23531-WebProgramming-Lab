import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionModal } from '../components/TransactionModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EmptyState } from '../components/EmptyState';
import {
  formatCurrency,
  formatDate,
  getCurrentMonthString,
  getMonthName,
} from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PlusCircle,
  ArrowRight,
  Calendar,
  Edit2,
  Trash2,
  Inbox,
  Clock,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    transactions,
    budgets,
    currency,
    totalIncome,
    totalExpenses,
    currentBalance,
    totalSavings,
    getMonthlySummary,
    editTxn,
    removeTxn,
  } = useFinance();

  // State for modals
  const [editingTxn, setEditingTxn] = useState(null);
  const [deletingTxn, setDeletingTxn] = useState(null);

  const currentMonthStr = getCurrentMonthString();
  const currentMonthStats = getMonthlySummary(currentMonthStr);

  // Overall budget for the current month
  const currentMonthOverallBudget = budgets.find(
    (b) => b.month === currentMonthStr && b.category === 'Overall'
  );

  const currentMonthBudgetSpent = currentMonthStats.totalExpenses;
  const currentMonthBudgetLimit = currentMonthOverallBudget ? Number(currentMonthOverallBudget.amount) : 0;
  const currentMonthBudgetRemaining = currentMonthBudgetLimit - currentMonthBudgetSpent;
  const currentMonthBudgetPercent =
    currentMonthBudgetLimit > 0 ? (currentMonthBudgetSpent / currentMonthBudgetLimit) * 100 : 0;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Greeting message
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div>
      {/* Welcome & Quick Action Header */}
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {greeting}, {user?.name || 'User'}! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Here is your live personal financial overview and transaction activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/add-transaction" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </Link>
          <Link to="/transactions" className="btn btn-secondary">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Income"
          amount={totalIncome}
          currency={currency}
          type="income"
          icon={TrendingUp}
          subtext="Total manual income recorded"
        />
        <SummaryCard
          title="Total Expenses"
          amount={totalExpenses}
          currency={currency}
          type="expense"
          icon={TrendingDown}
          subtext="Total manual expenses recorded"
        />
        <SummaryCard
          title="Current Balance"
          amount={currentBalance}
          currency={currency}
          type="balance"
          icon={Wallet}
          subtext="Total Income − Total Expenses"
        />
        <SummaryCard
          title="Total Savings"
          amount={totalSavings}
          currency={currency}
          type="savings"
          icon={PiggyBank}
          subtext="Net accumulated financial savings"
        />
      </div>

      {/* Current Month Overview & Budget Status Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          marginBottom: '24px',
        }}
      >
        {/* Current Month Snapshot Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                <span>{getMonthName(currentMonthStr)} Overview</span>
              </h3>
              <p className="card-subtitle">Activity for the ongoing calendar month</p>
            </div>
            <span className="badge badge-category">{currentMonthStr}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              padding: '16px',
              background: 'var(--bg-surface-hover)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                MONTH INCOME
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-income)', marginTop: '4px' }}>
                {formatCurrency(currentMonthStats.totalIncome, currency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentMonthStats.incomeCount} entries
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                MONTH SPENT
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-expense)', marginTop: '4px' }}>
                {formatCurrency(currentMonthStats.totalExpenses, currency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentMonthStats.expenseCount} entries
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                NET SURPLUS
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: currentMonthStats.netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                  marginTop: '4px',
                }}
              >
                {formatCurrency(currentMonthStats.netBalance, currency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentMonthStats.netBalance >= 0 ? 'Savings' : 'Deficit'}
              </div>
            </div>
          </div>
        </div>

        {/* Current Month Budget Status Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PiggyBank size={18} style={{ color: 'var(--color-warning)' }} />
                <span>Monthly Budget Status</span>
              </h3>
              <p className="card-subtitle">Spending limits for {getMonthName(currentMonthStr)}</p>
            </div>
            <Link to="/budgets" className="btn btn-secondary btn-sm">
              Manage Budget
            </Link>
          </div>

          {currentMonthOverallBudget ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Spent: <strong>{formatCurrency(currentMonthBudgetSpent, currency)}</strong> of{' '}
                  <strong>{formatCurrency(currentMonthBudgetLimit, currency)}</strong>
                </span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color:
                      currentMonthBudgetPercent >= 100
                        ? 'var(--color-expense)'
                        : currentMonthBudgetPercent >= 75
                        ? 'var(--color-warning)'
                        : 'var(--color-income)',
                  }}
                >
                  {currentMonthBudgetPercent.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar-container">
                <div
                  className={`progress-bar-fill ${
                    currentMonthBudgetPercent >= 100
                      ? 'progress-danger'
                      : currentMonthBudgetPercent >= 75
                      ? 'progress-warning'
                      : 'progress-safe'
                  }`}
                  style={{ width: `${Math.min(currentMonthBudgetPercent, 100)}%` }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginTop: '6px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  Remaining Budget:{' '}
                  <strong
                    style={{
                      color:
                        currentMonthBudgetRemaining >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                    }}
                  >
                    {formatCurrency(currentMonthBudgetRemaining, currency)}
                  </strong>
                </span>
                {currentMonthBudgetRemaining < 0 && (
                  <span style={{ color: 'var(--color-expense)', fontWeight: 600 }}>
                    Exceeded by {formatCurrency(Math.abs(currentMonthBudgetRemaining), currency)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '20px',
                background: 'var(--bg-surface-hover)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                No overall monthly spending budget has been set for {getMonthName(currentMonthStr)}.
              </p>
              <Link to="/budgets" className="btn btn-secondary btn-sm">
                <PlusCircle size={15} />
                <span>Set Budget for this Month</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Recent Transactions</span>
            </h3>
            <p className="card-subtitle">Your latest financial activity</p>
          </div>
          {transactions.length > 0 && (
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              <span>View All Transactions ({transactions.length})</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recentTransactions.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {formatDate(txn.date)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <div>{txn.title}</div>
                      {txn.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {txn.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-category">{txn.category}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          txn.type === 'income' ? 'badge-income' : 'badge-expense'
                        }`}
                      >
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        color:
                          txn.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                      }}
                    >
                      {txn.type === 'income' ? '+' : '-'}
                      {formatCurrency(txn.amount, currency)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => setEditingTxn(txn)}
                          className="btn-icon"
                          title="Edit transaction"
                          aria-label="Edit transaction"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingTxn(txn)}
                          className="btn-icon delete"
                          title="Delete transaction"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            description="Add your first manual transaction to get started tracking your income and expenses."
            action={
              <Link to="/add-transaction" className="btn btn-primary btn-sm">
                <PlusCircle size={16} />
                <span>Record First Transaction</span>
              </Link>
            }
          />
        )}
      </div>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={!!editingTxn}
        transaction={editingTxn}
        onClose={() => setEditingTxn(null)}
        onSubmit={editTxn}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTxn}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTxn?.title}" (${formatCurrency(
          deletingTxn?.amount || 0,
          currency
        )})? This action cannot be undone.`}
        confirmText="Delete Transaction"
        onConfirm={() => {
          if (deletingTxn) {
            removeTxn(deletingTxn.id);
            setDeletingTxn(null);
          }
        }}
        onCancel={() => setDeletingTxn(null)}
      />
    </div>
  );
};
