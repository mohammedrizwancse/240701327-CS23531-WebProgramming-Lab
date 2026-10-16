import React, { useEffect } from 'react';
import { TransactionForm } from './TransactionForm';
import { X, Edit3 } from 'lucide-react';

export const TransactionModal = ({
  isOpen,
  transaction,
  onClose,
  onSubmit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-modal-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 id="txn-modal-title" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Edit Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ border: 'none', background: 'transparent' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <TransactionForm
            initialData={transaction}
            onSubmit={(updated) => {
              onSubmit(transaction.id, updated);
              onClose();
            }}
            onCancel={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};
