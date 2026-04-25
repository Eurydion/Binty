import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
// upng-js is a tiny pure-JS PNG decoder; works in React Native / Hermes.
// We import via require() to avoid type-resolution issues (no @types).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UPNG: any = require('upng-js');

export type FingerSample = {
  r: number;
  g: number;
  b: number;
  brightness: number;
  isFinger: boolean;
};

const SAMPLE_SIZE = 8; // 8x8 = 64 pixels averaged

/**
 * Decide whether a frame represents a finger covering the rear camera + flash.
 * Heuristic: red-dominant and bright (skin lit by flash glows red).
 */
export function isFingerFrame(r: number, g: number, b: number): boolean {
  if (r < 140) return false;
  if (r < g * 1.4) return false;
  if (r < b * 1.4) return false;
  return true;
}

/**
 * Resize the supplied image URI to a tiny PNG, decode it, and return the
 * average R/G/B of the resized image plus a boolean for "finger detected".
 *
 * Designed to be called periodically (every ~400-600ms) on snapshots from
 * an `expo-camera` `CameraView` ref while the torch is on.
 */
export async function detectFingerFromUri(uri: string): Promise<FingerSample | null> {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: SAMPLE_SIZE, height: SAMPLE_SIZE } }],
      { format: SaveFormat.PNG, base64: false, compress: 1 },
    );

    // Read the resulting PNG file as raw bytes
    const file = new File(result.uri);
    const buf = await file.arrayBuffer();
    const decoded = UPNG.decode(buf);
    // RGBA8 pixel buffer (first frame)
    const rgba: Uint8Array = new Uint8Array(UPNG.toRGBA8(decoded)[0]);

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    const pixelCount = decoded.width * decoded.height;
    for (let i = 0; i < pixelCount; i++) {
      const off = i * 4;
      rSum += rgba[off];
      gSum += rgba[off + 1];
      bSum += rgba[off + 2];
    }
    const r = rSum / pixelCount;
    const g = gSum / pixelCount;
    const b = bSum / pixelCount;
    const brightness = (r + g + b) / 3;

    // Cleanup the manipulated file (best-effort)
    try {
      file.delete();
    } catch {
      // ignore
    }

    return {
      r,
      g,
      b,
      brightness,
      isFinger: isFingerFrame(r, g, b),
    };
  } catch (err) {
    console.warn('[fingerDetector] failed to analyze frame', err);
    return null;
  }
}
