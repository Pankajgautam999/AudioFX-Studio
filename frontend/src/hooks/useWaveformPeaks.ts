import { useEffect, useState } from "react";

const BAR_COUNT = 64;

export function useWaveformPeaks(url: string | undefined): number[] | null {
  const [peaks, setPeaks] = useState<number[] | null>(null);

  useEffect(() => {
    if (!url) {
      setPeaks(null);
      return;
    }

    let cancelled = false;
    let audioContext: AudioContext | null = null;

    async function extract() {
      try {
        const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new AudioContextCtor();
        const res = await fetch(url as string);
        const arrayBuffer = await res.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        if (cancelled) return;

        const channelData = decoded.getChannelData(0);
        const blockSize = Math.max(1, Math.floor(channelData.length / BAR_COUNT));
        const result: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const start = i * blockSize;
          let peak = 0;
          for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
            peak = Math.max(peak, Math.abs(channelData[start + j]));
          }
          result.push(peak);
        }
        const maxPeak = Math.max(...result, 0.001);
        setPeaks(result.map((p) => Math.max(0.06, p / maxPeak)));
      } catch {
        if (!cancelled) {
          // Fall back to a gentle static waveform shape if decoding fails
          // (e.g. unsupported browser codec path) so the UI never breaks.
          const fallback = Array.from({ length: BAR_COUNT }, (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i * 0.4)));
          setPeaks(fallback);
        }
      } finally {
        if (audioContext) {
          audioContext.close().catch(() => undefined);
        }
      }
    }

    extract();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return peaks;
}
