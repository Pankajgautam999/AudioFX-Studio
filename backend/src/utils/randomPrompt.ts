import { mulberry32, pickOne } from "./random";
import type { Genre, Mood } from "../types";

const SUBJECTS = [
  "a rainy neon city at midnight",
  "a spaceship drifting past forgotten stars",
  "an old library filled with dust and secrets",
  "a desert highway under a burning sunset",
  "a quiet mountain village waking up",
  "a underwater ruin lit by bioluminescent creatures",
  "a carnival that only appears at dusk",
  "a train crossing an endless snowfield",
  "a rooftop garden above a sleeping metropolis",
  "a forest clearing where fireflies gather",
  "a arcade humming with retro machines",
  "a lonely lighthouse during a storm",
];

const TEXTURES = [
  "warm analog synths",
  "soft piano chords",
  "driving bassline",
  "shimmering pads",
  "gentle vinyl crackle",
  "layered strings",
  "punchy drums",
  "ethereal choir",
  "glitchy percussion",
  "reverb-soaked guitar",
];

const GENRES: Genre[] = [
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
];

const MOODS: Mood[] = [
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
];

export interface RandomPromptResult {
  prompt: string;
  genre: Genre;
  mood: Mood;
  duration: number;
}

export function generateRandomPrompt(seed?: number): RandomPromptResult {
  const rand = mulberry32(seed ?? Date.now() ^ (Math.random() * 0xffffffff));
  const subject = pickOne(rand, SUBJECTS);
  const texture = pickOne(rand, TEXTURES);
  const genre = pickOne(rand, GENRES);
  const mood = pickOne(rand, MOODS);
  const durations = [15, 20, 30, 45, 60];
  const duration = pickOne(rand, durations);

  const prompt = `${genre} track evoking ${subject}, built around ${texture}, ${mood} mood`;

  return { prompt, genre, mood, duration };
}
