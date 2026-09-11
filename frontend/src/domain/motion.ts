import { boundedNumber } from "./catalog/hero";

export type MotionSettings = {
  enabled: boolean;
  cursor: boolean;
  duration: number;
  intensity: number;
};

export const defaultMotionSettings: MotionSettings = { enabled: true, cursor: true, duration: 1, intensity: 1 };

export function parseMotionSettings(fields: Record<string, { value?: string | null } | null> | null): MotionSettings {
  return {
    enabled: fields?.motionEnabled?.value !== "false",
    cursor: fields?.motionCursor?.value !== "false",
    duration: boundedNumber(fields?.motionDuration?.value, 1, 0.6, 1.5),
    intensity: boundedNumber(fields?.motionIntensity?.value, 1, 0, 1.5),
  };
}
