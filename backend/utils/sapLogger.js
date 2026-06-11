// Helper used by all controllers to log SAP communications
// Note: It dynamically imports SapLog since the model is defined in Day 3.
const createSapLog = async ({ vendorId, type, direction, name, payload, status = 'SUCCESS', documentRef = '' }) => {
  try {
    const SapLog = require('../models/SapLog');
    return await SapLog.create({
      vendorId,
      type,
      direction,
      name,
      payload: typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload,
      status,
      documentRef
    });
  } catch (error) {
    console.error('Failed to create SAP log in DB:', error);
    // Return mock log so app logic doesn't break if db write fails or schema isn't loaded
    return { vendorId, type, direction, name, payload, status, documentRef, timestamp: new Date() };
  }
};

module.exports = { createSapLog };
