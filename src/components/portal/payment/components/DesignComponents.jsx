'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KPI Card Component
 * Displays key performance indicator with icon, title, value, and trend
 */
export function KPICard({ title, value, unit, icon: Icon, trend, bgGradient }) {
  const isPositive = !trend || trend.startsWith('+');

  return (
    <div className="p-6 rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${bgGradient || 'from-blue-500 to-blue-600'}`}>
          <Icon className="size-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs text-stone-600 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold text-stone-900 mt-2">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{unit}</p>
    </div>
  );
}

/**
 * Status Badge Component
 * Displays payment status with appropriate styling
 */
export function StatusBadge({ status, size = 'sm' }) {
  const statusConfig = {
    Cleared: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    Processing: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    Overdue: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    Failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    Approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'md' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-base';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${config.bg} ${config.text} ${config.border}`}>
      {status}
    </span>
  );
}

/**
 * Payment Card Component
 * Displays individual payment information in card format
 */
export function PaymentCard({ payment, onSelect, compact = false }) {
  return (
    <div
      onClick={() => onSelect && onSelect(payment)}
      className="group p-4 rounded-lg border border-stone-200 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-stone-900 text-sm">{payment.paymentNumber}</p>
          <p className="text-xs text-stone-500 mt-0.5">{payment.paymentDate}</p>
        </div>
        <StatusBadge status={payment.status} size="sm" />
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-stone-500">Invoice</p>
            <p className="font-mono font-semibold text-stone-900">{payment.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-stone-500">Net Amount</p>
            <p className="font-mono font-semibold text-stone-900">₹ {payment.netAmount.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple Chart Component
 * Renders a basic line/bar chart for payment trends
 */
export function SimpleChart({ data, height = 200, type = 'line' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-stone-400">
        No data available
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount));
  const minAmount = 0;
  const range = maxAmount - minAmount;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((item, idx) => {
          const percentage = ((item.amount - minAmount) / range) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: `${percentage}%`, minHeight: '4px' }} />
              <p className="text-[10px] font-semibold text-stone-600">{item.month}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>₹ 0</span>
        <span>₹ {(maxAmount / 100000).toFixed(1)}L</span>
      </div>
    </div>
  );
}

/**
 * Timeline Component
 * Displays payment lifecycle timeline
 */
export function PaymentTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return <div className="text-center py-8 text-stone-400">No timeline events</div>;
  }

  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${event.completed ? 'bg-green-500' : 'bg-stone-300'}`} />
            {idx < events.length - 1 && <div className="w-0.5 h-8 bg-stone-200" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-semibold text-stone-900 text-sm">{event.title}</p>
            <p className="text-xs text-stone-500 mt-0.5">{event.date}</p>
            {event.description && <p className="text-xs text-stone-600 mt-1">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Filter Bar Component
 * Reusable filter component with multiple options
 */
export function FilterBar({ filters, onFilterChange, clearFilters }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-600">{filter.label}</label>
          <select
            value={filter.value}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-900 text-xs font-medium outline-none focus:border-green-500"
          >
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}
      {clearFilters && (
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Document Card Component
 * Displays document information
 */
export function DocumentCard({ doc, onPreview, onDownload }) {
  return (
    <div className="p-4 rounded-lg border border-stone-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-stone-900 text-sm">{doc.name}</p>
          <p className="text-xs text-stone-500 mt-0.5">{doc.type}</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-stone-100 text-stone-700">{doc.generatedDate}</span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-200">
        <p className="text-xs font-mono text-stone-600">{doc.reference}</p>
        <div className="flex gap-2">
          {onPreview && (
            <button
              onClick={() => onPreview(doc)}
              className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              View
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(doc)}
              className="px-2.5 py-1 text-xs font-semibold text-green-600 hover:bg-green-50 rounded transition-colors"
            >
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 * Shows when no data is available
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50">
      {Icon && <Icon className="size-12 text-stone-300 mb-4" />}
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 mt-2 max-w-sm text-center">{description}</p>
      {action && (
        <button className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Data Table Component
 * Reusable table for displaying structured data
 */
export function DataTable({ columns, data, actions, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-stone-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No data" description="No records found matching your criteria" />;
  }

  return (
    <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 font-bold text-stone-600 uppercase tracking-wider text-[10px]">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3 font-bold text-stone-600 uppercase tracking-wider text-[10px]">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-stone-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-stone-900 font-medium">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => action.handler(row)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{
                          color: action.color || '#666',
                          backgroundColor: `${action.color || '#ccc'}20`,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Alert Banner Component
 * Shows alerts for important information
 */
export function AlertBanner({ type = 'info', title, message, action }) {
  const typeConfig = {
    info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  };

  const config = typeConfig[type];

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`font-semibold ${config.text}`}>{title}</p>
          <p className={`text-sm mt-1 ${config.text}`}>{message}</p>
        </div>
        {action && (
          <button className={`text-xs font-semibold ${config.text} hover:underline ml-4 flex-shrink-0`}>
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
