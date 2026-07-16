'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, ChevronDown } from 'lucide-react';
import { StatusBadge, FilterBar, DataTable, EmptyState } from './components/DesignComponents';
import { generateMockPayments, formatCurrency, formatDate } from './utils/dataUtils';

export default function PaymentList({ state, onSelectPayment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    status: 'All',
    dateRange: 'All',
    amount: 'All',
  });
  const [sortBy, setSortBy] = useState('date-desc');

  const payments = useMemo(() => generateMockPayments(state), [state]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.utrNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (activeFilters.status !== 'All') {
      filtered = filtered.filter(p => p.status === activeFilters.status);
    }

    // Date range filter
    if (activeFilters.dateRange !== 'All') {
      const now = new Date();
      filtered = filtered.filter(p => {
        const payDate = new Date(p.paymentDate);
        const diff = Math.floor((now - payDate) / (1000 * 60 * 60 * 24));

        if (activeFilters.dateRange === 'Last 7 days') return diff <= 7;
        if (activeFilters.dateRange === 'Last 30 days') return diff <= 30;
        if (activeFilters.dateRange === 'Last 90 days') return diff <= 90;
        return true;
      });
    }

    // Amount range filter
    if (activeFilters.amount !== 'All') {
      filtered = filtered.filter(p => {
        if (activeFilters.amount === 'Below 100K') return p.netAmount < 100000;
        if (activeFilters.amount === '100K - 500K') return p.netAmount >= 100000 && p.netAmount <= 500000;
        if (activeFilters.amount === 'Above 500K') return p.netAmount > 500000;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.paymentDate) - new Date(a.paymentDate);
      if (sortBy === 'date-asc') return new Date(a.paymentDate) - new Date(b.paymentDate);
      if (sortBy === 'amount-desc') return b.netAmount - a.netAmount;
      if (sortBy === 'amount-asc') return a.netAmount - b.netAmount;
      return 0;
    });

    return filtered;
  }, [payments, searchTerm, activeFilters, sortBy]);

  const filters = [
    {
      id: 'status',
      label: 'Status',
      value: activeFilters.status,
      options: ['All', 'Cleared', 'Processing', 'Pending', 'Overdue'],
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      value: activeFilters.dateRange,
      options: ['All', 'Last 7 days', 'Last 30 days', 'Last 90 days'],
    },
    {
      id: 'amount',
      label: 'Amount Range',
      value: activeFilters.amount,
      options: ['All', 'Below 100K', '100K - 500K', 'Above 500K'],
    },
  ];

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const columns = [
    {
      key: 'paymentNumber',
      label: 'Payment Number',
      render: (val) => <span className="font-mono font-bold">{val}</span>,
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (val) => <span className="font-mono">{val}</span>,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'netAmount',
      label: 'Net Amount',
      render: (val) => <span className="font-mono font-semibold">{formatCurrency(val)}</span>,
    },
    {
      key: 'utrNumber',
      label: 'UTR Number',
      render: (val) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
  ];

  const actions = [
    {
      id: 'view',
      label: 'View',
      color: '#3b82f6',
      handler: (row) => onSelectPayment(row),
    },
    {
      id: 'download',
      label: 'Download',
      color: '#10b981',
      handler: (row) => console.log('Download', row),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Payment List</h2>
        <p className="text-sm text-text-tertiary mt-1">
          View and manage all your payments with advanced filtering
        </p>
      </div>

      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by payment, invoice, or UTR number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm font-medium"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          <button className="px-3 h-8 rounded-none border border-border bg-surface text-text-primary hover:bg-surface2 transition-colors duration-150 flex items-center gap-2 text-xs font-medium cursor-pointer">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
            <Filter className="size-4" />
            Filters:
          </div>
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <div key={filter.id}>
                <select
                  value={filter.value}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="!py-1.5 text-xs font-medium"
                >
                  {filter.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {filter.label}: {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {Object.values(activeFilters).some(v => v !== 'All') && (
            <button
              onClick={() => setActiveFilters({ status: 'All', dateRange: 'All', amount: 'All' })}
              className="text-xs font-semibold text-destructive hover:text-rose-400 transition-colors duration-150"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="text-sm text-text-secondary">
        Showing <span className="font-bold text-text-primary tabular-nums">{filteredPayments.length}</span> of{' '}
        <span className="font-bold text-text-primary tabular-nums">{payments.length}</span> payments
      </div>

      {/* DATA TABLE */}
      {filteredPayments.length > 0 ? (
        <DataTable columns={columns} data={filteredPayments} actions={actions} />
      ) : (
        <EmptyState
          icon={Search}
          title="No payments found"
          description="Try adjusting your search or filters to find the payments you're looking for"
        />
      )}
    </div>
  );
}
