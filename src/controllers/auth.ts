import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  logout,
  processLogin,
  processRegistration,
  refreshAccessToken,
} from '../services/auth';
import { ValidationError } from '../errors/AppError';
import { logger } from '../config/logger';

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ValidationError('Email and password are required')
    );
  }

  try {
    const result = await processLogin(email, password);

    res.cookie('access_token', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
};

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ValidationError('Email and password are required')
    );
  }

  try {
    const user = await processRegistration(email, password);
    return res.status(StatusCodes.CREATED).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return next(new ValidationError('Refresh token is required'));
  }

  try {
    const result = await refreshAccessToken(refreshToken);

    // Set new access token as cookie
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    // Note: We're not setting a new refresh token since our service doesn't generate one
    // The existing refresh token in the cookie remains valid

    return res.status(StatusCodes.OK).json({
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refresh_token;

  if (refreshToken) {
    try {
      await logout(refreshToken);
    } catch (error) {
      // Continue even if there's an error with the token
      logger.error('Error during logout:', error);
    }
  }

  // Clear cookies regardless
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', {
    path: '/api/auth/refresh-token',
  });

  return res.status(StatusCodes.OK).json({
    message: 'Logged out successfully',
  });
};
