import {
  comparePassword,
  hashPassword,
} from '../auth/utils/password';
import { logger } from '../config/logger';
import { RefreshToken } from '../entities/RefreshToken';
import { User, IUser } from '../entities/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  AuthenticationError,
  ResourceConflictError,
  ResourceNotFoundError,
  InvalidTokenError,
  InternalError,
  AppError,
} from '../errors/AppError';

export const processRegistration = async (
  email: string,
  password: string
) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ResourceConflictError(
        'User with this email already exists'
      );
    }

    const hashedPassword = await hashPassword(password);
    const user: IUser = await User.create({
      email,
      password: hashedPassword,
    });

    // Return sanitized user object without password
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatars: user.avatars,
    };
  } catch (error) {
    if (!(error instanceof AppError)) {
      logger.error('Unexpected error creating user:', error);
      throw new InternalError('Error creating user');
    }

    throw error;
  }
};

export const processLogin = async (
  email: string,
  password: string
) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.info('User not found for email:', email);
      throw new AuthenticationError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      logger.info('Incorrect password for user:', email);
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    if (!(error instanceof AppError)) {
      logger.error('Unexpected error logging user:', error);
      throw new InternalError('Error logging user');
    }

    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken) as {
      userId: string;
    };

    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
    });
    if (!tokenDoc) {
      throw new InvalidTokenError('Invalid refresh token');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new ResourceNotFoundError('User not found');
    }

    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    if (!(error instanceof AppError)) {
      logger.error('Unexpected error refreshing token:', error);
      throw new InternalError('Error refreshing token');
    }

    throw error;
  }
};

export const logout = async (refreshToken: string) => {
  try {
    const result = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });
    if (!result) {
      throw new InvalidTokenError('Invalid refresh token');
    }
    return { success: true };
  } catch (error) {
    if (!(error instanceof AppError)) {
      logger.error('Unexpected error logging out user:', error);
      throw new InternalError('Error logging out user');
    }

    throw error;
  }
};
