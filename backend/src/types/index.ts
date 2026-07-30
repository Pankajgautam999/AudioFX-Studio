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

export interface GenerateRequestBody {
  prompt: string;
  negativePrompt?: string;
  genre: Genre;
  mood: Mood;
  duration: number; // seconds
  seed?: number;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  progress: number; // 0-100
  request: GenerateRequestBody;
  createdAt: number;
  updatedAt: number;
  audioFileName?: string;
  audioUrl?: string;
  durationSeconds?: number;
  error?: string;
}

export interface GenerationResultResponse {
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
