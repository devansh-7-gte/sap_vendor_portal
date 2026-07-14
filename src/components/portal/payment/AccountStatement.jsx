'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, FileText, Calendar } from 'lucide-react';
import { DataTable, EmptyState } from './components/DesignComponents';
import { generateMockAccountStatement, formatDate, formatCurrency } from './utils/dataUtils';
import KPICard from '@/components/ui/KPICard';

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
        <h2 className="text-[22px] font-bold text-text-primary">Account Statement (FBL1N)</h2>
        <p className="text-sm text-text-tertiary mt-1">
          Complete vendor ledger and account statement view
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard label="Opening Balance" value={<span className="tabular-nums">{formatCurrency(summary.openingBalance)}</span>} />
        <KPICard label="Credits" value={<span className="tabular-nums text-emerald-text">{formatCurrency(summary.credits)}</span>} />
        <KPICard label="Debits" value={<span className="tabular-nums text-destructive">{formatCurrency(summary.debits)}</span>} />
        <KPICard label="Closing Balance" value={<span className="tabular-nums">{formatCurrency(summary.closingBalance)}</span>} />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search document or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="text-sm font-medium"
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
            className="text-sm font-medium"
          >
            <option value="all">All Dates</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <button className="px-3 h-8 rounded-md border border-border bg-surface text-text-primary hover:bg-surface2 transition-colors duration-150 flex items-center gap-2 text-xs font-medium cursor-pointer">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-text-secondary">Export as:</span>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-surface2 transition-colors duration-150">
            PDF
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-surface2 transition-colors duration-150">
            Excel
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-surface2 transition-colors duration-150">
            CSV
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-surface2 transition-colors duration-150">
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
