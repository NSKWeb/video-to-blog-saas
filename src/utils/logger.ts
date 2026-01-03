/**
 * Logging utility for the video-to-blog application.
 * Uses Winston for structured logging with different log levels.
 */

import winston from 'winston';
import { isDevelopment } from '@/lib/config';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Custom log format for development environments (more readable)
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Custom log format for production environments (structured JSON)
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create Winston logger instance with appropriate format
 */
const createLogger = () => {
  const logLevel = process.env.LOG_LEVEL || 'info';

  return winston.createLogger({
    level: logLevel,
    format: isDevelopment() ? developmentFormat : productionFormat,
    transports: [
      new winston.transports.Console({
        silent: process.env.NODE_ENV === 'test',
      }),
    ],
  });
};

/**
 * Logger instance
 */
const logger = createLogger();

/**
 * Log error messages
 */
export function logError(message: string, meta?: Record<string, unknown>): void {
  logger.error(message, meta);
}

/**
 * Log warning messages
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  logger.warn(message, meta);
}

/**
 * Log info messages
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  logger.info(message, meta);
}

/**
 * Log debug messages
 */
export function logDebug(message: string, meta?: Record<string, unknown>): void {
  logger.debug(message, meta);
}

/**
 * Log HTTP requests
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration?: number,
  meta?: Record<string, unknown>
): void {
  const message = `${method} ${url} - ${statusCode}`;
  logger.info(message, {
    ...meta,
    method,
    url,
    statusCode,
    duration: duration ? `${duration}ms` : undefined,
  });
}

/**
 * Log external service calls (OpenAI, Deepgram, WordPress)
 */
export function logServiceCall(
  service: string,
  action: string,
  duration?: number,
  meta?: Record<string, unknown>
): void {
  logger.info(`${service} ${action}`, {
    ...meta,
    service,
    action,
    duration: duration ? `${duration}ms` : undefined,
  });
}

/**
 * Log database operations
 */
export function logDatabaseOperation(
  operation: string,
  model: string,
  duration?: number,
  meta?: Record<string, unknown>
): void {
  logger.debug(`${operation} ${model}`, {
    ...meta,
    operation,
    model,
    duration: duration ? `${duration}ms` : undefined,
  });
}

/**
 * Log with custom level
 */
export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  logger.log(level, message, meta);
}

export default logger;
