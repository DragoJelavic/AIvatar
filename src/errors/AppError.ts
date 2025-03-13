export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    isOperational = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capturing stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.VALIDATION_ERROR, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403);
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.RESOURCE_NOT_FOUND, 404);
  }
}

export class ResourceConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.RESOURCE_CONFLICT, 409);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.INVALID_TOKEN, 401);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.TOKEN_EXPIRED, 401);
  }
}

export class InternalError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, false);
  }
}
