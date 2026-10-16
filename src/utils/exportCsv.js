/**
 * DailySpend - CSV Export Utility
 * Generates and triggers browser download of CSV reports from real user data.
 */

export const exportTransactionsToCsv = (transactions, currencySymbol = '₹', filename = 'DailySpend_Transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Title', `Amount (${currencySymbol})`, 'Notes'];
  
  const csvRows = [
    headers.join(','),
    ...transactions.map((t) => {
      const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
      return [
        escape(t.id),
        escape(t.date),
        escape(t.type ? t.type.toUpperCase() : ''),
        escape(t.category),
        escape(t.title),
        Number(t.amount || 0).toFixed(2),
        escape(t.notes || ''),
      ].join(',');
    }),
  ];

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportReportSummaryToCsv = ({
  periodLabel,
  totalIncome,
  totalExpense,
  netBalance,
  currencySymbol = '₹',
  categoryExpenses = [],
  transactions = [],
}) => {
  const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

  const lines = [
    `DailySpend Financial Report - ${periodLabel}`,
    `Generated on: ${new Date().toLocaleString()}`,
    '',
    'EXECUTIVE SUMMARY',
    `Metric,Amount (${currencySymbol})`,
    `Total Income,${totalIncome.toFixed(2)}`,
    `Total Expenses,${totalExpense.toFixed(2)}`,
    `Net Balance,${netBalance.toFixed(2)}`,
    '',
    'CATEGORY-WISE EXPENSE BREAKDOWN',
    `Category,Total Spent (${currencySymbol}),% of Expenses,Transaction Count`,
    ...categoryExpenses.map((c) =>
      [
        escape(c.category),
        c.amount.toFixed(2),
        `${c.percentage.toFixed(1)}%`,
        c.count,
      ].join(',')
    ),
    '',
    'TRANSACTION DETAILS',
    `Date,Type,Category,Title,Amount (${currencySymbol}),Notes`,
    ...transactions.map((t) =>
      [
        escape(t.date),
        escape(t.type.toUpperCase()),
        escape(t.category),
        escape(t.title),
        Number(t.amount).toFixed(2),
        escape(t.notes || ''),
      ].join(',')
    ),
  ];

  const csvString = lines.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DailySpend_Report_${periodLabel.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
