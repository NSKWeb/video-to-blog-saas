/**
 * Centralized configuration management for the video-to-blog application.
 * Validates required environment variables on startup.
 */

interface AppConfig {
  database: {
    url: string;
  };
  openai: {
    apiKey: string;
    model: string;
    maxRetries: number;
    timeout: number;
  };
  deepgram: {
    apiKey: string;
    model: string;
    language: string;
    timeout: number;
  };
  wordpress: {
    siteUrl?: string;
    username?: string;
    appPassword?: string;
  };
  app: {
    nodeEnv: string;
    logLevel: string;
    apiTimeout: number;
    maxVideoSize: string;
  };
}

/**
 * Validates that a required environment variable exists and is not empty.
 * Throws an error if validation fails.
 */
function validateRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value.
 */
function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Loads and validates all application configuration.
 * Call this at application startup to fail fast on missing configuration.
 */
export function loadConfig(): AppConfig {
  try {
    const config: AppConfig = {
      database: {
        url: validateRequiredEnv('DATABASE_URL'),
      },
      openai: {
        apiKey: validateRequiredEnv('OPENAI_API_KEY'),
        model: getOptionalEnv('OPENAI_MODEL', 'gpt-4o-mini'),
        maxRetries: parseInt(getOptionalEnv('OPENAI_MAX_RETRIES', '3'), 10),
        timeout: parseInt(getOptionalEnv('OPENAI_TIMEOUT', '60000'), 10),
      },
      deepgram: {
        apiKey: validateRequiredEnv('DEEPGRAM_API_KEY'),
        model: getOptionalEnv('DEEPGRAM_MODEL', 'nova-2'),
        language: getOptionalEnv('DEEPGRAM_LANGUAGE', 'en-US'),
        timeout: parseInt(getOptionalEnv('DEEPGRAM_TIMEOUT', '30000'), 10),
      },
      wordpress: {
        siteUrl: getOptionalEnv('WORDPRESS_SITE_URL'),
        username: getOptionalEnv('WORDPRESS_USERNAME'),
        appPassword: getOptionalEnv('WORDPRESS_APP_PASSWORD'),
      },
      app: {
        nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
        logLevel: getOptionalEnv('LOG_LEVEL', 'info'),
        apiTimeout: parseInt(getOptionalEnv('API_TIMEOUT', '30000'), 10),
        maxVideoSize: getOptionalEnv('MAX_VIDEO_SIZE', '500MB'),
      },
    };

    // Validate WordPress config is complete if any field is provided
    const wpConfigured = config.wordpress.siteUrl || config.wordpress.username || config.wordpress.appPassword;
    if (wpConfigured) {
      if (!config.wordpress.siteUrl) {
        throw new Error('WORDPRESS_SITE_URL is required when WordPress integration is configured');
      }
      if (!config.wordpress.username) {
        throw new Error('WORDPRESS_USERNAME is required when WordPress integration is configured');
      }
      if (!config.wordpress.appPassword) {
        throw new Error('WORDPRESS_APP_PASSWORD is required when WordPress integration is configured');
      }
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Configuration error: ${error.message}`);
    }
    throw new Error('Unknown configuration error');
  }
}

/**
 * Singleton configuration instance.
 * Initialized on first access.
 */
let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

/**
 * Reload configuration (useful for testing or dynamic config updates).
 */
export function reloadConfig(): AppConfig {
  cachedConfig = null;
  return getConfig();
}

/**
 * Check if we're running in development mode.
 */
export function isDevelopment(): boolean {
  return getConfig().app.nodeEnv === 'development';
}

/**
 * Check if we're running in production mode.
 */
export function isProduction(): boolean {
  return getConfig().app.nodeEnv === 'production';
}
