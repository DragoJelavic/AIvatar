import { User, IUser } from '../entities/User';
import { logger } from '../config/logger';

export type UserUpdateData = Partial<
  Pick<
    IUser,
    | 'name'
    | 'profilePicture'
    | 'dateOfBirth'
    | 'bio'
    | 'location'
    | 'phoneNumber'
  >
> & {
  socialLinks?: Partial<{
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  }>;
  preferences?: Partial<{
    theme?: string;
    notifications?: boolean;
  }>;
};

export const findUserById = async (
  userId: string
): Promise<IUser | null> => {
  try {
    return await User.findById(userId).select('-password');
  } catch (error) {
    logger.error(`Error finding user by ID ${userId}:`, error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  updateData: UserUpdateData
): Promise<IUser | null> => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  } catch (error) {
    logger.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};
