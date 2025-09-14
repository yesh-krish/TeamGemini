const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if we want to skip MongoDB for testing
  if (process.env.SKIP_MONGODB === 'true') {
    console.log('🔄 Running in MOCK MODE - MongoDB connection skipped');
    console.log('📝 All database operations will use mock data');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('💡 Tip: Set SKIP_MONGODB=true in .env to run without database');
    process.exit(1);
  }
};

module.exports = connectDB;