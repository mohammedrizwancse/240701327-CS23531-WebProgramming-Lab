import React from 'react';
import { formatCurrency } from '../utils/formatters';

export const SummaryCard = ({
  title,
  amount,
  currency = 'INR',
  type = 'balance', // 'income' | 'expense' | 'balance' | 'savings'
  icon: Icon,
  subtext,
}) => {
  return (
    <div className={`card summary-card ${type}`}>
      <div className="summary-card-top">
        <span className="summary-card-title">{title}</span>
        {Icon && (
          <div className="summary-card-icon">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="summary-card-value">
        {formatCurrency(amount, currency)}
      </div>
      {subtext && <div className="summary-card-subtext">{subtext}</div>}
    </div>
  );
};
