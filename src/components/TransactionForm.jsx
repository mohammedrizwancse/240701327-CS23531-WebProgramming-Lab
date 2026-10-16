import React, { useState, useEffect } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, getTodayString } from '../utils/formatters';
import { ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';

export const TransactionForm = ({
  initialData = null,
  onSubmit,
  onCancel = null,
  isModal = false,
}) => {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setTitle(initialData.title || '');
      setAmount(initialData.amount !== undefined ? String(initialData.amount) : '');
      setCategory(initialData.category || (initialData.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]));
      setDate(initialData.date || getTodayString());
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  // Handle type switch to adjust default category if needed
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      if (!INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    } else {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title / description is required.';
    } else if (title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters long.';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      errs.amount = 'Please enter a valid amount.';
    } else if (numAmount <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }

    if (!category) {
      errs.category = 'Please select a category.';
    }

    if (!date) {
      errs.date = 'Please select a transaction date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      notes: notes.trim(),
    });

    if (!initialData) {
      // Reset form if creating new transaction
      setTitle('');
      setAmount('');
      setNotes('');
      setDate(getTodayString());
      setErrors({});
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Type Toggle Buttons */}
      <div className="type-toggle-group">
        <button
          type="button"
          className={`type-toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
          onClick={() => handleTypeChange('expense')}
        >
          <ArrowDownRight size={18} />
          Expense
        </button>
        <button
          type="button"
          className={`type-toggle-btn income ${type === 'income' ? 'active' : ''}`}
          onClick={() => handleTypeChange('income')}
        >
          <ArrowUpRight size={18} />
          Income
        </button>
      </div>

      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="txn-title">
          Description / Title <span style={{ color: 'var(--color-expense)' }}>*</span>
        </label>
        <input
          id="txn-title"
          type="text"
          className={`form-input ${errors.title ? 'error' : ''}`}
          placeholder={type === 'expense' ? 'e.g., Grocery shopping, Metro pass' : 'e.g., Monthly salary, Freelance design'}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
        />
        {errors.title && <span className="form-error-msg">{errors.title}</span>}
      </div>

      {/* Amount and Category */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="txn-amount">
            Amount <span style={{ color: 'var(--color-expense)' }}>*</span>
          </label>
          <input
            id="txn-amount"
            type="number"
            step="any"
            min="0.01"
            className={`form-input ${errors.amount ? 'error' : ''}`}
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
            }}
          />
          {errors.amount && <span className="form-error-msg">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="txn-category">
            Category <span style={{ color: 'var(--color-expense)' }}>*</span>
          </label>
          <select
            id="txn-category"
            className={`form-select ${errors.category ? 'error' : ''}`}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <span className="form-error-msg">{errors.category}</span>}
        </div>
      </div>

      {/* Date */}
      <div className="form-group">
        <label className="form-label" htmlFor="txn-date">
          Transaction Date <span style={{ color: 'var(--color-expense)' }}>*</span>
        </label>
        <input
          id="txn-date"
          type="date"
          className={`form-input ${errors.date ? 'error' : ''}`}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
          }}
        />
        {errors.date && <span className="form-error-msg">{errors.date}</span>}
      </div>

      {/* Optional Notes */}
      <div className="form-group">
        <label className="form-label" htmlFor="txn-notes">
          Notes (Optional)
        </label>
        <textarea
          id="txn-notes"
          rows={3}
          className="form-textarea"
          placeholder="Add any extra details or reference numbers..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: isModal ? 'flex-end' : 'flex-start', marginTop: '24px' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
          <Check size={18} />
          {initialData ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};
