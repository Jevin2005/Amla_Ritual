export type SheryConfig = Record<string, { value: number | boolean | { x: number; y: number }; range?: number[] }>;

const ranges: Record<string, [number, number]> = {
  noise_speed: [0, 10], metaball: [0, 2], discard_threshold: [0, 1], antialias_threshold: [0, .1],
  noise_height: [0, 2], noise_scale: [0, 100], growSize: [1, 15], durationOut: [.1, 5], durationIn: [.1, 5],
  speed: [0, 1], scale: [.01, 100], distortionAmount: [0, 10], noiseDetail: [.01, 100], maskVal: [1, 5],
  shapeRadius: [0, 2], shapeEdgeSoftness: [0, .5], geoVertex: [1, 32],
};
const booleans = ["noEffectGooey", "infiniteGooey", "masker", "ignoreShapeAspect"];

// Accept Shery's native clipboard JSON, retaining only effect controls.
// Runtime fields (textures, time, aspect, z-index) belong to the current poster.
export function parseSheryConfig(input: unknown): SheryConfig {
  try {
    const source = typeof input === "string" ? JSON.parse(input.slice(0, 30000)) : input;
    if (!source || typeof source !== "object" || Array.isArray(source)) return {};
    const result: SheryConfig = {};
    for (const [key, range] of Object.entries(ranges)) {
      const value = source[key]?.value;
      if (typeof value === "number" && Number.isFinite(value)) {
        result[key] = { value: Math.max(range[0], Math.min(range[1], value)), range };
      }
    }
    for (const key of booleans) if (typeof source[key]?.value === "boolean") result[key] = { value: source[key].value };
    for (const key of ["shapePosition", "shapeScale"]) {
      const value = source[key]?.value;
      if (Number.isFinite(value?.x) && Number.isFinite(value?.y)) {
        const min = key === "shapeScale" ? .01 : -2;
        const max = key === "shapeScale" ? 1 : 2;
        result[key] = { value: { x: Math.max(min, Math.min(max, value.x)), y: Math.max(min, Math.min(max, value.y)) } };
      }
    }
    return result;
  } catch { return {}; }
}

export const defaultSheryConfig: SheryConfig = {
  infiniteGooey: { value: true },
  noEffectGooey: { value: true },
  noise_speed: { value: 1.15, range: [0, 10] },
  metaball: { value: 0.20, range: [0, 2] },
  discard_threshold: { value: 0.50, range: [0, 1] },
  antialias_threshold: { value: 0.00, range: [0, 0.1] },
  noise_height: { value: 0.50, range: [0, 2] },
  noise_scale: { value: 10.69, range: [0, 100] },
  growSize: { value: 4, range: [1, 15] },
  durationOut: { value: 1, range: [0.1, 5] },
  durationIn: { value: 1.5, range: [0.1, 5] },
};

export const defaultSheryBackgroundConfig: SheryConfig = {
  scrollType: { value: 0 },
  displaceAmount: { value: 0.08 },
  noise_speed: { value: 0, range: [0, 10] },
  noise_scale: { value: 10, range: [0, 100] },
  shapeEdgeSoftness: { value: 0, range: [0, 0.5] },
  onMouse: { value: 1 },
  a: { value: 0 },
  b: { value: 0 },
};

export function sheryPosterConfig(strength: number, preset: SheryConfig = {}): SheryConfig {
  return {
    ...defaultSheryConfig,
    distortionAmount: { value: .12, range: [0, 10] },
    metaball: { value: .20 * strength, range: [0, 2] },
    noise_height: { value: .50 * strength, range: [0, 2] },
    ...parseSheryConfig(preset),
    zindex: { value: 1 },
  };
}

// Organic reveal on the hero photograph; the underlying image stays undistorted.
export const heroPosterGooeyConfig = sheryPosterConfig(1, {
  distortionAmount: { value: 0 },
  metaball: { value: .24 },
  noise_height: { value: .44 },
  noise_speed: { value: .7 },
  noise_scale: { value: 10 },
  growSize: { value: 6 },
  durationOut: { value: .8 },
  durationIn: { value: .6 },
  antialias_threshold: { value: .025 },
});
