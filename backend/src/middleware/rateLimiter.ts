import { Request, Response, NextFunction } from 'express';
import redisClient from '../database/redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const rateLimiter = (config: RateLimitConfig) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
  } = config;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `rate_limit:${identifier}:${req.path}`;
      
      const windowSeconds = Math.floor(windowMs / 1000);
      const { allowed, remaining } = await redisClient.checkRateLimit(
        key,
        maxRequests,
        windowSeconds
      );

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

      if (!allowed) {
        res.status(429).json({
          success: false,
          message,
          retryAfter: windowMs,
        });
        return;
      }

      next();
    } catch (error) {
      // If Redis fails, allow the request
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

// Preset rate limiters
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many login attempts, please try again later',
});

export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const strictRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});
