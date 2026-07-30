/**
 * Deterministic seeded PRNG (Mulberry32) so a given seed always
 * produces the exact same generated track - useful for "regenerate
 * with same prompt" reproducibility and for tests.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hashes an arbitrary string into a 32-bit unsigned integer.
 * Used to turn a text prompt into a stable numeric seed.
 */
export function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function randomInRange(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

export function randomInt(rand: () => number, min: number, max: number): number {
  return Math.floor(randomInRange(rand, min, max + 1));
}

export function pickOne<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}
