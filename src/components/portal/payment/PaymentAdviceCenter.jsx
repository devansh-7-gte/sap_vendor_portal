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
      render: (val) => <span className="text-xs font-mono bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">{val}</span>,
    },
    {
      key: 'generatedDate',
      label: 'Generated Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="font-mono font-semibold">₹ {val.toLocaleString()}</span>,
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (val) => <span className="text-xs font-mono">{val}</span>,
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
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Payment Advice Center</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
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
              className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
              onClick={() => setSelectedDocType(category)}
            >
              <p className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase">{category}</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-white mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 dark:text-stone-600" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-medium outline-none"
          >
            {docTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="flex gap-1 border border-stone-200 dark:border-stone-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}
            >
              <Grid className="size-4 text-stone-600 dark:text-stone-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}
            >
              <ListIcon className="size-4 text-stone-600 dark:text-stone-400" />
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
