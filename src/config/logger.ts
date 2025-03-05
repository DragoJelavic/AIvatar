import winston from 'winston';

// Custom log levels
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
};

// Custom colors for each log level
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
};

// Add colors to Winston
winston.addColors(customColors);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    if (meta.error instanceof Error) {
      return `${timestamp} [${level}]: ${message} ${
        meta.error.stack || meta.error.message
      }`;
    }

    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: customLevels,
  transports: [consoleTransport],
});
