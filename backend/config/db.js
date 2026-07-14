const mongoose = require('mongoose');

const connectDB = async () => {
  const connString = process.env.MONGO_URI;
  // Allow mongoose connection error to propagate so server.js can handle it in try/catch
  const conn = await mongoose.connect(connString);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
