import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { ensureAudioDir, purgeExpiredAudioFiles } from "./services/audioFile.service";
import { jobStore } from "./services/jobStore.service";

const PORT = Number(process.env.PORT || 8080);

ensureAudioDir();

const app = createApp();

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🎵 AI Music Generator API listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

// Periodic cleanup so the ephemeral, DB-less storage doesn't grow unbounded.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const purgedFiles = purgeExpiredAudioFiles();
  const purgedJobs = jobStore.purgeOlderThan(Number(process.env.AUDIO_FILE_TTL_MS || 30 * 60 * 1000));
  if (purgedFiles || purgedJobs) {
    // eslint-disable-next-line no-console
    console.log(`🧹 Cleanup: removed ${purgedFiles} audio file(s), ${purgedJobs} job(s)`);
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

function shutdown(signal: string): void {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}, shutting down gracefully...`);
  clearInterval(cleanupTimer);
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
