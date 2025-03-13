import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Authentication required',
    });
  }

  try {
    const decoded = verifyAccessToken(token) as {
      userId: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid or expired token',
    });
  }
};
