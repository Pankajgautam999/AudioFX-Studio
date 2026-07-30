import type { Genre, Mood } from "@/types";

export const GENRE_OPTIONS: { value: Genre; label: string; icon: string }[] = [
  { value: "lofi", label: "Lo-Fi", icon: "🎧" },
  { value: "cinematic", label: "Cinematic", icon: "🎬" },
  { value: "electronic", label: "Electronic", icon: "⚡" },
  { value: "ambient", label: "Ambient", icon: "🌌" },
  { value: "rock", label: "Rock", icon: "🎸" },
  { value: "jazz", label: "Jazz", icon: "🎷" },
  { value: "orchestral", label: "Orchestral", icon: "🎻" },
  { value: "synthwave", label: "Synthwave", icon: "🌆" },
  { value: "acoustic", label: "Acoustic", icon: "🪕" },
  { value: "hiphop", label: "Hip-Hop", icon: "🥁" },
];

export const MOOD_OPTIONS: { value: Mood; label: string; icon: string }[] = [
  { value: "happy", label: "Happy", icon: "☀️" },
  { value: "sad", label: "Sad", icon: "🌧️" },
  { value: "energetic", label: "Energetic", icon: "🔥" },
  { value: "calm", label: "Calm", icon: "🌊" },
  { value: "dark", label: "Dark", icon: "🌑" },
  { value: "epic", label: "Epic", icon: "⚔️" },
  { value: "romantic", label: "Romantic", icon: "🌹" },
  { value: "mysterious", label: "Mysterious", icon: "🔮" },
  { value: "uplifting", label: "Uplifting", icon: "🕊️" },
  { value: "nostalgic", label: "Nostalgic", icon: "📼" },
];

export const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 20, label: "20s" },
  { value: 30, label: "30s" },
  { value: 45, label: "45s" },
  { value: 60, label: "60s" },
];

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const DEFAULT_FORM_STATE = {
  prompt: "",
  negativePrompt: "",
  genre: "lofi" as Genre,
  mood: "calm" as Mood,
  duration: 20,
};
