import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError';
import { logger } from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isAppError =
    err instanceof AppError ||
    (err &&
      typeof err === 'object' &&
      'code' in err &&
      'statusCode' in err);

  const path = req.path || req.url;

  logger.error(
    `${isAppError ? (err as AppError).code : 'ERROR'}: ${
      err.message
    }`,
    {
      ...(isAppError
        ? {
            code: (err as AppError).code,
            statusCode: (err as AppError).statusCode,
            isOperational: (err as AppError).isOperational,
          }
        : {}),
      stack: err.stack,
      path: path,
      method: req.method,
    }
  );

  if (isAppError) {
    const appError = err as AppError;
    return res.status(appError.statusCode).json({
      status: 'error',
      code: appError.code,
      message: appError.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    code: ErrorCode.INTERNAL_ERROR,
    message: 'Internal server error',
  });
};
