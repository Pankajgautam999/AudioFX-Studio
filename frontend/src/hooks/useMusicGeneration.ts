import { useCallback, useRef, useState } from "react";
import { generateMusic, ApiRequestError } from "@/lib/api";
import type { GenerateFormState, GenerationResult } from "@/types";

export type GenerationPhase = "idle" | "generating" | "completed" | "error" | "cancelled";

interface UseMusicGenerationReturn {
  phase: GenerationPhase;
  result: GenerationResult | null;
  errorMessage: string | null;
  progress: number;
  generate: (form: GenerateFormState) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Since the backend synthesizes audio synchronously (no external AI
 * service call to await), we simulate a smooth progress bar client-side
 * while the request is in flight rather than polling a status endpoint,
 * which keeps the UX consistent even on a fast local network.
 */
export function useMusicGeneration(): UseMusicGenerationReturn {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const reset = useCallback(() => {
    clearProgressTimer();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setPhase("idle");
    setResult(null);
    setErrorMessage(null);
    setProgress(0);
  }, []);

  const cancel = useCallback(() => {
    clearProgressTimer();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setPhase("cancelled");
    setProgress(0);
  }, []);

  const generate = useCallback(async (form: GenerateFormState) => {
    clearProgressTimer();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPhase("generating");
    setErrorMessage(null);
    setResult(null);
    setProgress(4);

    // Fake but honest progress: creeps toward 90% while we wait on the
    // network request, then snaps to 100 on success.
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.max(1, (90 - p) * 0.08) : p));
    }, 180);

    try {
      const res = await generateMusic(form, controller.signal);
      clearProgressTimer();
      setProgress(100);
      setResult(res);
      setPhase(res.status === "completed" ? "completed" : "error");
      if (res.status !== "completed") {
        setErrorMessage(res.error || "Generation did not complete successfully.");
      }
    } catch (err) {
      clearProgressTimer();
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // cancelled - state already set by cancel()
      }
      setPhase("error");
      setProgress(0);
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong while generating your track. Please try again.");
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  return { phase, result, errorMessage, progress, generate, cancel, reset };
}
