const mongoose = require('mongoose');

// Connects to MongoDB using the URI in the environment config.
// Keeping this isolated makes it easy to mock in tests or swap
// connection options (replica sets, Atlas, etc.) later.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.warn('Running without MongoDB connection. Mock/sample data fallbacks will serve client requests.');
  }
};

module.exports = connectDB;
