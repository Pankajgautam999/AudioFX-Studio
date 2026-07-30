import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { jobStore } from "../services/jobStore.service";
import { synthesizeTrack } from "../services/musicSynthesis.service";
import { saveTrackAsWav, getAudioFilePath, deleteAudioFile } from "../services/audioFile.service";
import { generateRandomPrompt } from "../utils/randomPrompt";
import { hashStringToSeed } from "../utils/random";
import { ApiError } from "../middleware/errorHandler";
import type { GenerateRequestBody, GenerationJob, GenerationResultResponse } from "../types";

function toResultResponse(job: GenerationJob): GenerationResultResponse {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    audioUrl: job.audioUrl,
    durationSeconds: job.durationSeconds,
    prompt: job.request.prompt,
    negativePrompt: job.request.negativePrompt,
    genre: job.request.genre,
    mood: job.request.mood,
    seed: job.request.seed ?? 0,
    error: job.error,
    createdAt: job.createdAt,
  };
}

/**
 * Runs synthesis synchronously but the job record still models an
 * async pipeline (queued -> processing -> completed) so the frontend's
 * progress UI and the /status endpoint behave like a real generation
 * backend, and cancellation has somewhere meaningful to hook in.
 */
async function runGeneration(jobId: string): Promise<void> {
  const job = jobStore.get(jobId);
  if (!job) return;

  if (job.status === "cancelled") return;

  jobStore.update(jobId, { status: "processing", progress: 10 });

  try {
    const seed = job.request.seed ?? hashStringToSeed(job.request.prompt + job.request.genre + job.request.mood);

    // Simulate staged progress the frontend can poll, since real synthesis
    // here is fast but we still want a legible progress bar.
    jobStore.update(jobId, { progress: 35 });

    const result = synthesizeTrack({
      prompt: job.request.prompt,
      genre: job.request.genre,
      mood: job.request.mood,
      durationSeconds: job.request.duration,
      seed,
    });

    const currentJob = jobStore.get(jobId);
    if (!currentJob || currentJob.status === "cancelled") return;

    jobStore.update(jobId, { progress: 75 });

    const fileName = `${jobId}.wav`;
    saveTrackAsWav(fileName, result);

    jobStore.update(jobId, {
      status: "completed",
      progress: 100,
      audioFileName: fileName,
      audioUrl: `/api/audio/${fileName}`,
      durationSeconds: job.request.duration,
    });
  } catch (err) {
    jobStore.update(jobId, {
      status: "failed",
      error: err instanceof Error ? err.message : "Generation failed",
    });
  }
}

export async function generateMusic(req: Request, res: Response): Promise<void> {
  const body = req.body as GenerateRequestBody;
  const id = uuid();
  const now = Date.now();

  const job: GenerationJob = {
    id,
    status: "queued",
    progress: 0,
    request: {
      ...body,
      seed: body.seed ?? hashStringToSeed(body.prompt + body.genre + body.mood + now),
    },
    createdAt: now,
    updatedAt: now,
  };

  jobStore.create(job);

  // Run synthesis (fast, CPU-bound, no external calls) then respond
  // once it settles so the client gets audioUrl immediately, while still
  // exposing /status for a polling-style UI if desired.
  await runGeneration(id);

  const finished = jobStore.get(id);
  if (!finished) {
    throw new ApiError(500, "Job disappeared during generation");
  }
  res.status(201).json(toResultResponse(finished));
}

export function getGenerationStatus(req: Request, res: Response): void {
  const { id } = req.params;
  const job = jobStore.get(id);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  res.status(200).json(toResultResponse(job));
}

export function cancelGeneration(req: Request, res: Response): void {
  const { id } = req.params;
  const job = jobStore.get(id);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  if (job.status === "completed") {
    throw new ApiError(409, "Cannot cancel a completed generation");
  }
  const updated = jobStore.update(id, { status: "cancelled", progress: 0 });
  res.status(200).json(toResultResponse(updated as GenerationJob));
}

export function downloadAudio(req: Request, res: Response): void {
  const { fileName } = req.params;
  const filePath = getAudioFilePath(fileName);
  if (!filePath) {
    throw new ApiError(404, "Audio file not found or has expired");
  }
  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Cache-Control", "public, max-age=1800");
  res.download(filePath, "generated-track.wav");
}

export function streamAudio(req: Request, res: Response): void {
  const { fileName } = req.params;
  const filePath = getAudioFilePath(fileName);
  if (!filePath) {
    throw new ApiError(404, "Audio file not found or has expired");
  }
  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Cache-Control", "public, max-age=1800");
  res.sendFile(filePath);
}

export function deleteGeneration(req: Request, res: Response): void {
  const { id } = req.params;
  const job = jobStore.get(id);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  if (job.audioFileName) {
    deleteAudioFile(job.audioFileName);
  }
  jobStore.delete(id);
  res.status(204).send();
}

export function randomPrompt(req: Request, res: Response): void {
  const seedParam = req.query.seed;
  const seed = typeof seedParam === "string" && seedParam.length > 0 ? Number(seedParam) : undefined;
  const result = generateRandomPrompt(seed);
  res.status(200).json(result);
}
