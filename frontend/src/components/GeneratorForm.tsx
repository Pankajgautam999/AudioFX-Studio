import { useState } from "react";
import { motion } from "framer-motion";
import PillSelect from "./PillSelect";
import { DURATION_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import { fetchRandomPrompt } from "@/lib/api";
import { classNames } from "@/lib/utils";
import type { GenerateFormState } from "@/types";
import type { GenerationPhase } from "@/hooks/useMusicGeneration";

interface GeneratorFormProps {
  form: GenerateFormState;
  onChange: (form: GenerateFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  phase: GenerationPhase;
  progress: number;
}

const MAX_PROMPT_LENGTH = 500;

export default function GeneratorForm({ form, onChange, onSubmit, onCancel, phase, progress }: GeneratorFormProps) {
  const [randomizing, setRandomizing] = useState(false);
  const isGenerating = phase === "generating";

  const patch = (partial: Partial<GenerateFormState>) => onChange({ ...form, ...partial });

  const handleRandomPrompt = async () => {
    setRandomizing(true);
    try {
      const result = await fetchRandomPrompt();
      patch({
        prompt: result.prompt,
        genre: result.genre,
        mood: result.mood,
        duration: result.duration,
      });
    } catch {
      // Non-critical - silently ignore, the user can just type their own prompt.
    } finally {
      setRandomizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    if (form.prompt.trim().length < 3) return;
    onSubmit();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel p-5 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">Describe your track</h2>
          <p className="mt-1 text-sm text-white/50">Be specific — instruments, scene, energy, references.</p>
        </div>
        <button
          type="button"
          onClick={handleRandomPrompt}
          disabled={randomizing || isGenerating}
          className="ghost-button shrink-0 text-xs sm:text-sm"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={classNames("h-4 w-4", randomizing && "animate-spin")}
          >
            <path
              d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Random prompt
        </button>
      </div>

      {/* Prompt */}
      <div className="mb-5">
        <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-white/70">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={form.prompt}
          onChange={(e) => patch({ prompt: e.target.value.slice(0, MAX_PROMPT_LENGTH) })}
          placeholder="A dreamy lo-fi beat for late-night coding, warm vinyl crackle and soft piano..."
          rows={3}
          required
          minLength={3}
          disabled={isGenerating}
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-accent-400/60 focus:bg-white/[0.05] disabled:opacity-60"
        />
        <div className="mt-1.5 text-right text-xs text-white/30">
          {form.prompt.length}/{MAX_PROMPT_LENGTH}
        </div>
      </div>

      {/* Negative prompt */}
      <div className="mb-6">
        <label htmlFor="negativePrompt" className="mb-2 block text-sm font-medium text-white/70">
          Negative prompt <span className="font-normal text-white/40">(what to avoid)</span>
        </label>
        <input
          id="negativePrompt"
          type="text"
          value={form.negativePrompt}
          onChange={(e) => patch({ negativePrompt: e.target.value.slice(0, MAX_PROMPT_LENGTH) })}
          placeholder="Heavy distortion, vocals, harsh cymbals..."
          disabled={isGenerating}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-accent-400/60 focus:bg-white/[0.05] disabled:opacity-60"
        />
      </div>

      {/* Genre */}
      <div className="mb-6">
        <div className="mb-2 text-sm font-medium text-white/70">Genre</div>
        <PillSelect name="Genre" options={GENRE_OPTIONS} value={form.genre} onChange={(genre) => patch({ genre })} />
      </div>

      {/* Mood */}
      <div className="mb-6">
        <div className="mb-2 text-sm font-medium text-white/70">Mood</div>
        <PillSelect name="Mood" options={MOOD_OPTIONS} value={form.mood} onChange={(mood) => patch({ mood })} />
      </div>

      {/* Duration */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-white/70">
          <span>Duration</span>
          <span className="font-mono text-xs text-white/40">{form.duration}s</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => patch({ duration: opt.value })}
              disabled={isGenerating}
              className={classNames(
                "pill-select px-4",
                form.duration === opt.value ? "pill-select-active" : "pill-select-inactive"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit / progress */}
      {isGenerating ? (
        <div className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 via-pulse-500 to-glow-500"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-white/60">
              <span className="flex h-2 w-2">
                <span className="absolute h-2 w-2 animate-pulse-ring rounded-full bg-accent-400" />
                <span className="h-2 w-2 rounded-full bg-accent-400" />
              </span>
              Composing your track... {Math.round(progress)}%
            </p>
            <button type="button" onClick={onCancel} className="text-sm font-medium text-white/50 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="submit" disabled={form.prompt.trim().length < 3} className="gradient-button w-full sm:w-auto">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
          </svg>
          Generate music
        </button>
      )}
    </motion.form>
  );
}
