const PurchaseOrder = require('../models/PurchaseOrder');
const GRN = require('../models/GRN');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res, next) => {
  const vendorId = req.clerkUserId || req.headers['x-vendor-id'];
  const query = vendorId ? { vendorId } : {};

  const openPOs = await PurchaseOrder.countDocuments({ ...query, status: { $in: ['Open', 'Acknowledged'] } });
  const pendingGRNs = await GRN.countDocuments({ ...query, invoiceSubmitted: false });
  const invoices = await Invoice.find(query);
  const payments = await Payment.find(query);

  const totalPaymentsAmount = payments.reduce((sum, p) => sum + (p.netAmount || p.grossAmount || 0), 0);

  res.json({
    openPOCount: openPOs,
    pendingGRNsCount: pendingGRNs,
    invoiceCount: invoices.length,
    totalPaymentsAmount,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getDashboardSummary
};
