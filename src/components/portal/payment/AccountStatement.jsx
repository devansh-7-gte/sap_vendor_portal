'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, FileText, Calendar } from 'lucide-react';
import { DataTable, EmptyState } from './components/DesignComponents';
import { generateMockAccountStatement, formatDate, formatCurrency } from './utils/dataUtils';

export default function AccountStatement({ state }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [docType, setDocType] = useState('All');

  const statements = useMemo(() => generateMockAccountStatement(state), [state]);

  // Calculate statement summary
  const summary = useMemo(() => {
    let openingBalance = 500000;
    let credits = 0;
    let debits = 0;

    statements.forEach(stmt => {
      debits += stmt.debit;
      credits += stmt.credit;
    });

    const closingBalance = openingBalance + credits - debits;

    return {
      openingBalance,
      credits,
      debits,
      closingBalance,
    };
  }, [statements]);

  // Filter statements
  const filteredStatements = useMemo(() => {
    let filtered = statements;

    if (searchTerm) {
      filtered = filtered.filter(
        stmt =>
          stmt.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stmt.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (docType !== 'All') {
      filtered = filtered.filter(stmt => stmt.documentType === docType);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(stmt => {
        const stmtDate = new Date(stmt.postingDate);
        const diff = Math.floor((now - stmtDate) / (1000 * 60 * 60 * 24));

        if (dateRange === '7') return diff <= 7;
        if (dateRange === '30') return diff <= 30;
        if (dateRange === '90') return diff <= 90;
        return true;
      });
    }

    return filtered;
  }, [statements, searchTerm, docType, dateRange]);

  const docTypes = ['All', 'Invoice', 'Payment', 'Credit Memo', 'Debit Memo', 'Journal Entry'];

  const columns = [
    {
      key: 'postingDate',
      label: 'Posting Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'documentNumber',
      label: 'Document Number',
      render: (val) => <span className="font-mono font-bold text-xs">{val}</span>,
    },
    {
      key: 'documentType',
      label: 'Document Type',
      render: (val) => <span className="text-xs font-semibold">{val}</span>,
    },
    {
      key: 'debit',
      label: 'Debit',
      render: (val) => <span className="font-mono font-bold text-red-600 dark:text-red-400">{val > 0 ? formatCurrency(val) : '-'}</span>,
    },
    {
      key: 'credit',
      label: 'Credit',
      render: (val) => <span className="font-mono font-bold text-green-600 dark:text-green-400">{val > 0 ? formatCurrency(val) : '-'}</span>,
    },
    {
      key: 'balance',
      label: 'Running Balance',
      render: (val) => <span className="font-mono font-bold">{formatCurrency(val)}</span>,
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (val) => <span className="text-xs font-mono text-stone-500">{val}</span>,
    },
  ];

  const actions = [
    {
      id: 'view',
      label: 'View',
      color: '#3b82f6',
      handler: (row) => console.log('View', row),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Account Statement (FBL1N)</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Complete vendor ledger and account statement view
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50">
          <p className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold">Opening Balance</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white font-mono mt-2">{formatCurrency(summary.openingBalance)}</p>
        </div>

        <div className="p-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold">Credits</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 font-mono mt-2">{formatCurrency(summary.credits)}</p>
        </div>

        <div className="p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400 uppercase font-bold">Debits</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 font-mono mt-2">{formatCurrency(summary.debits)}</p>
        </div>

        <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Closing Balance</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono mt-2">{formatCurrency(summary.closingBalance)}</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 dark:text-stone-600" />
          <input
            type="text"
            placeholder="Search document or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-medium outline-none"
          >
            {docTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-medium outline-none"
          >
            <option value="all">All Dates</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <button className="px-3 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center gap-2 text-xs font-medium cursor-pointer">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">Export as:</span>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-colors">
            PDF
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-colors">
            Excel
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-colors">
            CSV
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-colors">
            Print
          </button>
        </div>
      </div>

      {/* STATEMENT TABLE */}
      {filteredStatements.length > 0 ? (
        <DataTable columns={columns} data={filteredStatements} actions={actions} />
      ) : (
        <EmptyState
          icon={Search}
          title="No transactions found"
          description="No account transactions match your search criteria"
        />
      )}
    </div>
  );
}
