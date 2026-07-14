const EVENTS = {
  PO_NEW:           'po:new',
  GRN_RECEIVED:     'grn:received',
  PAYMENT_CLEARED:  'payment:cleared',
  RFQ_AWARDED:      'rfq:awarded',
  BID_RECEIVED:     'rfq:bid_received',
  CHAT_MESSAGE:     'chat:message',
  VENDOR_APPROVED:  'vendor:approved',
  LOG_NEW:          'log:new',
};

// Emit to a specific vendor's room
const emitToVendor = (io, clerkUserId, event, data) => {
  if (io && clerkUserId) {
    console.log(`[SocketEmitter] Emitting event "${event}" to vendor room: ${clerkUserId}`);
    io.to(clerkUserId).emit(event, data);
  }
};

// Emit to all procurement staff
const emitToProcurement = (io, event, data) => {
  if (io) {
    console.log(`[SocketEmitter] Emitting event "${event}" to procurement room`);
    io.to('procurement').emit(event, data);
  }
};

module.exports = { EVENTS, emitToVendor, emitToProcurement };
