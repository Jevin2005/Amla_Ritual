import type { HeroSettings } from "@/domain/catalog/hero";
import type { MotionSettings } from "@/domain/motion";

export function resolveModelMotion(settings: HeroSettings, motion: MotionSettings, reducedMotion: boolean) {
  const enabled = motion.enabled && !reducedMotion;
  const intensity = Number.isFinite(motion.intensity) ? Math.max(0, Math.min(1.5, motion.intensity)) : 0;
  return {
    enabled,
    autoRotate: enabled && settings.autoRotate && settings.rotationSpeed > 0,
    cursor: enabled && settings.cursorMotion && motion.cursor && intensity > 0,
    intensity,
  };
}
