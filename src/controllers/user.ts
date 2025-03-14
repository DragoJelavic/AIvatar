import { Request, Response, NextFunction } from 'express';
import { getUserProfile, updateUserProfile } from '../services/user';
import { logger } from '../config/logger';
import {
  AppError,
  ResourceNotFoundError,
  InternalError,
} from '../errors/AppError';

export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    if (!userId) {
      return next(
        new ResourceNotFoundError('User ID not found in request')
      );
    }

    const user = await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error in getUserProfile controller:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new InternalError('Error fetching user profile'));
  }
};

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    if (!userId) {
      return next(
        new ResourceNotFoundError('User ID not found in request')
      );
    }

    const updatedUser = await updateUserProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User profile updated successfully',
    });
  } catch (error) {
    logger.error('Error in updateUser controller:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new InternalError('Error updating user profile'));
  }
};
