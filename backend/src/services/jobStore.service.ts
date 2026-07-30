import type { GenerationJob } from "../types";

/**
 * Purely in-memory store for generation jobs. No database, by design.
 * State is lost on server restart, which is fine for a stateless demo
 * generator - clients hold onto their own job id / audio url.
 */
class JobStore {
  private jobs = new Map<string, GenerationJob>();

  create(job: GenerationJob): void {
    this.jobs.set(job.id, job);
  }

  get(id: string): GenerationJob | undefined {
    return this.jobs.get(id);
  }

  update(id: string, patch: Partial<GenerationJob>): GenerationJob | undefined {
    const existing = this.jobs.get(id);
    if (!existing) return undefined;
    const updated: GenerationJob = { ...existing, ...patch, updatedAt: Date.now() };
    this.jobs.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.jobs.delete(id);
  }

  /** Removes jobs older than maxAgeMs to keep memory bounded */
  purgeOlderThan(maxAgeMs: number): number {
    const now = Date.now();
    let purged = 0;
    for (const [id, job] of this.jobs.entries()) {
      if (now - job.createdAt > maxAgeMs) {
        this.jobs.delete(id);
        purged++;
      }
    }
    return purged;
  }

  size(): number {
    return this.jobs.size;
  }
}

export const jobStore = new JobStore();
