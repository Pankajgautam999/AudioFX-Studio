import type { ApiErrorPayload, GenerateFormState, GenerationResult, RandomPromptResult } from "@/types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

export class ApiRequestError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = (await res.json()) as ApiErrorPayload;
    } catch {
      payload = undefined;
    }
    throw new ApiRequestError(res.status, payload?.message || `Request failed with status ${res.status}`, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function generateMusic(form: GenerateFormState, signal?: AbortSignal): Promise<GenerationResult> {
  return request<GenerationResult>(
    "/api/generate",
    {
      method: "POST",
      body: JSON.stringify(form),
    },
    signal
  );
}

export function getGenerationStatus(id: string): Promise<GenerationResult> {
  return request<GenerationResult>(`/api/generate/${id}/status`);
}

export function cancelGeneration(id: string): Promise<GenerationResult> {
  return request<GenerationResult>(`/api/generate/${id}/cancel`, { method: "POST" });
}

export function fetchRandomPrompt(): Promise<RandomPromptResult> {
  return request<RandomPromptResult>("/api/random-prompt");
}

export function audioStreamUrl(audioUrl: string): string {
  if (/^https?:\/\//.test(audioUrl)) return audioUrl;
  return `${BASE_URL}${audioUrl}`;
}

export function audioDownloadUrl(audioUrl: string): string {
  return `${audioStreamUrl(audioUrl)}/download`;
}
