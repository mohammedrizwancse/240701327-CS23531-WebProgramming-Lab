import React from 'react';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { AlertTriangle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export const BudgetCard = ({
  budget,
  spent = 0,
  currency = 'INR',
  onEdit,
  onDelete,
}) => {
  const budgetAmount = Number(budget.amount) || 0;
  const spentAmount = Number(spent) || 0;
  const remaining = budgetAmount - spentAmount;
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

  // Determine status and styling
  let statusClass = 'progress-safe';
  let isWarning = false;
  let isExceeded = false;

  if (percentage >= 100) {
    statusClass = 'progress-danger';
    isExceeded = true;
  } else if (percentage >= 75) {
    statusClass = 'progress-warning';
    isWarning = true;
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={`badge ${budget.category === 'Overall' ? 'badge-category' : 'badge-expense'}`}
              style={{ fontWeight: 700 }}
            >
              {budget.category} Budget
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {getMonthName(budget.month)}
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>
            {formatCurrency(budgetAmount, currency)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onEdit(budget)}
            className="btn-icon"
            title="Edit budget"
            aria-label="Edit budget"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="btn-icon delete"
            title="Delete budget"
            aria-label="Delete budget"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
          <span>Utilization</span>
          <span style={{ color: isExceeded ? 'var(--color-expense)' : isWarning ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className={`progress-bar-fill ${statusClass}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '10px 12px',
          background: 'var(--bg-surface-hover)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.86rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Spent</div>
          <div style={{ fontWeight: 700, color: 'var(--color-expense)' }}>
            {formatCurrency(spentAmount, currency)}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Remaining</div>
          <div
            style={{
              fontWeight: 700,
              color: remaining >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}
          >
            {formatCurrency(remaining, currency)}
          </div>
        </div>
      </div>

      {/* Warning Banners */}
      {isExceeded && (
        <div className="alert-box alert-danger" style={{ margin: 0, padding: '8px 12px', fontSize: '0.82rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Budget Exceeded!</strong> You have overspent by {formatCurrency(Math.abs(remaining), currency)}.
          </span>
        </div>
      )}
      {!isExceeded && isWarning && (
        <div className="alert-box alert-warning" style={{ margin: 0, padding: '8px 12px', fontSize: '0.82rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Budget Alert:</strong> You have utilized {percentage.toFixed(0)}% of your limit.
          </span>
        </div>
      )}
      {!isExceeded && !isWarning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-income)' }}>
          <CheckCircle2 size={14} />
          <span>Within planned budget limits</span>
        </div>
      )}
    </div>
  );
};
