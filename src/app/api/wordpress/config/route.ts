import { NextRequest } from 'next/server';
import { createdResponse, successResponse } from '@/utils/api-response';
import { ValidationError, ExternalServiceError, handleApiError } from '@/utils/error-handler';
import { logInfo, logError } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { testWordPressConnectionForUser } from '@/lib/wordpress-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteUrl, username, appPassword } = body;

    if (!siteUrl || !username || !appPassword) {
      throw new ValidationError('siteUrl, username, and appPassword are required');
    }

    if (typeof siteUrl !== 'string' || !siteUrl.match(/^https?:\/\/.+/)) {
      throw new ValidationError('Invalid siteUrl format');
    }

    logInfo('Testing WordPress connection', { siteUrl, username });

    const wpConfig = { siteUrl, username, appPassword };

    const isValid = await testWordPressConnectionForUser('system', wpConfig);

    if (!isValid) {
      throw new ExternalServiceError('WORDPRESS', 'Invalid credentials or site unreachable');
    }

    logInfo('WordPress connection verified, saving config');

    const userId = 'system'; // TODO: Get from authenticated user

    const existingConfig = await prisma.wordPressConfig.findUnique({
      where: { userId },
    });

    let savedConfig;
    if (existingConfig) {
      savedConfig = await prisma.wordPressConfig.update({
        where: { userId },
        data: {
          siteUrl,
          username,
          appPassword,
        },
      });
      logInfo('WordPress config updated', { configId: savedConfig.id });
    } else {
      savedConfig = await prisma.wordPressConfig.create({
        data: {
          userId,
          siteUrl,
          username,
          appPassword,
        },
      });
      logInfo('WordPress config created', { configId: savedConfig.id });
    }

    return createdResponse({
      configId: savedConfig.id,
      siteUrl: savedConfig.siteUrl,
      username: savedConfig.username,
      message: 'WordPress config saved and verified',
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const userId = 'system'; // TODO: Get from authenticated user

    const config = await prisma.wordPressConfig.findUnique({
      where: { userId },
      select: {
        id: true,
        siteUrl: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!config) {
      return successResponse({
        hasConfig: false,
        message: 'No WordPress configuration found',
      });
    }

    return successResponse({
      hasConfig: true,
      config: {
        id: config.id,
        siteUrl: config.siteUrl,
        username: config.username,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
}