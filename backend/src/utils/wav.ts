/**
 * Minimal, dependency-free 16-bit PCM WAV encoder.
 * Takes a Float32Array of samples in the range [-1, 1] and wraps it
 * in a valid RIFF/WAVE header so any standard audio player can read it.
 */

export interface WavEncodeOptions {
  sampleRate: number;
  numChannels: number;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array): void {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    const value = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, value, true);
  }
}

/**
 * Interleaves a list of per-channel Float32Arrays into a single
 * Float32Array suitable for PCM encoding.
 */
export function interleave(channels: Float32Array[]): Float32Array {
  if (channels.length === 1) return channels[0];
  const length = channels[0].length;
  const result = new Float32Array(length * channels.length);
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < channels.length; ch++) {
      result[i * channels.length + ch] = channels[ch][i];
    }
  }
  return result;
}

export function encodeWav(channels: Float32Array[], options: WavEncodeOptions): Buffer {
  const { sampleRate, numChannels } = options;
  const interleaved = interleave(channels);
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // Bits per sample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  floatTo16BitPCM(view, 44, interleaved);

  return Buffer.from(buffer);
}
