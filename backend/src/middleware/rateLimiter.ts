import rateLimit from "express-rate-limit";

export const generationRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "You're generating too quickly. Please wait a moment and try again.",
  },
});

export const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "TooManyRequests",
    message: "Too many requests. Please slow down.",
  },
});
