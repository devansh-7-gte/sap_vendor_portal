'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Search, Eye, Download, Share2, Filter, Grid, List as ListIcon } from 'lucide-react';
import { DocumentCard, EmptyState, DataTable } from './components/DesignComponents';
import { generateMockPaymentAdvices, formatDate } from './utils/dataUtils';

export default function PaymentAdviceCenter({ state }) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('All');

  const advices = useMemo(() => generateMockPaymentAdvices(state), [state]);

  // Filter documents
  const filteredAdvices = useMemo(() => {
    let filtered = advices;

    if (searchTerm) {
      filtered = filtered.filter(
        doc =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDocType !== 'All') {
      filtered = filtered.filter(doc => doc.type === selectedDocType);
    }

    return filtered;
  }, [advices, searchTerm, selectedDocType]);

  const docTypes = ['All', 'Payment Advice', 'Bank Advice', 'Remittance Advice', 'Settlement Advice'];

  const handlePreview = (doc) => {
    console.log('Preview document:', doc);
    // In a real app, this would open a PDF viewer
  };

  const handleDownload = (doc) => {
    console.log('Downloading document:', doc);
    // In a real app, this would trigger a download
  };

  const columns = [
    {
      key: 'name',
      label: 'Document Name',
      render: (val) => <span className="font-semibold">{val}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span className="chip bg-surface2 text-text-secondary">{val}</span>,
    },
    {
      key: 'generatedDate',
      label: 'Generated Date',
      render: (val) => <span className="tabular-nums">{formatDate(val)}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="font-mono font-semibold tabular-nums">₹ {val.toLocaleString()}</span>,
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (val) => <span className="text-xs font-mono tabular-nums">{val}</span>,
    },
  ];

  const actions = [
    {
      id: 'view',
      label: 'View',
      color: '#3b82f6',
      handler: handlePreview,
    },
    {
      id: 'download',
      label: 'Download',
      color: '#10b981',
      handler: handleDownload,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div>
        <h2 className="text-[22px] font-bold text-text-primary">Payment Advice Center</h2>
        <p className="text-xs font-semibold text-text-tertiary mt-1">
          Download and manage all your payment advice documents
        </p>
      </div>

      {/* DOCUMENT CATEGORIES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Payment Advice', 'Bank Advice', 'Remittance Advice', 'Settlement Advice'].map((category) => {
          const count = advices.filter(d => d.type === category).length;
          return (
            <div
              key={category}
              className="card p-4 hover:bg-surface2 transition-colors duration-150 cursor-pointer"
              onClick={() => setSelectedDocType(category)}
            >
              <p className="label mb-0">{category}</p>
              <p className="text-2xl font-bold tabular-nums text-text-primary mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="!w-auto"
          >
            {docTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="flex gap-1 border border-border rounded-none p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-none transition-colors duration-150 cursor-pointer ${viewMode === 'grid' ? 'bg-surface2 text-text-primary' : 'hover:bg-surface2 text-text-secondary'}`}
            >
              <Grid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-none transition-colors duration-150 cursor-pointer ${viewMode === 'list' ? 'bg-surface2 text-text-primary' : 'hover:bg-surface2 text-text-secondary'}`}
            >
              <ListIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTS */}
      {filteredAdvices.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdvices.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={filteredAdvices} actions={actions} />
          )}
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="No payment advice documents match your search criteria"
        />
      )}
    </div>
  );
}
