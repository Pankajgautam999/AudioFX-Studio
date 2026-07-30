import { mulberry32, pickOne, randomInt } from "../utils/random";
import type { Genre, Mood } from "../types";

const SAMPLE_RATE = 44100;

/** Note name -> semitone offset from A4 (MIDI-ish, just for frequency math) */
const NOTE_SEMITONES: Record<string, number> = {
  C: -9,
  "C#": -8,
  D: -7,
  "D#": -6,
  E: -5,
  F: -4,
  "F#": -3,
  G: -2,
  "G#": -1,
  A: 0,
  "A#": 1,
  B: 2,
};

function noteFrequency(note: string, octave: number): number {
  const semitone = NOTE_SEMITONES[note];
  const distanceFromA4 = semitone + (octave - 4) * 12;
  return 440 * Math.pow(2, distanceFromA4 / 12);
}

// Scale intervals (in semitones from root)
const SCALES = {
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  wholeTone: [0, 2, 4, 6, 8, 10],
} as const;

type ScaleName = keyof typeof SCALES;

const MOOD_PROFILE: Record<
  Mood,
  { scale: ScaleName; tempoMod: number; brightness: number; minorRoot: boolean }
> = {
  happy: { scale: "majorPentatonic", tempoMod: 1.08, brightness: 1.2, minorRoot: false },
  sad: { scale: "naturalMinor", tempoMod: 0.85, brightness: 0.6, minorRoot: true },
  energetic: { scale: "major", tempoMod: 1.25, brightness: 1.35, minorRoot: false },
  calm: { scale: "majorPentatonic", tempoMod: 0.8, brightness: 0.75, minorRoot: false },
  dark: { scale: "phrygian", tempoMod: 0.95, brightness: 0.45, minorRoot: true },
  epic: { scale: "naturalMinor", tempoMod: 1.05, brightness: 1.1, minorRoot: true },
  romantic: { scale: "dorian", tempoMod: 0.9, brightness: 0.85, minorRoot: true },
  mysterious: { scale: "wholeTone", tempoMod: 0.88, brightness: 0.55, minorRoot: true },
  uplifting: { scale: "lydian", tempoMod: 1.12, brightness: 1.3, minorRoot: false },
  nostalgic: { scale: "minorPentatonic", tempoMod: 0.92, brightness: 0.7, minorRoot: true },
};

const GENRE_PROFILE: Record<
  Genre,
  { bpmRange: [number, number]; wave: OscillatorShape; bassWave: OscillatorShape; percussive: boolean; swing: number }
> = {
  lofi: { bpmRange: [70, 90], wave: "triangle", bassWave: "sine", percussive: true, swing: 0.12 },
  cinematic: { bpmRange: [60, 80], wave: "sine", bassWave: "sine", percussive: false, swing: 0 },
  electronic: { bpmRange: [110, 128], wave: "sawtooth", bassWave: "square", percussive: true, swing: 0.04 },
  ambient: { bpmRange: [50, 70], wave: "sine", bassWave: "sine", percussive: false, swing: 0 },
  rock: { bpmRange: [100, 140], wave: "sawtooth", bassWave: "square", percussive: true, swing: 0 },
  jazz: { bpmRange: [90, 120], wave: "triangle", bassWave: "sine", percussive: true, swing: 0.18 },
  orchestral: { bpmRange: [65, 95], wave: "sine", bassWave: "triangle", percussive: false, swing: 0 },
  synthwave: { bpmRange: [95, 115], wave: "sawtooth", bassWave: "square", percussive: true, swing: 0.02 },
  acoustic: { bpmRange: [75, 100], wave: "triangle", bassWave: "sine", percussive: true, swing: 0.08 },
  hiphop: { bpmRange: [80, 100], wave: "square", bassWave: "square", percussive: true, swing: 0.15 },
};

type OscillatorShape = "sine" | "square" | "sawtooth" | "triangle";

function oscillate(shape: OscillatorShape, phase: number): number {
  const p = phase - Math.floor(phase); // 0..1
  switch (shape) {
    case "sine":
      return Math.sin(2 * Math.PI * p);
    case "square":
      return p < 0.5 ? 1 : -1;
    case "sawtooth":
      return 2 * (p - Math.floor(p + 0.5));
    case "triangle":
      return 4 * Math.abs(p - 0.5) - 1;
  }
}

/** Simple ADSR envelope evaluated at time t (seconds) within a note of given duration */
function envelope(t: number, duration: number, attack: number, decay: number, sustain: number, release: number): number {
  if (t < attack) return t / attack;
  if (t < attack + decay) {
    const d = (t - attack) / decay;
    return 1 - d * (1 - sustain);
  }
  const releaseStart = duration - release;
  if (t < releaseStart) return sustain;
  if (t < duration) {
    const r = (t - releaseStart) / release;
    return sustain * (1 - r);
  }
  return 0;
}

function addNoteToBuffer(
  buffer: Float32Array,
  sampleRate: number,
  startSample: number,
  freq: number,
  durationSeconds: number,
  amplitude: number,
  shape: OscillatorShape,
  detuneCents = 0
): void {
  const durationSamples = Math.floor(durationSeconds * sampleRate);
  const detuneRatio = Math.pow(2, detuneCents / 1200);
  const f = freq * detuneRatio;
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / sampleRate;
    const env = envelope(t, durationSeconds, 0.01, durationSeconds * 0.15, 0.6, durationSeconds * 0.35);
    const phase = (f * (startSample + i)) / sampleRate;
    buffer[idx] += oscillate(shape, phase) * env * amplitude;
  }
}

/** Adds a soft noise-based percussive hit (kick/snare/hat approximation) */
function addPercHit(
  buffer: Float32Array,
  sampleRate: number,
  startSample: number,
  durationSeconds: number,
  amplitude: number,
  lowpass: number,
  rand: () => number
): void {
  const durationSamples = Math.floor(durationSeconds * sampleRate);
  let filtered = 0;
  const alpha = Math.min(1, lowpass / sampleRate);
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / sampleRate;
    const env = Math.exp(-t / (durationSeconds * 0.35));
    const noise = rand() * 2 - 1;
    filtered = filtered + alpha * (noise - filtered);
    buffer[idx] += filtered * env * amplitude;
  }
}

export interface SynthesisParams {
  prompt: string;
  genre: Genre;
  mood: Mood;
  durationSeconds: number;
  seed: number;
}

export interface SynthesisResult {
  channels: Float32Array[]; // stereo: [left, right]
  sampleRate: number;
}

/**
 * Generates an original procedural music track (melody + bass + pad + percussion)
 * from the given prompt parameters. Fully deterministic given the same seed,
 * so "regenerate" with a locked seed reproduces identical output.
 */
export function synthesizeTrack(params: SynthesisParams): SynthesisResult {
  const { genre, mood, durationSeconds, seed } = params;
  const rand = mulberry32(seed);

  const moodProfile = MOOD_PROFILE[mood];
  const genreProfile = GENRE_PROFILE[genre];

  const bpm = Math.round(randomInt(rand, genreProfile.bpmRange[0], genreProfile.bpmRange[1]) * moodProfile.tempoMod);
  const beatDuration = 60 / bpm;
  const stepDuration = beatDuration / 2; // 8th notes

  const rootNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const root = pickOne(rand, rootNotes);
  const scale = SCALES[moodProfile.scale];
  const octave = moodProfile.minorRoot ? 3 : 4;

  const totalSamples = Math.ceil(durationSeconds * SAMPLE_RATE);
  const master = new Float32Array(totalSamples);
  const bassTrack = new Float32Array(totalSamples);
  const padTrack = new Float32Array(totalSamples);
  const percTrack = new Float32Array(totalSamples);

  // --- Chord progression: pick 4 scale-degree chords, loop across the duration ---
  const degreeChoices = [0, 2, 4, 1, 3, 5];
  const progression: number[] = [];
  for (let i = 0; i < 4; i++) progression.push(pickOne(rand, degreeChoices));

  const chordDuration = beatDuration * 4; // 1 bar per chord
  let barIndex = 0;
  for (let t = 0; t < durationSeconds; t += chordDuration, barIndex++) {
    const degree = progression[barIndex % progression.length];
    const chordRootSemis = scale[degree % scale.length];
    const startSample = Math.floor(t * SAMPLE_RATE);

    // Pad: root + third + fifth of the scale, sustained
    [0, 2, 4].forEach((interval, voiceIdx) => {
      const scaleDegree = (degree + interval) % scale.length;
      const octaveShift = Math.floor((degree + interval) / scale.length);
      const semis = scale[scaleDegree] + octaveShift * 12 + chordRootSemis * 0;
      const freq = noteFrequency(root, octave + 1) * Math.pow(2, semis / 12);
      addNoteToBuffer(
        padTrack,
        SAMPLE_RATE,
        startSample,
        freq,
        Math.min(chordDuration, durationSeconds - t),
        0.09 * moodProfile.brightness,
        "sine",
        voiceIdx * 3
      );
    });

    // Bass: root note, one hit per bar (or two for energetic genres)
    const bassHits = genre === "electronic" || genre === "hiphop" || genre === "rock" ? 2 : 1;
    for (let h = 0; h < bassHits; h++) {
      const bassFreq = noteFrequency(root, octave - 1) * Math.pow(2, chordRootSemis / 12);
      addNoteToBuffer(
        bassTrack,
        SAMPLE_RATE,
        startSample + Math.floor((h * chordDuration) / bassHits * SAMPLE_RATE),
        bassFreq,
        chordDuration / bassHits,
        0.18,
        genreProfile.bassWave
      );
    }
  }

  // --- Melody: walk the scale with weighted random steps, syncopated by genre swing ---
  const melodyTrack = new Float32Array(totalSamples);
  let stepTime = 0;
  let lastDegree = randomInt(rand, 0, scale.length - 1);
  while (stepTime < durationSeconds) {
    const swingOffset = Math.floor(stepTime / stepDuration) % 2 === 1 ? genreProfile.swing * stepDuration : 0;
    const willPlay = rand() > 0.28; // rest occasionally for phrasing
    if (willPlay) {
      const step = pickOne(rand, [-2, -1, -1, 0, 1, 1, 2]);
      lastDegree = Math.max(0, Math.min(scale.length * 2 - 1, lastDegree + step));
      const octaveShift = Math.floor(lastDegree / scale.length);
      const semis = scale[lastDegree % scale.length] + octaveShift * 12;
      const freq = noteFrequency(root, octave + 2) * Math.pow(2, semis / 12);
      const noteLen = pickOne(rand, [1, 1, 2]) * stepDuration * 0.92;
      const startSample = Math.floor((stepTime + swingOffset) * SAMPLE_RATE);
      addNoteToBuffer(melodyTrack, SAMPLE_RATE, startSample, freq, noteLen, 0.14 * moodProfile.brightness, genreProfile.wave);
    }
    stepTime += stepDuration;
  }

  // --- Percussion: kick on downbeats, hat on offbeats, snare on backbeat (if genre is percussive) ---
  if (genreProfile.percussive) {
    let beatTime = 0;
    let beatCount = 0;
    while (beatTime < durationSeconds) {
      const startSample = Math.floor(beatTime * SAMPLE_RATE);
      // Kick on beat 1 and 3
      if (beatCount % 4 === 0 || beatCount % 4 === 2) {
        addPercHit(percTrack, SAMPLE_RATE, startSample, 0.18, 0.3, 140, rand);
      }
      // Snare on beat 2 and 4
      if (beatCount % 4 === 1 || beatCount % 4 === 3) {
        addPercHit(percTrack, SAMPLE_RATE, startSample, 0.12, 0.22, 2200, rand);
      }
      // Hat on every 8th note between beats
      const hatStart = Math.floor((beatTime + stepDuration) * SAMPLE_RATE);
      addPercHit(percTrack, SAMPLE_RATE, hatStart, 0.05, 0.08, 7500, rand);

      beatTime += beatDuration;
      beatCount++;
    }
  }

  // --- Mixdown ---
  for (let i = 0; i < totalSamples; i++) {
    master[i] = melodyTrack[i] + bassTrack[i] + padTrack[i] + percTrack[i];
  }

  // Soft clip / normalize to avoid harsh digital clipping
  let peak = 0;
  for (let i = 0; i < totalSamples; i++) peak = Math.max(peak, Math.abs(master[i]));
  const normFactor = peak > 0.001 ? Math.min(1 / peak, 6) * 0.85 : 1;

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const sample = Math.tanh(master[i] * normFactor);
    // subtle stereo widening: slight delay + gain diff between channels
    left[i] = sample;
    const delayedIdx = i - 6;
    right[i] = 0.92 * sample + 0.08 * (delayedIdx >= 0 ? master[delayedIdx] * normFactor : 0);
  }

  // Fade in/out to avoid clicks
  const fadeSamples = Math.min(Math.floor(0.03 * SAMPLE_RATE), Math.floor(totalSamples / 4));
  for (let i = 0; i < fadeSamples; i++) {
    const g = i / fadeSamples;
    left[i] *= g;
    right[i] *= g;
    left[totalSamples - 1 - i] *= g;
    right[totalSamples - 1 - i] *= g;
  }

  return { channels: [left, right], sampleRate: SAMPLE_RATE };
}
