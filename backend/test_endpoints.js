const BACKEND_URL = 'http://localhost:5000/api';
const MOCK_VENDOR = {
  clerkId: 'mock_vendor_' + Math.floor(Math.random() * 100000),
  companyName: 'Acme Test Corp',
  gstin: '27ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'A1Z' + Math.floor(1 + Math.random() * 9),
  pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
  email: 'test_acme_' + Math.floor(Math.random() * 100000) + '@example.com',
  phone: '9876543210',
  address: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India'
  },
  bankDetails: {
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    ifscCode: 'TEST0001234',
    accountType: 'Current'
  },
  vendorCategory: 'Raw Materials',
  msmeRegistered: true
};

async function runTests() {
  console.log('🏁 Starting End-to-End Backend Verification Tests...\n');

  try {
    // 1. Create vendor profile
    console.log(`➡️ Creating vendor profile for Clerk ID: ${MOCK_VENDOR.clerkId}...`);
    const createRes = await fetch(`${BACKEND_URL}/vendors/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MOCK_VENDOR)
    });
    const createData = await createRes.json();
    console.log('✅ Response:', createRes.status, createData);

    if (createRes.status !== 201) {
      throw new Error(`Expected status 201, got ${createRes.status}`);
    }

    const vendorDbId = createData._id;

    // 2. Get profile (should be Pending)
    console.log('\n➡️ Retrieving profile...');
    const getRes = await fetch(`${BACKEND_URL}/vendors/profile`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.clerkId }
    });
    const getData = await getRes.json();
    console.log('✅ Response (Status should be Pending):', getRes.status, `Status: ${getData.status}`);

    if (getData.status !== 'Pending') {
      throw new Error(`Expected status 'Pending', got '${getData.status}'`);
    }

    // 3. Submit registration
    console.log('\n➡️ Submitting registration for approval...');
    const submitRes = await fetch(`${BACKEND_URL}/vendors/profile/submit`, {
      method: 'POST',
      headers: { 'x-vendor-id': MOCK_VENDOR.clerkId }
    });
    const submitData = await submitRes.json();
    console.log('✅ Response (Status should be Under Review):', submitRes.status, `Status: ${submitData.vendor.status}`);

    if (submitData.vendor.status !== 'Under Review') {
      throw new Error(`Expected status 'Under Review', got '${submitData.vendor.status}'`);
    }

    // 4. Wait 5.5 seconds for auto-approval simulation
    console.log('\n⏳ Waiting 5.5 seconds for SAP simulated approval to complete...');
    await new Promise(resolve => setTimeout(resolve, 5500));

    // 5. Get profile again (should be Approved with SAP Vendor Code)
    console.log('\n➡️ Checking profile status after auto-approval delay...');
    const getRes2 = await fetch(`${BACKEND_URL}/vendors/profile`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.clerkId }
    });
    const getData2 = await getRes2.json();
    console.log('✅ Response (Status should be Approved with Vendor Code):', getRes2.status, `Status: ${getData2.status}, sapVendorCode: ${getData2.sapVendorCode}`);

    if (getData2.status !== 'Approved') {
      throw new Error(`Expected status 'Approved', got '${getData2.status}'`);
    }
    if (!getData2.sapVendorCode) {
      throw new Error(`Expected sapVendorCode to be assigned, got empty`);
    }

    // 6. Get vendor performance
    console.log('\n➡️ Fetching vendor performance scores...');
    const perfRes = await fetch(`${BACKEND_URL}/vendors/performance`, {
      headers: { 'x-vendor-id': MOCK_VENDOR.clerkId }
    });
    const perfData = await perfRes.json();
    console.log('✅ Response:', perfRes.status, perfData);

    if (perfRes.status !== 200) {
      throw new Error(`Expected status 200, got ${perfRes.status}`);
    }

    // 7. Get admin vendors list
    console.log('\n➡️ [Admin] Listing all vendors...');
    const listRes = await fetch(`${BACKEND_URL}/vendors`);
    const listData = await listRes.json();
    console.log('✅ Response:', listRes.status, `Total Vendors found: ${listData.pagination.total}`);

    if (listRes.status !== 200) {
      throw new Error(`Expected status 200, got ${listRes.status}`);
    }

    console.log('\n🎉 End-to-End Backend Verification Tests Completed Successfully!');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

runTests();
