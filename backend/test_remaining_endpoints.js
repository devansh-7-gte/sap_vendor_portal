const BACKEND_URL = 'http://127.0.0.1:5000/api';

async function testRemaining() {
  console.log('🏁 Starting Verification for remaining endpoints...\n');
  const vendorId = 'mock_test_remaining_' + Math.floor(Math.random() * 100000);
  const MOCK_VENDOR = {
    vendorId,
    companyName: 'Remaining Test Corp',
    gstin: '27ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'A1Z' + Math.floor(1 + Math.random() * 9),
    pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
    email: 'test_rem_' + Math.floor(Math.random() * 100000) + '@example.com',
    phone: '9876543210'
  };

  try {
    // 1. Create a vendor profile first (POST /vendors/profile)
    console.log(`➡️ 1. Creating vendor profile...`);
    const createRes = await fetch(`${BACKEND_URL}/vendors/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MOCK_VENDOR)
    });
    const createData = await createRes.json();
    if (createRes.status !== 201) throw new Error(`Create failed: ${createRes.status} ${JSON.stringify(createData)}`);
    console.log('✅ Vendor created successfully.', createData._id);
    const vendorDbId = createData._id;

    // 2. Test PUT /vendors/profile (updateProfile)
    console.log(`\n➡️ 2. Testing PUT /vendors/profile (updateProfile)...`);
    const updatePayload = {
      phone: '9876543219',
      address: {
        street: '789 Upper St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    };
    const updateRes = await fetch(`${BACKEND_URL}/vendors/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify(updatePayload)
    });
    const updateData = await updateRes.json();
    console.log('✅ Response:', updateRes.status, updateData.phone, updateData.address);
    if (updateRes.status !== 200) throw new Error(`Update profile failed`);
    if (updateData.phone !== '9876543219') throw new Error(`Phone was not updated`);

    // 3. Test PUT /vendors/:id/reject (rejectVendor)
    console.log(`\n➡️ 3. Testing PUT /vendors/:id/reject (rejectVendor)...`);
    const rejectPayload = {
      reason: 'Missing ISO Certificate doc copy.'
    };
    const rejectRes = await fetch(`${BACKEND_URL}/vendors/${vendorDbId}/reject`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify(rejectPayload)
    });
    const rejectData = await rejectRes.json();
    console.log('✅ Response:', rejectRes.status, rejectData.vendor.status, rejectData.vendor.rejectionReason);
    if (rejectRes.status !== 200) throw new Error(`Reject vendor failed`);
    if (rejectData.vendor.status !== 'Rejected') throw new Error(`Status should be Rejected`);

    // 3b. Test PUT /vendors/:id/reject validation (rejectVendor without reason)
    console.log(`\n➡️ 3b. Testing PUT /vendors/:id/reject validation error (no reason)...`);
    const badRejectRes = await fetch(`${BACKEND_URL}/vendors/${vendorDbId}/reject`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify({})
    });
    const badRejectData = await badRejectRes.json();
    console.log('✅ Response (expected 400):', badRejectRes.status, badRejectData);
    if (badRejectRes.status !== 400) throw new Error(`Expected 400 validation error`);

    // 4. Create an RFQ to test reissue
    console.log(`\n➡️ 4. Creating temporary RFQ...`);
    const rfqPayload = {
      description: 'Reissue Test RFQ',
      deadlineDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      items: [
        { line: 10, materialCode: 'MAT-3849', quantity: 100 }
      ]
    };
    const rfqCreateRes = await fetch(`${BACKEND_URL}/rfqs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify(rfqPayload)
    });
    const rfqCreateData = await rfqCreateRes.json();
    console.log('✅ RFQ Created:', rfqCreateRes.status, rfqCreateData.id);
    const rfqId = rfqCreateData.id;

    // 5. Test PUT /rfqs/:id/reissue (reissueRFQ)
    console.log(`\n➡️ 5. Testing PUT /rfqs/:id/reissue (reissueRFQ)...`);
    const newDeadline = new Date(Date.now() + 86400000 * 10).toISOString();
    const reissueRes = await fetch(`${BACKEND_URL}/rfqs/${rfqId}/reissue`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify({ deadlineDate: newDeadline })
    });
    const reissueData = await reissueRes.json();
    console.log('✅ Response:', reissueRes.status, reissueData.rfq.status, reissueData.rfq.deadlineDate);
    if (reissueRes.status !== 200) throw new Error(`Reissue RFQ failed`);

    // 6. Test POST /chats (sendMessage)
    console.log(`\n➡️ 6. Testing POST /chats (sendMessage)...`);
    const chatPayload = {
      message: 'Hello, this is a test inquiry about price mismatch.'
    };
    const chatRes = await fetch(`${BACKEND_URL}/chats`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify(chatPayload)
    });
    const chatData = await chatRes.json();
    console.log('✅ Response:', chatRes.status, chatData.message, chatData.sender);
    if (chatRes.status !== 201) throw new Error(`Send chat message failed`);

    // 6b. Test POST /chats validation error (empty message)
    console.log(`\n➡️ 6b. Testing POST /chats validation error (empty message)...`);
    const badChatRes = await fetch(`${BACKEND_URL}/chats`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      },
      body: JSON.stringify({ message: '' })
    });
    const badChatData = await badChatRes.json();
    console.log('✅ Response (expected 400):', badChatRes.status, badChatData);
    if (badChatRes.status !== 400) throw new Error(`Expected 400 validation error`);

    console.log('\n🎉 All remaining endpoints verified successfully!');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

testRemaining();
