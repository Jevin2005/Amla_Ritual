// Work in CSS pixels so a flick has the same speed on every viewport.
export const HERO_GLIDE_TIME = 240;
const MAX_RELEASE_SPEED = 2.4;

export function getHeroSwipeVelocity(previous: number, distance: number, elapsed: number) {
  if (!Number.isFinite(distance) || !Number.isFinite(elapsed) || elapsed <= 0) return previous;
  const measured = distance / elapsed;
  // A reversal belongs to the new direction immediately. Otherwise smooth by
  // elapsed time, rather than the number of events delivered by the device.
  if (Math.sign(measured) !== Math.sign(previous)) return measured;
  return previous + (measured - previous) * (1 - Math.exp(-elapsed / 24));
}

export function getHeroReleaseVelocity(velocity: number, sampleAge: number) {
  if (!Number.isFinite(velocity) || !Number.isFinite(sampleAge)) return 0;
  const bounded = Math.max(-MAX_RELEASE_SPEED, Math.min(MAX_RELEASE_SPEED, velocity));
  // A brief hold should progressively reduce the flick, not keep full speed
  // until a hard cutoff. Allow one display frame for normal release delivery.
  const pause = Math.max(0, Math.min(1, (sampleAge - 16) / 84));
  return bounded * (1 - pause * pause * (3 - 2 * pause));
}

export function getHeroGlideProgress(elapsed: number) {
  return 1 - Math.exp(-Math.max(0, elapsed) / HERO_GLIDE_TIME);
}
