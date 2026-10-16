import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { EmptyState } from '../components/EmptyState';
import {
  formatCurrency,
  getCurrentMonthString,
  getMonthName,
} from '../utils/formatters';
import { exportReportSummaryToCsv } from '../utils/exportCsv';
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Award,
  Layers,
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const Reports = () => {
  const { transactions, currency, getMonthlySummary } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  // Available unique months from all transactions
  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });
    // Ensure selectedMonth is included
    set.add(selectedMonth);
    return Array.from(set).sort().reverse();
  }, [transactions, selectedMonth]);

  // Monthly summary metrics for selected month
  const reportData = useMemo(() => {
    return getMonthlySummary(selectedMonth);
  }, [getMonthlySummary, selectedMonth]);

  // Multi-month summary breakdown (table of all past months)
  const monthlyHistory = useMemo(() => {
    const monthsMap = {};
    transactions.forEach((t) => {
      const m = (t.date || '').substring(0, 7);
      if (!m) return;
      if (!monthsMap[m]) {
        monthsMap[m] = { month: m, income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        monthsMap[m].income += Number(t.amount) || 0;
      } else if (t.type === 'expense') {
        monthsMap[m].expense += Number(t.amount) || 0;
      }
      monthsMap[m].count += 1;
    });

    return Object.values(monthsMap)
      .map((item) => ({
        ...item,
        net: item.income - item.expense,
        savingsRate: item.income > 0 ? ((item.income - item.expense) / item.income) * 100 : 0,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);

  // Export CSV handler
  const handleExportCsv = () => {
    exportReportSummaryToCsv({
      periodLabel: getMonthName(selectedMonth),
      totalIncome: reportData.totalIncome,
      totalExpense: reportData.totalExpenses,
      netBalance: reportData.netBalance,
      currencySymbol: currency === 'INR' ? '₹' : currency,
      categoryExpenses: reportData.categoryExpenses,
      transactions: reportData.transactions,
    });
  };

  const hasData = reportData.transactions.length > 0;

  return (
    <div>
      {/* Header */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Financial Reports & Summaries</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Numerical analysis and tabular breakdowns for {getMonthName(selectedMonth)}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)} ({m})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            disabled={!hasData}
            title="Download CSV report of this period"
          >
            <Download size={16} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Selected Month Key Metrics Grid (Numerical Only) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Income */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-income)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              PERIOD INCOME
            </span>
            <TrendingUp size={18} style={{ color: 'var(--color-income)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {formatCurrency(reportData.totalIncome, currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {reportData.incomeCount} income records
          </div>
        </div>

        {/* Total Expense */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-expense)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              PERIOD EXPENSES
            </span>
            <TrendingDown size={18} style={{ color: 'var(--color-expense)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {formatCurrency(reportData.totalExpenses, currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {reportData.expenseCount} expense records
          </div>
        </div>

        {/* Net Balance */}
        <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              NET BALANCE
            </span>
            <Wallet size={18} style={{ color: '#6366f1' }} />
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginTop: '8px',
              color: reportData.netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}
          >
            {formatCurrency(reportData.netBalance, currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {reportData.netBalance >= 0 ? 'Surplus / Savings' : 'Net Deficit'}
          </div>
        </div>

        {/* Highest Expense Transaction */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              HIGHEST EXPENSE
            </span>
            <Award size={18} style={{ color: 'var(--color-warning)' }} />
          </div>
          {reportData.highestExpense ? (
            <>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '8px', color: 'var(--color-expense)' }}>
                {formatCurrency(reportData.highestExpense.amount, currency)}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {reportData.highestExpense.title} ({reportData.highestExpense.category})
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-muted)' }}>
                {formatCurrency(0, currency)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                No expenses in this month
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tables Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Category-wise Expense Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ArrowDownRight size={18} style={{ color: 'var(--color-expense)' }} />
                <span>Category-wise Expense Summary</span>
              </h3>
              <p className="card-subtitle">Spending distribution across categories for {getMonthName(selectedMonth)}</p>
            </div>
          </div>

          {reportData.categoryExpenses.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Transactions</th>
                    <th style={{ textAlign: 'right' }}>Total Spent</th>
                    <th style={{ textAlign: 'right' }}>Share of Total Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categoryExpenses.map((item) => (
                    <tr key={item.category}>
                      <td style={{ fontWeight: 600 }}>
                        <span className="badge badge-category">{item.category}</span>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {item.count}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-expense)' }}>
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ background: 'var(--bg-surface-hover)', fontWeight: 800 }}>
                    <td>Total Expenses</td>
                    <td style={{ textAlign: 'center' }}>{reportData.expenseCount}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-expense)' }}>
                      {formatCurrency(reportData.totalExpenses, currency)}
                    </td>
                    <td style={{ textAlign: 'right' }}>100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No expenses recorded for this month"
              description={`Zero expense transactions found for ${getMonthName(selectedMonth)}.`}
            />
          )}
        </div>

        {/* Category-wise Income Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ArrowUpRight size={18} style={{ color: 'var(--color-income)' }} />
                <span>Category-wise Income Summary</span>
              </h3>
              <p className="card-subtitle">Earnings distribution across income sources for {getMonthName(selectedMonth)}</p>
            </div>
          </div>

          {reportData.categoryIncomes.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source / Category</th>
                    <th style={{ textAlign: 'center' }}>Transactions</th>
                    <th style={{ textAlign: 'right' }}>Total Earned</th>
                    <th style={{ textAlign: 'right' }}>Share of Total Income</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categoryIncomes.map((item) => (
                    <tr key={item.category}>
                      <td style={{ fontWeight: 600 }}>
                        <span className="badge badge-income">{item.category}</span>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {item.count}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-income)' }}>
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ background: 'var(--bg-surface-hover)', fontWeight: 800 }}>
                    <td>Total Income</td>
                    <td style={{ textAlign: 'center' }}>{reportData.incomeCount}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-income)' }}>
                      {formatCurrency(reportData.totalIncome, currency)}
                    </td>
                    <td style={{ textAlign: 'right' }}>100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No income recorded for this month"
              description={`Zero income transactions found for ${getMonthName(selectedMonth)}.`}
            />
          )}
        </div>

        {/* Monthly Income and Expense Summary Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Layers size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Monthly Income & Expense Summary (All Months)</span>
              </h3>
              <p className="card-subtitle">Complete historical breakdown calculated from all manual records</p>
            </div>
          </div>

          {monthlyHistory.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th style={{ textAlign: 'center' }}>Total Records</th>
                    <th style={{ textAlign: 'right' }}>Income</th>
                    <th style={{ textAlign: 'right' }}>Expense</th>
                    <th style={{ textAlign: 'right' }}>Net Balance</th>
                    <th style={{ textAlign: 'right' }}>Savings Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyHistory.map((item) => (
                    <tr key={item.month}>
                      <td style={{ fontWeight: 600 }}>
                        {getMonthName(item.month)} ({item.month})
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {item.count}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-income)', fontWeight: 700 }}>
                        {formatCurrency(item.income, currency)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-expense)', fontWeight: 700 }}>
                        {formatCurrency(item.expense, currency)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          color: item.net >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                        }}
                      >
                        {formatCurrency(item.net, currency)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color: item.savingsRate >= 0 ? 'var(--text-primary)' : 'var(--color-expense)',
                        }}
                      >
                        {item.savingsRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No historical transactions"
              description="Record income and expenses to see your month-over-month comparative tabular reports."
            />
          )}
        </div>
      </div>
    </div>
  );
};
