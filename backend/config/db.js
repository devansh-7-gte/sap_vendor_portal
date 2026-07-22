const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sap_vendor_portal';
  try {
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 3000
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.warn(`⚠️ Could not connect to MongoDB at ${connString}: ${err.message}. Server running in mock mode.`);
  }
};

module.exports = connectDB;
