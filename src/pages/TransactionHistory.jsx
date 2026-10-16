import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { TransactionModal } from '../components/TransactionModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EmptyState } from '../components/EmptyState';
import {
  formatCurrency,
  formatDate,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../utils/formatters';
import { exportTransactionsToCsv } from '../utils/exportCsv';
import {
  PlusCircle,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  RotateCcw,
  Inbox,
  ArrowUpDown,
  Tag,
  Calendar,
} from 'lucide-react';

export const TransactionHistory = () => {
  const { transactions, currency, editTxn, removeTxn } = useFinance();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Modal states
  const [editingTxn, setEditingTxn] = useState(null);
  const [deletingTxn, setDeletingTxn] = useState(null);

  // Available unique months from all transactions
  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Combined categories for the filter
  const allCategories = useMemo(() => {
    return Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])).sort();
  }, []);

  // Filtered & sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Search filter (title or notes)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = txn.title.toLowerCase().includes(term);
        const matchesNotes = txn.notes && txn.notes.toLowerCase().includes(term);
        if (!matchesTitle && !matchesNotes) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && txn.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && txn.category !== categoryFilter) {
        return false;
      }

      // Month filter
      if (monthFilter !== 'all' && !(txn.date || '').startsWith(monthFilter)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'highest') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === 'lowest') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, monthFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setMonthFilter('all');
    setSortBy('newest');
  };

  const isFiltering =
    searchTerm !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    monthFilter !== 'all' ||
    sortBy !== 'newest';

  // Export filtered transactions to CSV
  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, currency === 'INR' ? '₹' : currency);
  };

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
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Transaction History</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Showing {filteredTransactions.length} of {transactions.length} recorded transactions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            disabled={filteredTransactions.length === 0}
            title="Export filtered records to CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <Link to="/add-transaction" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '18px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'flex-end',
          }}
        >
          {/* Search input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Search size={14} /> Search
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Type
              </span>
            </label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={14} /> Category
              </span>
            </label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Month
              </span>
            </label>
            <select
              className="form-select"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpDown size={14} /> Sort By
              </span>
            </label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltering && (
            <div>
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px' }}
                title="Reset all filters"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="card">
        {filteredTransactions.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {formatDate(txn.date)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{txn.title}</div>
                      {txn.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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
            title={transactions.length === 0 ? 'No transactions yet' : 'No transactions match filters'}
            description={
              transactions.length === 0
                ? 'Start managing your finances by recording your first transaction.'
                : 'Try adjusting your search criteria, category selection, or month filters.'
            }
            action={
              transactions.length === 0 ? (
                <Link to="/add-transaction" className="btn btn-primary btn-sm">
                  <PlusCircle size={16} />
                  <span>Add First Transaction</span>
                </Link>
              ) : (
                <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
                  <RotateCcw size={14} />
                  <span>Clear All Filters</span>
                </button>
              )
            }
          />
        )}
      </div>

      {/* Edit Modal */}
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
