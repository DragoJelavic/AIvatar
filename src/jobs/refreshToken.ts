import { logger } from '../config/logger';
import { RefreshToken } from '../entities/RefreshToken';

export const cleanupExpiredTokens = async () => {
  try {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
};
