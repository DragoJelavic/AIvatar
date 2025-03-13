import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import {
  AuthenticationError,
  ResourceConflictError,
  ResourceNotFoundError,
  InvalidTokenError,
  InternalError,
} from '../errors/AppError';
import {
  processRegistration,
  processLogin,
  refreshAccessToken,
  logout,
} from './auth';

// Mock dependencies
jest.mock('../auth/utils/password', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('../config/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Import mocked modules
const {
  hashPassword,
  comparePassword,
} = require('../auth/utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processRegistration', () => {
    it('should create a new user when email does not exist', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const userId = 'user_id_123';

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: userId,
        email,
        password: hashedPassword,
        name: 'Test User',
        avatars: { small: 'small.jpg', medium: 'medium.jpg' },
      } as any);

      hashPassword.mockResolvedValue(hashedPassword);

      // Act
      const result = await processRegistration(email, password);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(hashPassword).toHaveBeenCalledWith(password);
      expect(User.create).toHaveBeenCalledWith({
        email,
        password: hashedPassword,
      });

      expect(result).toEqual({
        id: userId,
        email,
        name: 'Test User',
        avatars: { small: 'small.jpg', medium: 'medium.jpg' },
      });
    });

    it('should throw ResourceConflictError when user with email already exists', async () => {
      // Arrange
      const email = 'existing@example.com';
      const password = 'password123';

      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: 'existing_id',
        email,
      });

      // Act & Assert
      await expect(
        processRegistration(email, password)
      ).rejects.toThrow(ResourceConflictError);

      await expect(
        processRegistration(email, password)
      ).rejects.toThrow('User with this email already exists');

      expect(User.findOne).toHaveBeenCalledWith({ email });
    });

    it('should handle unexpected errors during registration', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const unexpectedError = new Error('Database connection failed');

      jest.spyOn(User, 'findOne').mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(
        processRegistration(email, password)
      ).rejects.toThrow(InternalError);

      await expect(
        processRegistration(email, password)
      ).rejects.toThrow('Error creating user');
    });
  });

  describe('processLogin', () => {
    it('should successfully login a user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const userId = 'user_id_123';
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_123';

      const mockUser = {
        _id: userId,
        email,
        password: 'hashed_password',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateAccessToken.mockReturnValue(accessToken);
      generateRefreshToken.mockReturnValue(refreshToken);
      jest.spyOn(RefreshToken, 'create').mockResolvedValue({
        userId,
        token: refreshToken,
        expiresAt: expect.any(Date),
      } as any);

      // Act
      const result = await processLogin(email, password);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(comparePassword).toHaveBeenCalledWith(
        password,
        mockUser.password
      );
      expect(generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(RefreshToken.create).toHaveBeenCalledWith({
        userId: mockUser._id,
        token: refreshToken,
        expiresAt: expect.any(Date),
      });

      expect(result).toEqual({
        user: {
          id: userId,
          email,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    });

    it('should throw AuthenticationError when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(processLogin(email, password)).rejects.toThrow(
        AuthenticationError
      );

      await expect(processLogin(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw AuthenticationError when password is incorrect', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong_password';

      jest.spyOn(User, 'findOne').mockResolvedValue({
        _id: 'user_id',
        email,
        password: 'hashed_password',
      });

      comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(processLogin(email, password)).rejects.toThrow(
        AuthenticationError
      );

      await expect(processLogin(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should handle unexpected errors during login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const unexpectedError = new Error('Database connection failed');

      jest.spyOn(User, 'findOne').mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(processLogin(email, password)).rejects.toThrow(
        InternalError
      );

      await expect(processLogin(email, password)).rejects.toThrow(
        'Error logging user'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate a new access token with valid refresh token', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      const userId = 'user_id_123';
      const newAccessToken = 'new_access_token';

      verifyRefreshToken.mockReturnValue({ userId });

      jest.spyOn(RefreshToken, 'findOne').mockResolvedValue({
        userId,
        token: refreshToken,
      });

      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: userId,
        email: 'test@example.com',
      });

      generateAccessToken.mockReturnValue(newAccessToken);

      // Act
      const result = await refreshAccessToken(refreshToken);

      // Assert
      expect(verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(RefreshToken.findOne).toHaveBeenCalledWith({
        token: refreshToken,
      });
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ _id: userId })
      );

      expect(result).toEqual({
        accessToken: newAccessToken,
      });
    });

    it('should throw InvalidTokenError when refresh token is not found in database', async () => {
      // Arrange
      const refreshToken = 'invalid_refresh_token';

      verifyRefreshToken.mockReturnValue({ userId: 'user_id' });
      jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        InvalidTokenError
      );

      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw ResourceNotFoundError when user is not found', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      const userId = 'nonexistent_user_id';

      verifyRefreshToken.mockReturnValue({ userId });

      jest.spyOn(RefreshToken, 'findOne').mockResolvedValue({
        userId,
        token: refreshToken,
      });

      jest.spyOn(User, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        ResourceNotFoundError
      );

      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout a user with valid refresh token', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';

      jest.spyOn(RefreshToken, 'findOneAndDelete').mockResolvedValue({
        userId: 'user_id',
        token: refreshToken,
      });

      // Act
      const result = await logout(refreshToken);

      // Assert
      expect(RefreshToken.findOneAndDelete).toHaveBeenCalledWith({
        token: refreshToken,
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw InvalidTokenError when refresh token is not found', async () => {
      // Arrange
      const refreshToken = 'invalid_refresh_token';

      jest
        .spyOn(RefreshToken, 'findOneAndDelete')
        .mockResolvedValue(null);

      // Act & Assert
      await expect(logout(refreshToken)).rejects.toThrow(
        InvalidTokenError
      );

      await expect(logout(refreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should handle unexpected errors during logout', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      const unexpectedError = new Error('Database connection failed');

      jest
        .spyOn(RefreshToken, 'findOneAndDelete')
        .mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(logout(refreshToken)).rejects.toThrow(
        InternalError
      );

      await expect(logout(refreshToken)).rejects.toThrow(
        'Error logging out user'
      );
    });
  });
});
