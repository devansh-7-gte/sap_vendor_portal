'use client';

import React, { useState, useMemo } from 'react';
import { FileCheck, Search, Download, Eye, Calendar, DollarSign } from 'lucide-react';
import { StatusBadge, DataTable, EmptyState, KPICard } from './components/DesignComponents';
import { generateMockTDSCertificates, formatDate, formatCurrency } from './utils/dataUtils';

export default function TDSDocuments({ state }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  const certificates = useMemo(() => generateMockTDSCertificates(state), [state]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalTDS = certificates.reduce((sum, c) => sum + c.tdsAmount, 0);
    const currentFY = new Date().getFullYear();
    const currentFYTDS = certificates
      .filter(c => parseInt(c.financialYear.split('-')[0]) === currentFY)
      .reduce((sum, c) => sum + c.tdsAmount, 0);

    return {
      totalTDS,
      currentFYTDS,
      available: certificates.filter(c => c.status === 'Available').length,
      pending: certificates.filter(c => c.status !== 'Available').length,
    };
  }, [certificates]);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(
        c =>
          c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.quarter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedYear !== 'All') {
      filtered = filtered.filter(c => c.financialYear === selectedYear);
    }

    return filtered;
  }, [certificates, searchTerm, selectedYear]);

  const years = ['All', ...new Set(certificates.map(c => c.financialYear))];

  const columns = [
    {
      key: 'certificateNumber',
      label: 'Certificate Number',
      render: (val) => <span className="font-mono font-bold text-xs">{val}</span>,
    },
    {
      key: 'quarter',
      label: 'Quarter',
      render: (val) => val,
    },
    {
      key: 'financialYear',
      label: 'Financial Year',
      render: (val) => <span className="font-bold">{val}</span>,
    },
    {
      key: 'paymentReference',
      label: 'Payment Reference',
      render: (val) => <span className="text-xs font-mono">{val}</span>,
    },
    {
      key: 'tdsAmount',
      label: 'TDS Amount',
      render: (val) => <span className="font-mono font-bold">{formatCurrency(val)}</span>,
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      render: (val) => formatDate(val),
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
      handler: (row) => console.log('View', row),
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
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">TDS & Tax Documents</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Download and manage your TDS certificates and tax documents
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total TDS Deducted"
          value={`₹ ${(kpis.totalTDS / 100000).toFixed(2)}`}
          unit="Lakhs"
          icon={DollarSign}
          bgGradient="from-purple-500 to-purple-600"
        />
        <KPICard
          title="Current FY TDS"
          value={`₹ ${(kpis.currentFYTDS / 100000).toFixed(2)}`}
          unit="Lakhs"
          icon={Calendar}
          bgGradient="from-blue-500 to-blue-600"
        />
        <KPICard
          title="Certificates Available"
          value={kpis.available}
          unit="certificates"
          icon={FileCheck}
          bgGradient="from-green-500 to-green-600"
        />
        <KPICard
          title="Pending Certificates"
          value={kpis.pending}
          unit="certificates"
          icon={Calendar}
          bgGradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-stone-400 dark:text-stone-600" />
          <input
            type="text"
            placeholder="Search certificate number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-medium outline-none"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year === 'All' ? 'All Years' : `FY ${year}`}
            </option>
          ))}
        </select>
      </div>

      {/* TAX SUMMARY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Quarter Wise Breakdown</h3>
          <div className="space-y-3">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
              const quarterCerts = certificates.filter(c => c.quarter.includes(quarter));
              const totalAmount = quarterCerts.reduce((sum, c) => sum + c.tdsAmount, 0);
              const percentage = (totalAmount / kpis.totalTDS) * 100;

              return (
                <div key={quarter}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-stone-900 dark:text-white">{quarter}</span>
                    <span className="text-sm font-mono font-bold text-stone-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: `${percentage || 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Annual Summary</h3>
          <div className="space-y-3">
            {[...new Set(certificates.map(c => c.financialYear))].sort().reverse().slice(0, 4).map((year) => {
              const yearCerts = certificates.filter(c => c.financialYear === year);
              const totalAmount = yearCerts.reduce((sum, c) => sum + c.tdsAmount, 0);

              return (
                <div key={year} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50">
                  <span className="font-semibold text-stone-900 dark:text-white">FY {year}</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CERTIFICATES TABLE */}
      <div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Form 16A Certificates</h3>
        {filteredCertificates.length > 0 ? (
          <DataTable columns={columns} data={filteredCertificates} actions={actions} />
        ) : (
          <EmptyState
            icon={Search}
            title="No certificates found"
            description="No TDS certificates match your search criteria"
          />
        )}
      </div>
    </div>
  );
}
