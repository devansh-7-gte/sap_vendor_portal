'use client';

import React, { useMemo } from 'react';
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { KPICard, StatusBadge, PaymentCard, SimpleChart } from './components/DesignComponents';
import { generateMockPayments } from './utils/dataUtils';

export default function PaymentDashboard({ state, onSelectPayment }) {
  // Generate or use mock data
  const payments = useMemo(() => generateMockPayments(state), [state]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + p.netAmount, 0);
    const paidAmount = payments
      .filter(p => p.status === 'Cleared')
      .reduce((sum, p) => sum + p.netAmount, 0);
    const pendingAmount = payments
      .filter(p => p.status === 'Processing' || p.status === 'Pending')
      .reduce((sum, p) => sum + p.netAmount, 0);
    const overdueAmount = payments
      .filter(p => p.status === 'Overdue')
      .reduce((sum, p) => sum + p.netAmount, 0);
    const thisMonthAmount = payments
      .filter(p => {
        const payDate = new Date(p.paymentDate);
        const now = new Date();
        return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.netAmount, 0);
    const totalTDS = payments.reduce((sum, p) => sum + (p.tdsAmount || 0), 0);

    const avgPaymentDays = payments.length > 0
      ? Math.round(
          payments.reduce((sum, p) => {
            const invoiceDate = new Date(p.invoiceDate);
            const paymentDate = new Date(p.paymentDate);
            return sum + ((paymentDate - invoiceDate) / (1000 * 60 * 60 * 24));
          }, 0) / payments.length
        )
      : 0;

    return {
      totalPayments,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      thisMonthAmount,
      totalTDS,
      avgPaymentDays,
    };
  }, [payments]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, idx) => ({
      month: month.substring(0, 3),
      amount: Math.floor(Math.random() * 50000) + 20000,
    }));
    return data;
  }, []);

  // Status distribution
  const statusDistribution = useMemo(() => [
    { status: 'Cleared', count: payments.filter(p => p.status === 'Cleared').length, color: 'bg-green-500' },
    { status: 'Processing', count: payments.filter(p => p.status === 'Processing').length, color: 'bg-blue-500' },
    { status: 'Pending', count: payments.filter(p => p.status === 'Pending').length, color: 'bg-yellow-500' },
    { status: 'Overdue', count: payments.filter(p => p.status === 'Overdue').length, color: 'bg-red-500' },
  ], [payments]);

  // Recent transactions
  const recentPayments = useMemo(() => payments.slice(0, 5), [payments]);

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Payment Dashboard</h2>
        <p className="text-sm text-stone-600 mt-1">
          Complete visibility into your payment lifecycle and cash flow
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Payments"
          value={kpis.totalPayments}
          unit="payments"
          icon={CreditCard}
          trend="+12%"
          bgGradient="from-blue-500 to-blue-600"
        />
        <KPICard
          title="Paid This Month"
          value={`₹ ${(kpis.thisMonthAmount / 100000).toFixed(1)}`}
          unit="Lakhs"
          icon={CheckCircle}
          trend="+8%"
          bgGradient="from-green-500 to-emerald-600"
        />
        <KPICard
          title="Pending Payments"
          value={`₹ ${(kpis.pendingAmount / 100000).toFixed(1)}`}
          unit="Lakhs"
          icon={Clock}
          trend="-3%"
          bgGradient="from-yellow-500 to-orange-600"
        />
        <KPICard
          title="Overdue Amount"
          value={`₹ ${(kpis.overdueAmount / 100000).toFixed(1)}`}
          unit="Lakhs"
          icon={AlertCircle}
          trend="+5%"
          bgGradient="from-red-500 to-rose-600"
        />
      </div>

      {/* SECONDARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-stone-600">Avg Payment Days</p>
            <TrendingUp className="size-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-stone-900">{kpis.avgPaymentDays}</p>
          <p className="text-xs text-stone-500 mt-2">from invoice to payment</p>
        </div>

        <div className="p-6 rounded-xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-stone-600">Total TDS Deducted</p>
            <LineChart className="size-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-stone-900">₹ {(kpis.totalTDS / 100000).toFixed(2)}</p>
          <p className="text-xs text-stone-500 mt-2">across all cleared payments</p>
        </div>

        <div className="p-6 rounded-xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-stone-600">Total Paid Amount</p>
            <BarChart3 className="size-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-stone-900">₹ {(kpis.paidAmount / 100000).toFixed(1)}</p>
          <p className="text-xs text-stone-500 mt-2">cleared and settled</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MONTHLY TREND */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-stone-200 bg-white">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-stone-900">Monthly Payment Trend</h3>
            <p className="text-xs text-stone-500 mt-1">Payment amounts processed over time</p>
          </div>
          <SimpleChart data={monthlyTrend} height={200} />
        </div>

        {/* STATUS DISTRIBUTION */}
        <div className="p-6 rounded-xl border border-stone-200 bg-white">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-stone-900">Payment Status</h3>
            <p className="text-xs text-stone-500 mt-1">Distribution across statuses</p>
          </div>
          <div className="space-y-3">
            {statusDistribution.map((item) => (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">{item.status}</span>
                  <span className="font-bold text-stone-900">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.count / payments.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT PAYMENTS */}
      <div className="p-6 rounded-xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Recent Payments</h3>
            <p className="text-xs text-stone-500 mt-1">Latest 5 payment transactions</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
            View All
            <ArrowRight className="size-3" />
          </button>
        </div>

        <div className="space-y-3">
          {recentPayments.map((payment) => (
            <div
              key={payment.id}
              onClick={() => onSelectPayment(payment)}
              className="group p-4 rounded-lg border border-stone-200 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-stone-900 text-sm">{payment.paymentNumber}</p>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-stone-600">
                    <div>
                      <p className="text-stone-500">Invoice</p>
                      <p className="font-mono font-semibold text-stone-900">{payment.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">UTR</p>
                      <p className="font-mono font-semibold text-stone-900">{payment.utrNumber}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">Net Amount</p>
                      <p className="font-mono font-semibold text-stone-900">₹ {payment.netAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">Date</p>
                      <p className="font-semibold text-stone-900">{new Date(payment.paymentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4 text-stone-400 group-hover:text-green-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
