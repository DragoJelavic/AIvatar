import mongoose from 'mongoose';
import { logger } from './config/logger';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI, {
      authSource: 'admin',
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
