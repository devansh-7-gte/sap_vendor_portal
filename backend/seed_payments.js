const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Payment = require('./models/Payment');
const Invoice = require('./models/Invoice');
const Vendor = require('./models/Vendor');

async function run() {
  const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/sap_vendor_portal';
  console.log("Connecting to:", connString);
  await mongoose.connect(connString);
  console.log("Connected!");

  // Find existing vendor
  const vendor = await Vendor.findOne({});
  if (!vendor) {
    console.log("❌ No vendor found in database! Please register a vendor first through the frontend or run E2E tests.");
    await mongoose.disconnect();
    return;
  }
  const vendorId = vendor.vendorId;
  console.log(`Using vendor: ${vendor.companyName} (Vendor ID: ${vendorId}, PAN: ${vendor.pan})`);

  const mockPayments = [
    {
      id: 'PMT-100234',
      invoiceId: 'INV-2026-0001',
      poId: 'PO-2026-0001',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0001',
      invoiceNumber: 'INV-2026-0001',
      sapMiroDoc: '5105600234',
      grossAmount: 43000,
      tdsDeducted: 430,
      netAmount: 42570,
      paymentDate: new Date('2026-06-01'),
      utrCode: 'UTR202606010012',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002034',
      bankName: 'HDFC Bank Ltd',
      runId: 'F110-060126',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 430
    },
    {
      id: 'PMT-100235',
      invoiceId: 'INV-2026-0002',
      poId: 'PO-2026-0002',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0002',
      invoiceNumber: 'INV-2026-0002',
      sapMiroDoc: '5105600235',
      grossAmount: 125000,
      tdsDeducted: 1250,
      netAmount: 123750,
      paymentDate: new Date('2026-06-05'),
      utrCode: 'UTR202606050098',
      paymentMethod: 'RTGS',
      sapPaymentDoc: 'PAY-5310002035',
      bankName: 'ICICI Bank Ltd',
      runId: 'F110-060526',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 1250
    },
    {
      id: 'PMT-100236',
      invoiceId: 'INV-2026-0003',
      poId: 'PO-2026-0003',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0003',
      invoiceNumber: 'INV-2026-0003',
      sapMiroDoc: '5105600236',
      grossAmount: 85000,
      tdsDeducted: 850,
      netAmount: 84150,
      paymentDate: new Date('2026-06-10'),
      utrCode: 'UTR202606100143',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002036',
      bankName: 'HDFC Bank Ltd',
      runId: 'F110-061026',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 850
    },
    {
      id: 'PMT-100237',
      invoiceId: 'INV-2026-0004',
      poId: 'PO-2026-0004',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0004',
      invoiceNumber: 'INV-2026-0004',
      sapMiroDoc: '5105600237',
      grossAmount: 320000,
      tdsDeducted: 3200,
      netAmount: 316800,
      paymentDate: new Date('2026-06-15'),
      utrCode: 'UTR202606150821',
      paymentMethod: 'RTGS',
      sapPaymentDoc: 'PAY-5310002037',
      bankName: 'State Bank of India',
      runId: 'F110-061526',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 3200
    },
    {
      id: 'PMT-100238',
      invoiceId: 'INV-2026-0005',
      poId: 'PO-2026-0005',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0005',
      invoiceNumber: 'INV-2026-0005',
      sapMiroDoc: '5105600238',
      grossAmount: 15000,
      tdsDeducted: 150,
      netAmount: 14850,
      paymentDate: new Date('2026-06-20'),
      utrCode: 'UTR202606200259',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002038',
      bankName: 'HDFC Bank Ltd',
      runId: 'F110-062026',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 150
    },
    {
      id: 'PMT-100239',
      invoiceId: 'INV-2026-0006',
      poId: 'PO-2026-0006',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0006',
      invoiceNumber: 'INV-2026-0006',
      sapMiroDoc: '5105600239',
      grossAmount: 95000,
      tdsDeducted: 950,
      netAmount: 94050,
      paymentDate: new Date('2026-06-25'),
      utrCode: 'UTR202606250912',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002039',
      bankName: 'Axis Bank Ltd',
      runId: 'F110-062526',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 950
    },
    {
      id: 'PMT-100240',
      invoiceId: 'INV-2026-0007',
      poId: 'PO-2026-0007',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0007',
      invoiceNumber: 'INV-2026-0007',
      sapMiroDoc: '5105600240',
      grossAmount: 55000,
      tdsDeducted: 550,
      netAmount: 54450,
      paymentDate: new Date('2026-06-26'),
      utrCode: 'UTR202606260843',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002040',
      bankName: 'HDFC Bank Ltd',
      runId: 'F110-062626',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 550
    },
    {
      id: 'PMT-100241',
      invoiceId: 'INV-2026-0008',
      poId: 'PO-2026-0008',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0008',
      invoiceNumber: 'INV-2026-0008',
      sapMiroDoc: '5105600241',
      grossAmount: 212000,
      tdsDeducted: 2120,
      netAmount: 209880,
      paymentDate: new Date('2026-06-27'),
      utrCode: 'UTR202606270119',
      paymentMethod: 'RTGS',
      sapPaymentDoc: 'PAY-5310002041',
      bankName: 'ICICI Bank Ltd',
      runId: 'F110-062726',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 2120
    },
    {
      id: 'PMT-100242',
      invoiceId: 'INV-2026-0009',
      poId: 'PO-2026-0009',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0009',
      invoiceNumber: 'INV-2026-0009',
      sapMiroDoc: '5105600242',
      grossAmount: 66000,
      tdsDeducted: 660,
      netAmount: 65340,
      paymentDate: new Date('2026-06-28'),
      utrCode: 'UTR202606280456',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002042',
      bankName: 'HDFC Bank Ltd',
      runId: 'F110-062826',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 660
    },
    {
      id: 'PMT-100243',
      invoiceId: 'INV-2026-0010',
      poId: 'PO-2026-0010',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0010',
      invoiceNumber: 'INV-2026-0010',
      sapMiroDoc: '5105600243',
      grossAmount: 34500,
      tdsDeducted: 345,
      netAmount: 34155,
      paymentDate: new Date('2026-06-29'),
      utrCode: 'UTR202606290882',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002043',
      bankName: 'Axis Bank Ltd',
      runId: 'F110-062926',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 345
    },
    {
      id: 'PMT-100244',
      invoiceId: 'INV-2026-0011',
      poId: 'PO-2026-0011',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0011',
      invoiceNumber: 'INV-2026-0011',
      sapMiroDoc: '5105600244',
      grossAmount: 180000,
      tdsDeducted: 1800,
      netAmount: 178200,
      paymentDate: new Date('2026-06-30'),
      utrCode: 'UTR202606300445',
      paymentMethod: 'RTGS',
      sapPaymentDoc: 'PAY-5310002044',
      bankName: 'HDFC Bank Ltd',
      runId: 'F110-063026',
      fiscalYear: 2026,
      quarter: 'Q1',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 1800
    },
    {
      id: 'PMT-100245',
      invoiceId: 'INV-2026-0012',
      poId: 'PO-2026-0012',
      vendorId: vendorId,
      invoiceRef: 'INV-2026-0012',
      invoiceNumber: 'INV-2026-0012',
      sapMiroDoc: '5105600245',
      grossAmount: 73000,
      tdsDeducted: 730,
      netAmount: 72270,
      paymentDate: new Date('2026-07-02'),
      utrCode: 'UTR202607020138',
      paymentMethod: 'NEFT',
      sapPaymentDoc: 'PAY-5310002045',
      bankName: 'State Bank of India',
      runId: 'F110-070226',
      fiscalYear: 2026,
      quarter: 'Q2',
      tdsSection: '194C',
      deducteePan: vendor.pan || 'PAN-MOCK123',
      deductorTan: 'TAN-SAP1000',
      totalTds: 730
    }
  ];

  for (const p of mockPayments) {
    // 1. Upsert Payment
    const existingPayment = await Payment.findOne({ id: p.id });
    if (!existingPayment) {
      await Payment.create(p);
      console.log(`✅ Created payment entry: ${p.id}`);
    } else {
      console.log(`ℹ️ Payment entry ${p.id} already exists`);
    }

    // 2. Ensure matching Invoice exists so that getInvoiceForPayment works
    const existingInvoice = await Invoice.findOne({ id: p.invoiceId });
    if (!existingInvoice) {
      await Invoice.create({
        id: p.invoiceId,
        grnId: 'GRN-' + p.id.slice(-6),
        poId: p.poId,
        vendorId: vendorId,
        invoiceNumber: p.invoiceNumber,
        invoiceDate: p.paymentDate,
        sapMiroDoc: p.sapMiroDoc,
        status: 'Cleared',
        subTotal: Math.round(p.grossAmount / 1.18),
        taxAmount: Math.round(p.grossAmount - (p.grossAmount / 1.18)),
        totalAmount: p.grossAmount,
        currency: 'INR',
        clearedAt: p.paymentDate
      });
      console.log(`✅ Created matching cleared invoice: ${p.invoiceId}`);
    }
  }

  console.log("\n🏁 Seeding completed successfully!");
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
