import fs from "fs";
import path from "path";
import { encodeWav } from "../utils/wav";
import type { SynthesisResult } from "./musicSynthesis.service";

const AUDIO_DIR = path.resolve(process.env.AUDIO_STORAGE_DIR || "./tmp/audio");
const FILE_TTL_MS = Number(process.env.AUDIO_FILE_TTL_MS || 30 * 60 * 1000);

export function ensureAudioDir(): void {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
}

export function audioDirPath(): string {
  return AUDIO_DIR;
}

export function saveTrackAsWav(fileName: string, result: SynthesisResult): string {
  ensureAudioDir();
  const buffer = encodeWav(result.channels, {
    sampleRate: result.sampleRate,
    numChannels: result.channels.length,
  });
  const filePath = path.join(AUDIO_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function getAudioFilePath(fileName: string): string | null {
  // Guard against path traversal - only allow bare filenames we generated.
  const safeName = path.basename(fileName);
  const filePath = path.join(AUDIO_DIR, safeName);
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

export function deleteAudioFile(fileName: string): void {
  const safeName = path.basename(fileName);
  const filePath = path.join(AUDIO_DIR, safeName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/** Sweeps the audio directory and removes files older than the configured TTL */
export function purgeExpiredAudioFiles(): number {
  ensureAudioDir();
  const now = Date.now();
  let purged = 0;
  for (const file of fs.readdirSync(AUDIO_DIR)) {
    const filePath = path.join(AUDIO_DIR, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > FILE_TTL_MS) {
      fs.unlinkSync(filePath);
      purged++;
    }
  }
  return purged;
}
