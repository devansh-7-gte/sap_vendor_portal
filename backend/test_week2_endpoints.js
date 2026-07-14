const BACKEND_URL = 'http://localhost:5000/api';

const MOCK_VENDOR = {
  vendorId: 'mock_vendor_w2_' + Math.floor(Math.random() * 100000),
  companyName: 'Acme Logistics W2 Ltd',
  gstin: '27W2VND' + Math.floor(1000 + Math.random() * 9000) + 'A1Z' + Math.floor(1 + Math.random() * 9),
  pan: 'W2VND' + Math.floor(1000 + Math.random() * 9000) + 'F',
  email: 'test_w2_' + Math.floor(Math.random() * 100000) + '@example.com',
  phone: '9876543210',
  address: {
    street: '456 Business Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India'
  },
  bankDetails: {
    bankName: 'Axis Bank',
    accountNumber: '998877665544',
    ifscCode: 'UTIB0000123',
    accountType: 'Current'
  },
  vendorCategory: 'Engineering Services',
  msmeRegistered: true
};

async function runTests() {
  console.log('🏁 Starting Week 2 E2E Procure-to-Pay API Verification Tests...\n');

  try {
    // 1. Create vendor profile
    console.log(`➡️ 1. Creating vendor profile for Clerk ID: ${MOCK_VENDOR.vendorId}...`);
    const createRes = await fetch(`${BACKEND_URL}/vendors/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MOCK_VENDOR)
    });
    const createData = await createRes.json();
    console.log('✅ Response:', createRes.status, `Db ID: ${createData._id}\n`);
    if (createRes.status !== 201) {
      throw new Error(`Expected status 201, got ${createRes.status}`);
    }

    // 2. Create RFQ
    console.log('➡️ 2. Creating RFQ...');
    const rfqPayload = {
      description: 'Annual Steel Piping Procurement 2026',
      deadlineDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      rfqType: 'AN',
      invitedVendors: [{ id: MOCK_VENDOR.vendorId, name: MOCK_VENDOR.companyName, rating: 92 }],
      paymentTerms: 'NET 30 Days',
      deliveryLocation: 'Plant 1000 Warehouse',
      items: [
        { line: 10, materialCode: 'MAT-3849', description: 'Steel Pipe 3" SCH40', quantity: 200, targetPrice: 120, plant: '1000' },
        { line: 20, materialCode: 'MAT-9210', description: 'Flange 3" ANSI 150#', quantity: 50, targetPrice: 80, plant: '1000' }
      ]
    };
    const rfqRes = await fetch(`${BACKEND_URL}/rfqs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': MOCK_VENDOR.vendorId
      },
      body: JSON.stringify(rfqPayload)
    });
    const rfqData = await rfqRes.json();
    const rfqId = rfqData.id;
    console.log('✅ RFQ Created:', rfqRes.status, `RFQ ID: ${rfqId}, Status: ${rfqData.status}\n`);
    if (rfqRes.status !== 201) {
      throw new Error(`Expected status 201, got ${rfqRes.status}`);
    }

    // 3. Submit Bid
    console.log(`➡️ 3. Submitting Bid from ${MOCK_VENDOR.vendorId} to RFQ ${rfqId}...`);
    const bidPayload = {
      unitPrices: {
        '10': 115, // line 10
        '20': 78   // line 20
      },
      gstRate: '18%',
      freight: 1500,
      deliveryLeadTimeDays: 5,
      validityDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      remarks: 'Best competitive industrial grade delivery.'
    };
    const bidRes = await fetch(`${BACKEND_URL}/rfqs/${rfqId}/bid`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': MOCK_VENDOR.vendorId 
      },
      body: JSON.stringify(bidPayload)
    });
    const bidData = await bidRes.json();
    console.log('✅ Bid Submitted:', bidRes.status, bidData, '\n');
    if (bidRes.status !== 200) {
      throw new Error(`Expected status 200, got ${bidRes.status}`);
    }

    // 4. Retrieve Evaluation Matrix
    console.log(`➡️ 4. Fetching Evaluation Matrix for RFQ ${rfqId}...`);
    const evalRes = await fetch(`${BACKEND_URL}/rfqs/${rfqId}/evaluate`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const evalData = await evalRes.json();
    console.log('✅ Evaluation matrix:', evalRes.status, JSON.stringify(evalData.evaluation, null, 2), '\n');
    if (evalRes.status !== 200) {
      throw new Error(`Expected status 200, got ${evalRes.status}`);
    }

    // 5. Award RFQ (Generates PO)
    console.log(`➡️ 5. Awarding RFQ ${rfqId} to ${MOCK_VENDOR.vendorId}...`);
    const awardRes = await fetch(`${BACKEND_URL}/rfqs/${rfqId}/award`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': MOCK_VENDOR.vendorId
      },
      body: JSON.stringify({ vendorId: MOCK_VENDOR.vendorId })
    });
    const awardData = await awardRes.json();
    const poId = awardData.po.id;
    console.log('✅ Awarded:', awardRes.status, `PO ID: ${poId}, Status: ${awardData.po.status}, sapPoNumber: ${awardData.po.sapPoNumber}\n`);
    if (awardRes.status !== 200) {
      throw new Error(`Expected status 200, got ${awardRes.status}`);
    }

    // 6. Acknowledge PO
    console.log(`➡️ 6. Acknowledging PO ${poId}...`);
    const ackRes = await fetch(`${BACKEND_URL}/pos/${poId}/acknowledge`, {
      method: 'PUT',
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const ackData = await ackRes.json();
    console.log('✅ Acknowledged:', ackRes.status, `PO Status: ${ackData.po.status}\n`);
    if (ackRes.status !== 200) {
      throw new Error(`Expected status 200, got ${ackRes.status}`);
    }

    // 7. Submit ASN (Advanced Shipping Notification)
    console.log(`➡️ 7. Submitting ASN for PO ${poId}...`);
    const asnPayload = {
      carrierName: 'SafeExpress Logistics',
      trackingNumber: 'TRK99882211',
      vehicleNumber: 'MH-12-PQ-8899',
      invoiceReference: 'INV-TEMP-01',
      ewayBillNo: 'EWAY1122334455',
      shipDate: new Date().toISOString(),
      items: [
        { line: 10, shippedQuantity: 200 },
        { line: 20, shippedQuantity: 50 }
      ]
    };
    const asnRes = await fetch(`${BACKEND_URL}/pos/${poId}/asn`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': MOCK_VENDOR.vendorId 
      },
      body: JSON.stringify(asnPayload)
    });
    const asnData = await asnRes.json();
    const asnId = asnData.asn.id;
    console.log('✅ ASN Submitted:', asnRes.status, `ASN ID: ${asnId}, PO Status: Dispatched. Good Receipt simulated in 10s...\n`);
    if (asnRes.status !== 201) {
      throw new Error(`Expected status 201, got ${asnRes.status}`);
    }

    // 8. Wait 11 seconds for simulated GRN
    console.log('⏳ Waiting 11 seconds for simulated Goods Receipt Note (GRN)...');
    await new Promise(resolve => setTimeout(resolve, 11000));

    // 9. Fetch GRNs
    console.log('\n➡️ 9. Fetching GRNs...');
    const grnListRes = await fetch(`${BACKEND_URL}/grns`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const grnListData = await grnListRes.json();
    const activeGrn = grnListData.grns.find(g => g.asnId === asnId);
    if (!activeGrn) {
      throw new Error(`Simulated GRN for ASN ${asnId} was not generated!`);
    }
    console.log('✅ GRN Found:', grnListRes.status, `GRN ID: ${activeGrn.id}, MIGO Doc: ${activeGrn.sapMigoDoc}`);
    console.log('GRN Items:', JSON.stringify(activeGrn.items, null, 2), '\n');

    // Double check PO status
    const getPoRes = await fetch(`${BACKEND_URL}/pos/${poId}`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const poCheckData = await getPoRes.json();
    console.log(`PO status check: ${poCheckData.status} (grnQuantity for line 10 = ${poCheckData.items[0].grnQuantity})\n`);
    if (poCheckData.status !== 'Delivered') {
      throw new Error(`Expected PO status 'Delivered', got '${poCheckData.status}'`);
    }

    // 10. Submit Invoice
    console.log(`➡️ 10. Submitting Invoice for GRN ${activeGrn.id}...`);
    const invoicePayload = {
      grnId: activeGrn.id,
      invoiceNumber: 'INV/2026/089',
      invoiceDate: new Date().toISOString(),
      subTotal: 200 * 115 + 50 * 78, // matching prices exactly
      taxAmount: (200 * 115 + 50 * 78) * 0.18,
      totalAmount: (200 * 115 + 50 * 78) * 1.18 + 1500, // including freight
      items: [
        { line: 10, materialCode: 'MAT-3849', quantity: 200, unitPrice: 115, amount: 200 * 115 },
        { line: 20, materialCode: 'MAT-9210', quantity: 50, unitPrice: 78, amount: 50 * 78 }
      ]
    };
    const invRes = await fetch(`${BACKEND_URL}/invoices`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': MOCK_VENDOR.vendorId 
      },
      body: JSON.stringify(invoicePayload)
    });
    const invData = await invRes.json();
    const invoiceId = invData.invoice.id;
    console.log('✅ Invoice Submitted:', invRes.status, `Invoice ID: ${invoiceId}, MIRO Doc: ${invData.invoice.sapMiroDoc}, Match Status: ${invData.invoice.status}. Payment scheduled in 12s...\n`);
    if (invRes.status !== 201) {
      throw new Error(`Expected status 201, got ${invRes.status}`);
    }

    // 11. Wait 13 seconds for auto-payment run
    console.log('⏳ Waiting 13 seconds for simulated F110 Payment Run...');
    await new Promise(resolve => setTimeout(resolve, 13000));

    // 12. Fetch Payment records
    console.log('\n➡️ 12. Fetching Payment records...');
    const payRes = await fetch(`${BACKEND_URL}/payments`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const payData = await payRes.json();
    const activePayment = payData.payments.find(p => p.invoiceId === invoiceId);
    if (!activePayment) {
      throw new Error(`Simulated Payment for Invoice ${invoiceId} was not generated!`);
    }
    console.log('✅ Payment Found:', payRes.status, `Payment ID: ${activePayment.id}, UTR: ${activePayment.utrCode}, Net Amount: ${activePayment.netAmount}, TDS Deducted: ${activePayment.tdsDeducted}`);
    console.log(`Quarter: ${activePayment.quarter}, Fiscal Year: ${activePayment.fiscalYear}, TAN: ${activePayment.deductorTan}\n`);

    // Verify Invoice and PO statuses are fully paid
    const checkInvoiceRes = await fetch(`${BACKEND_URL}/invoices/${invoiceId}`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const invFinal = await checkInvoiceRes.json();
    const checkPoRes = await fetch(`${BACKEND_URL}/pos/${poId}`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.vendorId }
    });
    const poFinal = await checkPoRes.json();

    console.log(`🏁 Final Status Summary:`);
    console.log(`   - Invoice Status: ${invFinal.status} (Expected: Cleared)`);
    console.log(`   - PO Status: ${poFinal.status} (Expected: Paid)\n`);

    if (invFinal.status !== 'Cleared') {
      throw new Error(`Expected Invoice status 'Cleared', got '${invFinal.status}'`);
    }
    if (poFinal.status !== 'Paid') {
      throw new Error(`Expected PO status 'Paid', got '${poFinal.status}'`);
    }

    console.log('🎉 E2E Procure-to-Pay Backend Verification Completed Successfully with 0 errors!');
  } catch (error) {
    console.error('\n❌ Test execution failed with error:', error);
    process.exit(1);
  }
}

runTests();
