import { z } from "zod";

export const GENRES = [
  "lofi",
  "cinematic",
  "electronic",
  "ambient",
  "rock",
  "jazz",
  "orchestral",
  "synthwave",
  "acoustic",
  "hiphop",
] as const;

export const MOODS = [
  "happy",
  "sad",
  "energetic",
  "calm",
  "dark",
  "epic",
  "romantic",
  "mysterious",
  "uplifting",
  "nostalgic",
] as const;

const MIN_DURATION = Number(process.env.MIN_DURATION_SECONDS || 5);
const MAX_DURATION = Number(process.env.MAX_DURATION_SECONDS || 60);

export const generateSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, "Prompt must be at least 3 characters")
    .max(500, "Prompt must be under 500 characters"),
  negativePrompt: z.string().trim().max(500).optional().default(""),
  genre: z.enum(GENRES),
  mood: z.enum(MOODS),
  duration: z
    .number()
    .int()
    .min(MIN_DURATION, `Duration must be at least ${MIN_DURATION} seconds`)
    .max(MAX_DURATION, `Duration must be at most ${MAX_DURATION} seconds`),
  seed: z.number().int().optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
