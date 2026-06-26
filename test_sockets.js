const { io } = require('socket.io-client');
const http = require('http');

const SOCKET_URL = 'http://localhost:5000';
const VENDOR_ID = 'mock_vendor_test_123';

console.log(`🔌 Initializing client socket connection to: ${SOCKET_URL}`);
console.log(`🏢 Joining vendor room: ${VENDOR_ID}`);

const socket = io(SOCKET_URL, {
  auth: {
    vendorId: VENDOR_ID
  },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log(`✅ Connected successfully to Socket.io backend! Socket ID: ${socket.id}`);
  console.log('📡 Listening for real-time events (chat:message, log:new)...');
  
  // Wait 1.5 seconds and trigger a test chat message via POST API
  setTimeout(triggerChatMessage, 1500);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log(`🔌 Disconnected from socket server. Reason: ${reason}`);
});

socket.on('chat:message', (data) => {
  console.log(`\n💬 [SOCKET EVENT - chat:message]`);
  console.log(`   From: ${data.sender} | Message: ${data.message}`);
});

socket.on('log:new', (data) => {
  console.log(`\n⚙️ [SOCKET EVENT - log:new]`);
  console.log(`   Type: ${data.type} | Name: ${data.name}`);
});

function triggerChatMessage() {
  console.log('\n✉️ Triggering HTTP POST /api/chats to send vendor message...');
  
  const payload = JSON.stringify({
    message: "Is there a delay on delivery?"
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/chats',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'x-vendor-id': VENDOR_ID
    }
  };
  
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`📥 HTTP Response received. Status: ${res.statusCode}`);
      console.log(`   Payload: ${body}`);
      console.log('\n⏳ Waiting for simulated buyer auto-reply socket event...');
    });
  });
  
  req.on('error', (e) => {
    console.error(`❌ HTTP Request Error: ${e.message}`);
  });
  
  req.write(payload);
  req.end();
}

// Timeout to exit script after 6 seconds
setTimeout(() => {
  console.log('\n⏱️ Testing complete. Disconnecting socket client...');
  socket.disconnect();
  process.exit(0);
}, 6000);
