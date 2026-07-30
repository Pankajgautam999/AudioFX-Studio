import { Router } from "express";
import {
  generateMusic,
  getGenerationStatus,
  cancelGeneration,
  downloadAudio,
  streamAudio,
  deleteGeneration,
  randomPrompt,
} from "../controllers/generate.controller";
import { validateBody } from "../middleware/validate";
import { generateSchema } from "./schemas";
import { generationRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Kick off a new generation - synthesizes audio and returns the result.
router.post("/generate", generationRateLimiter, validateBody(generateSchema), asyncHandler(generateMusic));

// Poll the status/result of a generation job by id.
router.get("/generate/:id/status", asyncHandler(getGenerationStatus));

// Cancel an in-flight (or queued) generation.
router.post("/generate/:id/cancel", asyncHandler(cancelGeneration));

// Remove a job and its audio file.
router.delete("/generate/:id", asyncHandler(deleteGeneration));

// Suggest a random prompt + params, for the "Random prompt" button.
router.get("/random-prompt", asyncHandler(randomPrompt));

// Stream generated audio inline (used by the <audio> player).
router.get("/audio/:fileName", asyncHandler(streamAudio));

// Force-download generated audio as an attachment.
router.get("/audio/:fileName/download", asyncHandler(downloadAudio));

export default router;
