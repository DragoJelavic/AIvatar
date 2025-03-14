import {
  findUserById,
  updateUser,
  UserUpdateData,
} from '../repository/user';
import { ResourceNotFoundError } from '../errors/AppError';
import { logger } from '../config/logger';

export const getUserProfile = async (userId: string) => {
  try {
    const user = await findUserById(userId);

    if (!user) {
      throw new ResourceNotFoundError('User not found');
    }

    return user;
  } catch (error) {
    logger.error(
      `Error in getUserProfile service for user ${userId}:`,
      error
    );
    throw error;
  }
};

// Helper function to safely copy fields from source to target
const copyFields = <T extends object, K extends keyof T>(
  source: T,
  target: T,
  fields: readonly K[]
): void => {
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      target[field] = source[field];
    }
  });
};

// Helper function to handle nested objects
const processNestedObject = <T extends object>(
  source: T | undefined,
  fields: readonly (keyof T)[]
): T | undefined => {
  if (!source) return undefined;

  const result = {} as T;
  copyFields(source, result, fields);
  return Object.keys(result).length > 0 ? result : undefined;
};

export const updateUserProfile = async (
  userId: string,
  updateData: UserUpdateData
) => {
  try {
    const processedUpdateData: UserUpdateData = {};

    const basicFields = [
      'name',
      'profilePicture',
      'dateOfBirth',
      'bio',
      'location',
      'phoneNumber',
    ] as const;

    copyFields(updateData, processedUpdateData, basicFields);

    if (updateData.socialLinks) {
      const socialFields = [
        'twitter',
        'facebook',
        'instagram',
        'linkedin',
      ] as const;

      processedUpdateData.socialLinks = processNestedObject(
        updateData.socialLinks,
        socialFields
      );
    }

    // Process preferences
    if (updateData.preferences) {
      const preferenceFields = ['theme', 'notifications'] as const;

      processedUpdateData.preferences = processNestedObject(
        updateData.preferences,
        preferenceFields
      );
    }

    const updatedUser = await updateUser(userId, processedUpdateData);

    if (!updatedUser) {
      throw new ResourceNotFoundError('User not found');
    }

    return updatedUser;
  } catch (error) {
    logger.error(
      `Error in updateUser service for user ${userId}:`,
      error
    );
    throw error;
  }
};
