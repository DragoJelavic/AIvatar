import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      authSource: 'admin',
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
