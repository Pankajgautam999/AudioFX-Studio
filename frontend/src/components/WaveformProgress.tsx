import { useRef } from "react";
import { classNames } from "@/lib/utils";

interface WaveformProgressProps {
  peaks: number[] | null;
  progressRatio: number; // 0-1
  onSeek: (ratio: number) => void;
}

export default function WaveformProgress({ peaks, progressRatio, onSeek }: WaveformProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSeek = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(ratio);
  };

  const bars = peaks ?? Array.from({ length: 64 }, () => 0.3);
  const activeBars = Math.floor(progressRatio * bars.length);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progressRatio * 100)}
      tabIndex={0}
      onClick={(e) => handleSeek(e.clientX)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(1, progressRatio + 0.05));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progressRatio - 0.05));
      }}
      className="flex h-14 w-full cursor-pointer items-center gap-[3px] rounded-2xl border border-white/10 bg-white/[0.02] px-3"
    >
      {bars.map((peak, i) => (
        <div
          key={i}
          className={classNames(
            "w-full rounded-full transition-colors duration-150",
            i < activeBars ? "bg-gradient-to-t from-accent-500 to-pulse-400" : "bg-white/15"
          )}
          style={{ height: `${Math.max(8, peak * 100)}%` }}
        />
      ))}
    </div>
  );
}
