import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useFinance();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--color-income)';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--color-expense)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--color-primary)';
        }

        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn-icon"
              style={{ padding: '2px', border: 'none', background: 'transparent' }}
              title="Close"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
