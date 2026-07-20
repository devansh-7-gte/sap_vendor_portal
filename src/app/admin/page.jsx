'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity, 
  Users, 
  FileText, 
  DollarSign, 
  Database,
  Layers,
  Settings,
  FileCode,
  Search,
  Eye,
  Info,
  Calendar,
  Lock,
  ArrowRightLeft,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';
import KPICard from '@/components/ui/KPICard';
import StatusBadge from '@/components/ui/StatusBadge';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({
    totalVendors: 0,
    totalRfqs: 0,
    totalPOs: 0,
    totalInvoices: 0,
    totalPayments: 0,
    totalVolume: 0
  });
  const [systemStatus, setSystemStatus] = useState({
    db: 'checking...',
    socketConnections: 0,
    sapMockMode: 'checking...'
  });
  const [registrationQueue, setRegistrationQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogFilter, setSelectedLogFilter] = useState({ type: '', status: '' });
  const [logSearchQuery, setLogSearchQuery] = useState('');
  
  // Interactive Modals
  const [rejectModal, setRejectModal] = useState({ open: false, vendorId: null, reason: '' });
  const [inspectLogModal, setInspectLogModal] = useState({ open: false, log: null });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Health Status
      const healthRes = await fetch(`${BASE_URL}/health`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setSystemStatus({
          db: healthData.db,
          socketConnections: healthData.socketConnections,
          sapMockMode: healthData.sapMockMode
        });
      }

      // 2. Fetch Metrics
      const metricsRes = await fetch(`${BASE_URL}/reports/metrics`);
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      // 3. Fetch Vendors Queue (Under Review)
      const vendorsRes = await fetch(`${BASE_URL}/vendors?status=Under%20Review`);
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setRegistrationQueue(vendorsData.vendors || []);
      }

      // 4. Fetch Logs (all=true for admin view)
      let logUrl = `${BASE_URL}/logs?all=true`;
      if (selectedLogFilter.type) logUrl += `&type=${selectedLogFilter.type}`;
      if (selectedLogFilter.status) logUrl += `&status=${selectedLogFilter.status}`;
      
      const logsRes = await fetch(logUrl);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData || []);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll system status every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedLogFilter]);

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this vendor registration and register them in SAP?')) return;
    try {
      const res = await fetch(`${BASE_URL}/vendors/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert('Vendor registration approved and SAP Vendor Code assigned successfully!');
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Approval failed'}`);
      }
    } catch (e) {
      alert('Network request failed');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.reason.trim()) {
      alert('Please specify a rejection reason');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/vendors/${rejectModal.vendorId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectModal.reason })
      });
      if (res.ok) {
        alert('Vendor registration rejected.');
        setRejectModal({ open: false, vendorId: null, reason: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Rejection failed'}`);
      }
    } catch (e) {
      alert('Network request failed');
    }
  };

  // Filter logs by search query
  const filteredLogs = logs.filter(log => {
    if (!logSearchQuery) return true;
    const query = logSearchQuery.toLowerCase();
    return (
      (log.name && log.name.toLowerCase().includes(query)) ||
      (log.documentRef && log.documentRef.toLowerCase().includes(query)) ||
      (log.type && log.type.toLowerCase().includes(query)) ||
      (log.vendorId && log.vendorId.toLowerCase().includes(query))
    );
  });

  return (
    <ErrorBoundary>
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 animate-fade-in pb-24 select-none font-sans">

        {/* Enterprise Page Header */}
        <div className="relative card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'var(--color-emerald-dim)' }}></div>

          <div className="space-y-3 z-10">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-surface2 text-text-primary rounded-xl border border-border shadow-inner flex items-center justify-center">
                <ShieldAlert className="size-6" />
              </span>
              <div>
                <h1 className="text-[22px] font-bold text-text-primary">
                  SAP Integration &amp; Supplier Administration
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-surface2 text-text-secondary border border-border px-2 py-0.5 rounded-full font-bold font-mono tracking-wider">
                    V1.2.0-SECURE
                  </span>
                  <span className="text-[10px] text-emerald-text border border-border px-2 py-0.5 rounded-full font-bold font-mono tracking-wider" style={{ backgroundColor: 'var(--color-emerald-dim)' }}>
                    PORTAL ADMIN
                  </span>
                </div>
              </div>
            </div>
            <p className="text-text-tertiary text-xs max-w-3xl leading-relaxed">
              Global administration dashboard and control plane. Monitor active system configurations, database health parameters, verify supplier onboarding document submissions, and audit interface transaction logs.
            </p>
          </div>

          <div className="flex items-center gap-4 self-stretch md:self-auto justify-end z-10 shrink-0">
            <div className="flex flex-col text-right pr-2 hidden sm:flex">
              <span className="text-[9px] text-text-tertiary font-extrabold uppercase tracking-widest">System Sync Time</span>
              <span className="text-xs text-text-secondary font-bold font-mono tabular-nums">
                {new Date().toLocaleTimeString('en-IN')}
              </span>
            </div>
            <Button
              onClick={fetchData}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Feeds</span>
            </Button>
          </div>
        </div>

        {/* Segmented Tab Bar */}
        <div className="bg-surface2 p-1 rounded-xl border border-border flex flex-wrap gap-1.5 w-max select-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2.5 text-xs font-bold transition-colors duration-150 rounded-lg flex items-center gap-2.5 h-10 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              activeTab === 'dashboard'
                ? 'bg-surface text-text-primary shadow-sm border border-border'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface/50'
            }`}
          >
            <Activity className="size-4 shrink-0" />
            <span>Systems Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-6 py-2.5 text-xs font-bold transition-colors duration-150 rounded-lg flex items-center gap-2.5 h-10 cursor-pointer relative select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              activeTab === 'queue'
                ? 'bg-surface text-text-primary shadow-sm border border-border'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface/50'
            }`}
          >
            <Users className="size-4 shrink-0" />
            <span>Compliance Queue</span>
            {registrationQueue.length > 0 && (
              <span className="h-5 min-w-5 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-surface shadow-sm shrink-0 tabular-nums">
                {registrationQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2.5 text-xs font-bold transition-colors duration-150 rounded-lg flex items-center gap-2.5 h-10 cursor-pointer select-none ${
              activeTab === 'logs'
                ? 'bg-surface text-text-primary shadow-sm border border-border'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface/50'
            }`}
          >
            <FileCode className="size-4 shrink-0" />
            <span>Interface Audit Feed</span>
          </button>
        </div>

        {/* TAB 1: SYSTEM CONTROLS AND KPI TILES */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Live System Health Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Database Status */}
              <div className="p-5 card flex items-center gap-4 relative overflow-hidden transition-colors duration-150 hover:border-border-em">
                <div className={`p-3.5 rounded-xl ${systemStatus.db === 'connected' ? 'text-emerald-text' : 'bg-red-500/10 text-red-600'}`} style={systemStatus.db === 'connected' ? { backgroundColor: 'var(--color-emerald-dim)' } : undefined}>
                  <Database className="size-6" />
                </div>
                <div className="space-y-1">
                  <span className="label mb-0">Enterprise Database</span>
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${systemStatus.db === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-extrabold text-text-primary capitalize font-mono leading-none">{systemStatus.db}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Socket.io Client Sessions */}
              <div className="p-5 card flex items-center gap-4 relative overflow-hidden transition-colors duration-150 hover:border-border-em">
                <div className="p-3.5 rounded-xl bg-surface2 text-text-secondary">
                  <Server className="size-6" />
                </div>
                <div className="space-y-1">
                  <span className="label mb-0">Active WebSocket Sessions</span>
                  <span className="text-sm font-extrabold text-text-primary font-mono block leading-none tabular-nums">
                    {systemStatus.socketConnections} Live {systemStatus.socketConnections === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>
              </div>

              {/* Card 3: SAP Environment Mode */}
              <div className="p-5 card flex items-center gap-4 relative overflow-hidden transition-colors duration-150 hover:border-border-em">
                <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600">
                  <Settings className="size-6" />
                </div>
                <div className="space-y-1">
                  <span className="label mb-0">RFC Gateway Mode</span>
                  <span className="text-sm font-extrabold text-text-primary font-mono block leading-none">
                    {systemStatus.sapMockMode}
                  </span>
                </div>
              </div>

            </div>

            {/* Standard KPI Tiles Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <span className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-widest">Platform Core Metrics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

                <KPICard label="Suppliers Registered" value={<span className="tabular-nums">{metrics.totalVendors}</span>} icon={Users} />

                <KPICard label="Bidding RFQs" value={<span className="tabular-nums">{metrics.totalRfqs}</span>} icon={FileText} />

                <KPICard label="Purchase Orders" value={<span className="tabular-nums">{metrics.totalPOs}</span>} icon={FileText} />

                <KPICard label="Posted Invoices" value={<span className="tabular-nums">{metrics.totalInvoices}</span>} icon={FileText} />

                <div className="metric-panel col-span-1 sm:col-span-2 lg:col-span-1" style={{ backgroundColor: 'rgb(var(--color-emerald-default-rgb))', color: '#fff', borderColor: 'transparent' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">Settled Volume</span>
                    <DollarSign className="size-4 text-white/70" />
                  </div>
                  <span className="text-xl font-black text-white block mt-1 font-mono truncate tabular-nums">
                    ₹{metrics.totalVolume.toLocaleString('en-IN')}
                  </span>
                </div>

              </div>
            </div>

            {/* Health Checklist Audit card */}
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ShieldAlert className="size-5 text-text-secondary" />
                <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-widest">Security Hardening Status Report</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-emerald-text shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-text-primary block">Zod Input Validation Engine</span>
                      <span className="text-text-tertiary text-[11px]">Strict schema constraint validation activated across database records, profile updates, and billing parameters.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-emerald-text shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-text-primary block">Helmet Middleware Headers</span>
                      <span className="text-text-tertiary text-[11px]">Content Security Policies (CSP), Frame Ancestors block, cross-site scripting guards, and secure cookie headers active.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-emerald-text shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-text-primary block">Winston Correlation Logging</span>
                      <span className="text-text-tertiary text-[11px]">Structured Winston logging enabled. Request tracing IDs map communication streams with daily auto-rotation log cycles.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-emerald-text shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-text-primary block">Environment Assertions Check</span>
                      <span className="text-text-tertiary text-[11px]">Dynamic configuration checks run on server startup to validate Atlas database links and secret signatures.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COMPLIANCE ONBOARDING QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Compliance Approval Queue</h3>
                <p className="text-text-tertiary text-xs mt-1">Review uploaded supplier files, tax parameters, and business registrations. Approval generates an active vendor master code and registers the record in SAP.</p>
              </div>

              {registrationQueue.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No pending vendor registrations"
                  description="No pending vendor registrations awaiting audit."
                />
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr>
                        <th>Supplier Details</th>
                        <th>Vendor ID</th>
                        <th>Tax Parameters</th>
                        <th>Email &amp; Contacts</th>
                        <th className="text-right">Audit Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationQueue.map((vendor) => (
                        <tr key={vendor._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="size-8.5 rounded-lg bg-surface2 text-text-primary font-black text-xs flex items-center justify-center border border-border shrink-0">
                                {vendor.companyName?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-text-primary block">{vendor.companyName}</span>
                                <div className="flex gap-1.5 mt-1">
                                  <span className="text-[8px] bg-surface2 text-text-secondary border border-border px-1.5 py-0.5 rounded font-extrabold uppercase font-mono">MSME</span>
                                  <span className="text-[8px] text-emerald-text border border-border px-1.5 py-0.5 rounded font-extrabold uppercase font-mono" style={{ backgroundColor: 'var(--color-emerald-dim)' }}>DOCS UPLOADED</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="font-mono text-xs text-text-secondary font-bold block">{vendor.vendorId}</span>
                          </td>
                          <td className="font-mono text-[11px] space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-text-tertiary font-extrabold w-12">GSTIN:</span>
                              <span className="text-text-primary font-extrabold">{vendor.gstin}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-text-tertiary font-extrabold w-12">PAN:</span>
                              <span className="text-text-primary font-extrabold">{vendor.pan}</span>
                            </div>
                          </td>
                          <td>
                            <span className="block font-bold text-text-primary">{vendor.email}</span>
                            <span className="text-text-tertiary text-[10px] block mt-0.5 font-mono font-bold">{vendor.phone}</span>
                          </td>
                          <td className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => handleApprove(vendor._id)}
                                size="sm"
                                variant="default"
                              >
                                Approve &amp; Sync
                              </Button>
                              <Button
                                onClick={() => setRejectModal({ open: true, vendorId: vendor._id, reason: '' })}
                                size="sm"
                                variant="destructive"
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SAP INTEGRATION AUDIT LOG FEED */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-6 space-y-6">

              {/* Header and Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                  <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">SAP Interface Transaction Log</h3>
                  <p className="text-text-tertiary text-xs mt-1">Real-time trace logs capturing inbound/outbound communication payloads over RFC, BAPI, and OData channels.</p>
                </div>

                {/* Audit Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Text Search */}
                  <div className="relative">
                    <Search className="size-4 text-text-tertiary absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Interface or Doc ID..."
                      value={logSearchQuery}
                      onChange={e => setLogSearchQuery(e.target.value)}
                      className="pl-9 min-w-[220px] font-bold"
                    />
                  </div>

                  {/* Log Type Select */}
                  <select
                    value={selectedLogFilter.type}
                    onChange={e => setSelectedLogFilter({ ...selectedLogFilter, type: e.target.value })}
                    className="font-bold cursor-pointer"
                  >
                    <option value="">All Interface Types</option>
                    <option value="BAPI">BAPI</option>
                    <option value="RFC">RFC</option>
                    <option value="OData">OData</option>
                    <option value="IDoc">IDoc</option>
                  </select>

                  {/* Status Select */}
                  <select
                    value={selectedLogFilter.status}
                    onChange={e => setSelectedLogFilter({ ...selectedLogFilter, status: e.target.value })}
                    className="font-bold cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              {filteredLogs.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={Info}
                    title="No interface logs found"
                    description="No interface logs match the search query parameters."
                  />
                </div>
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="w-44">Timestamp</th>
                        <th className="w-28">Type</th>
                        <th className="w-48">Name / ID</th>
                        <th className="w-36">Document Ref</th>
                        <th>Payload Summary</th>
                        <th className="text-center w-24">Status</th>
                        <th className="text-right w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log._id}>
                          <td className="font-mono text-[10.5px] tabular-nums">
                            {new Date(log.timestamp).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border font-mono ${
                              log.type === 'BAPI' ? 'bg-blue-500/10 text-blue-700 border-blue-200' :
                              log.type === 'RFC' ? 'bg-purple-500/10 text-purple-700 border-purple-200' :
                              log.type === 'IDoc' ? 'bg-teal-500/10 text-teal-700 border-teal-200' :
                              'bg-orange-500/10 text-orange-700 border-orange-200'
                            }`}>
                              {log.type}
                            </span>
                            <span className={`text-[8.5px] font-extrabold font-mono ml-2 ${log.direction === 'OUTBOUND' ? 'text-blue-600' : 'text-amber-600'}`}>
                              {log.direction === 'OUTBOUND' ? '↑ OUT' : '↓ IN'}
                            </span>
                          </td>
                          <td className="font-mono font-bold text-[10.5px] text-text-primary truncate max-w-[190px]" title={log.name}>
                            {log.name}
                          </td>
                          <td className="font-mono text-[10.5px] text-text-secondary font-bold">{log.documentRef || '—'}</td>
                          <td className="font-mono text-[10.5px] truncate max-w-xs" title={log.payload ? JSON.stringify(log.payload) : ''}>
                            {log.payload ? JSON.stringify(log.payload).slice(0, 80) : '—'}
                          </td>
                          <td className="text-center">
                            <StatusBadge label={log.status} variant={log.status === 'SUCCESS' ? 'active' : 'suspended'} />
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setInspectLogModal({ open: true, log })}
                              className="text-[10px] font-bold text-text-secondary hover:text-text-primary hover:underline flex items-center gap-1.5 ml-auto cursor-pointer transition-colors duration-150"
                            >
                              <Eye className="size-3.5" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DIALOG 1: COMPLIANCE REJECTION REASON DRAWER */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card p-6 max-w-md w-full space-y-5">
              <div>
                <h4 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Reject Supplier Audit</h4>
                <p className="text-text-tertiary text-xs mt-1">Please provide a specific reason for rejection. This reason will show on the vendor's dashboard.</p>
              </div>
              <textarea
                value={rejectModal.reason}
                onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="GST registration certificate upload is blurry or invalid. Please re-upload legible documentation."
                rows="4"
                className="w-full font-bold"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => setRejectModal({ open: false, vendorId: null, reason: '' })}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectSubmit}
                  size="sm"
                  variant="destructive"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG 2: SAP PAYLOAD INSPECTOR DRAWER */}
        {inspectLogModal.open && inspectLogModal.log && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card p-6 max-w-3xl w-full space-y-5">

              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-surface2 text-text-secondary border border-border px-2 py-0.5 rounded font-extrabold font-mono uppercase tracking-wide">
                      {inspectLogModal.log.type} Transaction
                    </span>
                    <span className={`text-[9px] font-extrabold font-mono ${inspectLogModal.log.direction === 'OUTBOUND' ? 'text-blue-600' : 'text-amber-600'}`}>
                      {inspectLogModal.log.direction === 'OUTBOUND' ? '↑ OUTBOUND' : '↓ INBOUND'}
                    </span>
                  </div>
                  <h4 className="font-mono font-black text-base text-text-primary mt-1.5">{inspectLogModal.log.name}</h4>
                </div>
                <button
                  onClick={() => setInspectLogModal({ open: false, log: null })}
                  className="text-text-tertiary hover:text-text-primary font-bold text-sm cursor-pointer select-none transition-colors duration-150"
                >
                  ✕
                </button>
              </div>

              {/* Log Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface2/40 border border-border p-4 rounded-xl text-xs font-bold leading-normal">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary w-24">Log Timestamp:</span>
                    <span className="text-text-primary font-mono tabular-nums">{new Date(inspectLogModal.log.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary font-mono">{inspectLogModal.log.documentRef || '—'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary w-20">Vendor Link:</span>
                    <span className="text-text-primary font-mono truncate max-w-[170px]" title={inspectLogModal.log.vendorId}>
                      {inspectLogModal.log.vendorId || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary w-20">Audit Status:</span>
                    <StatusBadge label={inspectLogModal.log.status} variant={inspectLogModal.log.status === 'SUCCESS' ? 'active' : 'suspended'} />
                  </div>
                </div>
              </div>

              {/* JSON Payload Inspector */}
              <div className="space-y-2">
                <span className="label mb-0">Raw JSON Data Payload</span>
                <div className="bg-base border border-border-em text-emerald-text font-mono text-[11px] p-5 rounded-xl overflow-y-auto max-h-80 select-text leading-relaxed">
                  <pre className="whitespace-pre-wrap word-break">
                    {JSON.stringify(inspectLogModal.log.payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  onClick={() => setInspectLogModal({ open: false, log: null })}
                  variant="default"
                >
                  Close Inspector
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}
