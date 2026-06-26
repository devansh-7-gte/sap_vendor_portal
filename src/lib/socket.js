import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token, vendorId) => {
  if (socket?.connected) return socket;
  
  // Clean up any existing connection just in case
  if (socket) {
    socket.disconnect();
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  console.log(`[Socket.io] Connecting to ${apiUrl}...`);
  
  socket = io(apiUrl, {
    auth: { 
      token,
      vendorId: vendorId || (typeof window !== 'undefined' ? localStorage.getItem('clerk_user_id') : null)
    },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log(`[Socket.io] Connected successfully! ID: ${socket.id}`);
  });

  socket.on('connect_error', (err) => {
    console.error(`[Socket.io] Connection error:`, err);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Disconnected: ${reason}`);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    console.log(`[Socket.io] Disconnecting socket connection...`);
    socket.disconnect();
    socket = null;
  }
};
