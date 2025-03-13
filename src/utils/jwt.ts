import jwt from 'jsonwebtoken';
import { IUser } from '../entities/User';

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';

export const generateAccessToken = (user: IUser) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: IUser) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
