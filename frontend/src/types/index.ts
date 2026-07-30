export type Genre =
  | "lofi"
  | "cinematic"
  | "electronic"
  | "ambient"
  | "rock"
  | "jazz"
  | "orchestral"
  | "synthwave"
  | "acoustic"
  | "hiphop";

export type Mood =
  | "happy"
  | "sad"
  | "energetic"
  | "calm"
  | "dark"
  | "epic"
  | "romantic"
  | "mysterious"
  | "uplifting"
  | "nostalgic";

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerateFormState {
  prompt: string;
  negativePrompt: string;
  genre: Genre;
  mood: Mood;
  duration: number;
}

export interface GenerationResult {
  id: string;
  status: JobStatus;
  progress: number;
  audioUrl?: string;
  durationSeconds?: number;
  prompt: string;
  negativePrompt?: string;
  genre: Genre;
  mood: Mood;
  seed: number;
  error?: string;
  createdAt: number;
}

export interface RandomPromptResult {
  prompt: string;
  genre: Genre;
  mood: Mood;
  duration: number;
}

export interface ApiErrorPayload {
  error: string;
  message: string;
  details?: unknown;
}
