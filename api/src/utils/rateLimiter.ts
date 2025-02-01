import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { getUserIp } from "./ip";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => getUserIp(req),
  handler: (_, __, ___, options) => {
    return {
      error: {
        code: 429,
        message: `Rate limit exceeded. Please wait ${Math.ceil(
          (options.windowMs || 15 * 60 * 1000) / 1000
        )} seconds before trying again.`,
      },
    };
  },
});
