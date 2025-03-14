import { getUserProfile, updateUserProfile } from './user';
import { findUserById, updateUser } from '../repository/user';
import { ResourceNotFoundError } from '../errors/AppError';

// Mock the dependencies
jest.mock('../repository/user');
jest.mock('../config/logger');

describe('User Service', () => {
  // Mock user data
  const mockUser = {
    _id: '123',
    email: 'test@example.com',
    name: 'Test User',
    profilePicture: 'https://example.com/pic.jpg',
    bio: 'Test bio',
    location: 'Test location',
    socialLinks: {
      twitter: 'https://twitter.com/test',
      facebook: 'https://facebook.com/test',
    },
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      // Mock the findUserById implementation
      (findUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserProfile('123');

      expect(findUserById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw ResourceNotFoundError when user does not exist', async () => {
      // Mock the findUserById implementation to return null
      (findUserById as jest.Mock).mockResolvedValue(null);

      await expect(getUserProfile('123')).rejects.toThrow(
        ResourceNotFoundError
      );
      expect(findUserById).toHaveBeenCalledWith('123');
    });

    it('should propagate errors from repository layer', async () => {
      const error = new Error('Database error');
      (findUserById as jest.Mock).mockRejectedValue(error);

      await expect(getUserProfile('123')).rejects.toThrow(error);
      expect(findUserById).toHaveBeenCalledWith('123');
    });
  });

  describe('updateUserProfile', () => {
    const updateData = {
      name: 'Updated Name',
      bio: 'Updated bio',
      socialLinks: {
        twitter: 'https://twitter.com/updated',
        facebook: 'https://facebook.com/updated',
      },
      preferences: {
        theme: 'light',
        notifications: false,
      },
    };

    it('should successfully update user profile', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserProfile('123', updateData);

      expect(updateUser).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          name: 'Updated Name',
          bio: 'Updated bio',
        })
      );
      expect(result).toEqual(updatedUser);
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdate = {
        name: 'Updated Name',
      };
      const updatedUser = { ...mockUser, ...partialUpdate };
      (updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserProfile('123', partialUpdate);

      expect(updateUser).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          name: 'Updated Name',
        })
      );
      expect(result).toEqual(updatedUser);
    });

    it('should handle nested object updates correctly', async () => {
      const nestedUpdate = {
        socialLinks: {
          twitter: 'https://twitter.com/new',
        },
        preferences: {
          theme: 'dark',
        },
      };
      const updatedUser = { ...mockUser, ...nestedUpdate };
      (updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserProfile('123', nestedUpdate);

      expect(updateUser).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          socialLinks: expect.objectContaining({
            twitter: 'https://twitter.com/new',
          }),
          preferences: expect.objectContaining({
            theme: 'dark',
          }),
        })
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw ResourceNotFoundError when user does not exist during update', async () => {
      (updateUser as jest.Mock).mockResolvedValue(null);

      await expect(
        updateUserProfile('123', updateData)
      ).rejects.toThrow(ResourceNotFoundError);
      expect(updateUser).toHaveBeenCalledWith(
        '123',
        expect.any(Object)
      );
    });

    it('should propagate errors from repository layer during update', async () => {
      const error = new Error('Database error');
      (updateUser as jest.Mock).mockRejectedValue(error);

      await expect(
        updateUserProfile('123', updateData)
      ).rejects.toThrow(error);
      expect(updateUser).toHaveBeenCalledWith(
        '123',
        expect.any(Object)
      );
    });
  });
});
