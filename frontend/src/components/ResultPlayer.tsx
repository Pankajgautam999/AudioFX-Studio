import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import WaveformProgress from "./WaveformProgress";
import { useWaveformPeaks } from "@/hooks/useWaveformPeaks";
import { audioDownloadUrl, audioStreamUrl } from "@/lib/api";
import { buildShareUrl, classNames, copyToClipboard, formatTime } from "@/lib/utils";
import { GENRE_OPTIONS, MOOD_OPTIONS, PLAYBACK_SPEEDS } from "@/lib/constants";
import type { GenerationResult } from "@/types";

interface ResultPlayerProps {
  result: GenerationResult;
  onRegenerate: () => void;
}

export default function ResultPlayer({ result, onRegenerate }: ResultPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(result.durationSeconds ?? 0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const streamUrl = result.audioUrl ? audioStreamUrl(result.audioUrl) : undefined;
  const peaks = useWaveformPeaks(streamUrl);

  const genreLabel = GENRE_OPTIONS.find((g) => g.value === result.genre)?.label ?? result.genre;
  const moodLabel = MOOD_OPTIONS.find((m) => m.value === result.mood)?.label ?? result.mood;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [result.id]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch {
        // Autoplay/interaction restrictions - ignore, user can retry.
      }
    }
  };

  const handleSeek = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleDownload = () => {
    if (!result.audioUrl) return;
    const link = document.createElement("a");
    link.href = audioDownloadUrl(result.audioUrl);
    link.download = `sonora-${result.id.slice(0, 8)}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = async () => {
    const ok = await copyToClipboard(result.prompt);
    if (ok) {
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    }
  };

  const handleShare = async () => {
    const url = buildShareUrl({
      prompt: result.prompt,
      genre: result.genre,
      mood: result.mood,
      duration: result.durationSeconds ?? 0,
      seed: result.seed,
    });
    const ok = await copyToClipboard(url);
    if (ok) {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 1800);
    }
  };

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel p-5 sm:p-8"
    >
      {streamUrl && (
        <audio
          ref={audioRef}
          src={streamUrl}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration)) {
              setDuration(e.currentTarget.duration);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-medium text-accent-400">{genreLabel}</span>
            <span className="rounded-full bg-pulse-500/20 px-3 py-1 text-xs font-medium text-pulse-400">{moodLabel}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
              {formatTime(duration)}
            </span>
          </div>
          <p className="truncate text-sm text-white/70">{result.prompt}</p>
        </div>
      </div>

      {/* Play button + waveform */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!streamUrl}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 via-pulse-500 to-glow-500 text-white shadow-glow transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 translate-x-0.5">
              <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <WaveformProgress peaks={peaks} progressRatio={progressRatio} onSeek={handleSeek} />
          <div className="mt-1.5 flex justify-between font-mono text-xs text-white/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Volume + speed */}
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="flex min-w-[160px] items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-white/60 hover:text-white"
          >
            {muted || volume === 0 ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                <path d="m17 9 5 6M22 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                <path
                  d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <input
            type="range"
            className="fx-range flex-1"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setMuted(false);
            }}
            aria-label="Volume"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-white/40">Speed</span>
          {PLAYBACK_SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={classNames(
                "rounded-full px-2.5 py-1 font-mono text-xs transition-colors",
                speed === s ? "bg-accent-500/25 text-accent-300" : "text-white/40 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-6">
        <button type="button" onClick={handleDownload} className="ghost-button text-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download
        </button>
        <button type="button" onClick={onRegenerate} className="ghost-button text-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Regenerate
        </button>
        <button type="button" onClick={handleCopyPrompt} className="ghost-button text-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" />
          </svg>
          {copyState === "copied" ? "Copied!" : "Copy prompt"}
        </button>
        <button type="button" onClick={handleShare} className="ghost-button text-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="m8.6 10.5 6.8-3.9M8.6 13.5l6.8 3.9" stroke="currentColor" strokeWidth="2" />
          </svg>
          {shareState === "copied" ? "Link copied!" : "Share"}
        </button>
      </div>
    </motion.div>
  );
}
