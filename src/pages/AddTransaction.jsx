import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { TransactionForm } from '../components/TransactionForm';
import { Info, Receipt } from 'lucide-react';

export const AddTransaction = () => {
  const { addTxn } = useFinance();
  const navigate = useNavigate();

  const handleAddTransaction = (data) => {
    addTxn(data);
    navigate('/transactions');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Record New Transaction</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Enter your manual income or expense details below
          </p>
        </div>

        <Link to="/transactions" className="btn btn-secondary btn-sm">
          <Receipt size={16} />
          <span>View All Transactions</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="card">
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => navigate(-1)}
        />
      </div>

      {/* Helpful Guidelines Card */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: 'var(--color-info-bg)',
          border: '1px solid var(--color-info-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Info size={20} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
            Manual Expense Tracking Tip
          </strong>
          Assigning accurate categories (such as Food, Travel, or Bills) helps DailySpend automatically compute your category-wise spending limits on the Monthly Budget and Reports pages.
        </div>
      </div>
    </div>
  );
};
