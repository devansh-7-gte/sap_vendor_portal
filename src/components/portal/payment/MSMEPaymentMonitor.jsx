'use client';

import React, { useState, useMemo } from 'react';
import { AlertCircle, TrendingDown, Calendar, DollarSign, Search, Filter } from 'lucide-react';
import { AlertBanner, DataTable, EmptyState, KPICard, StatusBadge } from './components/DesignComponents';
import { generateMockMSMEPayments, formatDate, formatCurrency } from './utils/dataUtils';

export default function MSMEPaymentMonitor({ state }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('All');

  const msmePayments = useMemo(() => generateMockMSMEPayments(state), [state]);

  // Calculate compliance metrics
  const metrics = useMemo(() => {
    const invoices = msmePayments.length;
    const overdue = msmePayments.filter(p => p.status === 'Overdue').length;
    const avgDelay = Math.round(msmePayments.reduce((sum, p) => sum + p.delayDays, 0) / invoices);

    let complianceScore = 100;
    complianceScore -= overdue * 10;
    complianceScore -= Math.min(avgDelay / 10, 20);
    complianceScore = Math.max(complianceScore, 0);

    const totalOutstanding = msmePayments.reduce((sum, p) => sum + p.outstandingAmount, 0);

    return {
      invoices,
      overdue,
      avgDelay,
      complianceScore,
      totalOutstanding,
    };
  }, [msmePayments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = msmePayments;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBucket !== 'All') {
      filtered = filtered.filter(p => p.agingBucket === selectedBucket);
    }

    return filtered;
  }, [msmePayments, searchTerm, selectedBucket]);

  // Aging buckets
  const agingBuckets = [
    { id: '0-15', label: '0-15 Days', color: 'green' },
    { id: '15-30', label: '15-30 Days', color: 'yellow' },
    { id: '30-45', label: '30-45 Days', color: 'orange' },
    { id: '45+', label: '45+ Days', color: 'red' },
  ];

  const bucketCounts = agingBuckets.map(bucket => {
    const count = msmePayments.filter(p => {
      if (bucket.id === '0-15') return p.delayDays <= 15;
      if (bucket.id === '15-30') return p.delayDays > 15 && p.delayDays <= 30;
      if (bucket.id === '30-45') return p.delayDays > 30 && p.delayDays <= 45;
      if (bucket.id === '45+') return p.delayDays > 45;
      return false;
    });
    return { ...bucket, count };
  });

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'Green') return 'from-emerald-500 to-emerald-600';
    if (riskLevel === 'Amber') return 'from-yellow-500 to-yellow-600';
    return 'from-rose-500 to-rose-600';
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice Number',
      render: (val) => <span className="font-mono font-bold text-xs tabular-nums">{val}</span>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => <span className="tabular-nums">{formatDate(val)}</span>,
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding Amount',
      render: (val) => <span className="font-mono font-bold tabular-nums">{formatCurrency(val)}</span>,
    },
    {
      key: 'delayDays',
      label: 'Delay Days',
      render: (val) => <span className="font-bold tabular-nums">{val} days</span>,
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      render: (val) => {
        const variants = {
          Green: 'active',
          Amber: 'warn',
          Red: 'suspended',
        };
        return <span className={`status-badge status-badge-${variants[val] || 'pending'}`}>{val}</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val === 'On Time' ? 'Cleared' : 'Overdue'} size="sm" />,
    },
  ];

  const actions = [
    {
      id: 'escalate',
      label: 'Escalate',
      color: '#ef4444',
      handler: (row) => console.log('Escalate', row),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">MSME Payment Compliance Monitor</h2>
        <p className="text-xs font-semibold text-text-tertiary mt-1">
          Track compliance with MSME payment regulations and identify delayed payments
        </p>
      </div>

      {/* COMPLIANCE ALERT */}
      {metrics.complianceScore < 80 && (
        <AlertBanner
          type={metrics.complianceScore < 60 ? 'error' : 'warning'}
          title={metrics.complianceScore < 60 ? 'MSME Compliance Risk: Critical' : 'MSME Compliance Risk: Warning'}
          message={
            metrics.complianceScore < 60
              ? 'Multiple invoices are overdue. Immediate action required to maintain compliance with MSME payment regulations.'
              : 'Some invoices are approaching overdue status. Review payment schedules to avoid compliance issues.'
          }
          action="Escalate"
        />
      )}

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Invoices Due"
          value={metrics.invoices}
          unit="invoices"
          icon={Calendar}
          bgGradient="from-blue-500 to-blue-600"
        />
        <KPICard
          title="Invoices Overdue"
          value={metrics.overdue}
          unit="invoices"
          icon={AlertCircle}
          bgGradient="from-rose-500 to-rose-600"
        />
        <KPICard
          title="Average Delay"
          value={metrics.avgDelay}
          unit="days"
          icon={TrendingDown}
          bgGradient="from-orange-500 to-orange-600"
        />
        <KPICard
          title="Compliance Score"
          value={Math.round(metrics.complianceScore)}
          unit="/100"
          icon={AlertCircle}
          bgGradient={metrics.complianceScore > 80 ? 'from-emerald-500 to-emerald-600' : metrics.complianceScore > 60 ? 'from-yellow-500 to-yellow-600' : 'from-rose-500 to-rose-600'}
        />
      </div>

      {/* AGING BUCKETS */}
      <div className="card p-6">
        <h3 className="text-[15px] font-bold text-text-primary mb-6">Payment Aging Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {bucketCounts.map((bucket) => {
            const colorMap = {
              green: 'bg-emerald-500',
              yellow: 'bg-amber-500',
              orange: 'bg-orange-500',
              red: 'bg-rose-500',
            };

            return (
              <button
                key={bucket.id}
                onClick={() => setSelectedBucket(bucket.label)}
                className={`p-4 rounded-none border-2 transition-colors duration-150 cursor-pointer ${
                  selectedBucket === bucket.label
                    ? 'border-text-primary bg-surface2'
                    : 'border-border hover:border-border-em'
                }`}
              >
                <div className={`${colorMap[bucket.color]} p-3 rounded-none mb-3`}>
                  <p className="text-white text-2xl font-bold tabular-nums text-center">{bucket.count}</p>
                </div>
                <p className="text-sm font-bold text-text-primary">{bucket.label}</p>
                <p className="text-xs text-text-tertiary mt-1">invoices</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* OUTSTANDING SUMMARY */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="label mb-0">Total Outstanding Amount</p>
            <p className="text-3xl font-bold text-text-primary font-mono mt-2 tabular-nums">{formatCurrency(metrics.totalOutstanding)}</p>
          </div>
          <div className="text-right">
            <p className="label mb-0">Compliance Status</p>
            <p className={`text-2xl font-bold mt-2 ${metrics.complianceScore > 80 ? 'text-emerald-400' : metrics.complianceScore > 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {metrics.complianceScore > 80 ? 'Compliant' : metrics.complianceScore > 60 ? 'At Risk' : 'Non-Compliant'}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-10"
          />
        </div>

        {selectedBucket !== 'All' && (
          <button
            onClick={() => setSelectedBucket('All')}
            className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors duration-150 cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* INVOICES TABLE */}
      <div>
        <h3 className="text-[15px] font-bold text-text-primary mb-4">
          {selectedBucket === 'All' ? 'All Invoices' : `Invoices (${selectedBucket})`}
        </h3>
        {filteredPayments.length > 0 ? (
          <DataTable columns={columns} data={filteredPayments} actions={actions} />
        ) : (
          <EmptyState
            icon={Search}
            title="No invoices found"
            description="No invoices match your search criteria"
          />
        )}
      </div>
    </div>
  );
}
