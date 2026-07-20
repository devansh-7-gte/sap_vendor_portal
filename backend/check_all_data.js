const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Payment = require('./models/Payment');
const Invoice = require('./models/Invoice');
const Vendor = require('./models/Vendor');
const PurchaseOrder = require('./models/PurchaseOrder');

async function run() {
  const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/sap_vendor_portal';
  await mongoose.connect(connString);

  const vendors = await Vendor.find({});
  console.log(`=== VENDORS IN DB (${vendors.length}) ===`);
  vendors.forEach(v => {
    console.log(`- VendorID: ${v.vendorId}, Company: ${v.companyName}, status: ${v.status}`);
  });

  const payments = await Payment.find({});
  console.log(`\n=== PAYMENTS IN DB (${payments.length}) ===`);
  payments.forEach(p => {
    console.log(`- ID: ${p.id}, InvoiceID: ${p.invoiceId}, VendorID: ${p.vendorId}, Date: ${p.paymentDate.toISOString().split('T')[0]}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
