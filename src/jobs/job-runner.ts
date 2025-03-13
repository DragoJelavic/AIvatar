import cron from 'node-cron';
import { cleanupExpiredTokens } from './refreshToken';

export const startJobs = () => {
  // Clear expired refresh tokens: Runs at midnight every day
  cron.schedule('0 0 * * *', () => {
    cleanupExpiredTokens();
  });
};
