/** The hero is a finite scroll story. Progress is clamped, never wrapped. */
export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const scrollInputs = (height: number, count: number) => ({
  height: Number.isFinite(height) ? Math.max(1, height) : 1,
  count: Number.isFinite(count) ? Math.max(1, Math.trunc(count)) : 1,
});

/** Physical scroll distances in pixels, with a fixed-duration final handoff. */
export function getHeroScrollMetrics(height: number, count: number, mobile = false) {
  const measured = scrollInputs(height, count);
  const travelDistance = !mobile && measured.count > 1
    ? (measured.count - 1) * Math.max(380, measured.height * 0.62)
    : measured.height * 0.648;
  const finishDistance = measured.height * 0.702;
  const distance = travelDistance + finishDistance;
  return { travelDistance, finishDistance, distance, sectionHeight: measured.height + distance };
}

/** Map physical scroll to the existing frame timeline without accelerating
 * through the middle jars. The last .52 of that timeline keeps its old pace.
 */
export function getHeroScrollProgress(offset: number, height: number, count: number, mobile = false) {
  const measured = scrollInputs(height, count);
  const metrics = getHeroScrollMetrics(measured.height, measured.count, mobile);
  const position = clamp(Number.isNaN(offset) ? 0 : offset, 0, metrics.distance);
  if (position <= 0) return 0;
  if (position >= metrics.distance) return 1;
  if (mobile || measured.count <= 1) return clamp(position / (measured.height * 1.35));
  if (position >= metrics.travelDistance) {
    return clamp(0.48 + (position - metrics.travelDistance) / (measured.height * 1.35));
  }
  const localTravel = clamp(position / metrics.travelDistance);
  const inverseSmoothstep = 0.5 - Math.sin(Math.asin(1 - 2 * localTravel) / 3);
  return inverseSmoothstep * 0.48;
}

/** Inverse mapping for anchors and checks that address a particular hero phase. */
export function getHeroScrollOffset(phase: number, height: number, count: number, mobile = false) {
  const measured = scrollInputs(height, count);
  const metrics = getHeroScrollMetrics(measured.height, measured.count, mobile);
  const progress = clamp(Number.isNaN(phase) ? 0 : phase);
  if (progress <= 0) return 0;
  if (progress >= 1) return metrics.distance;
  if (mobile || measured.count <= 1) return progress * measured.height * 1.35;
  return progress <= 0.48
    ? smoothstep(progress / 0.48) * metrics.travelDistance
    : metrics.travelDistance + (progress - 0.48) * measured.height * 1.35;
}

/** Keep the next composition at its beginning throughout the crossfade, then
 * absorb a short amount of continuing wheel/touch travel before releasing it.
 */
export function getHeroHandoffMetrics(height: number, count: number, mobile = false) {
  const measured = scrollInputs(height, count);
  const { distance } = getHeroScrollMetrics(measured.height, measured.count, mobile);
  const start = getHeroScrollOffset(0.72, measured.height, measured.count, mobile);
  const lead = distance - start;
  const hold = mobile ? 0 : clamp(measured.height * 0.85, 480, 960);
  return {
    start,
    revealEnd: getHeroScrollOffset(0.9, measured.height, measured.count, mobile),
    end: distance + hold,
    overlap: measured.height + lead,
    runway: lead + hold,
    lead,
    hold,
  };
}

/** Discard a fast gesture's overshoot until the incoming hero has been visible
 * for one second. No timer scrolls the page later; continued input releases it.
 * Explicit navigation and restored scroll positions can bypass this guard.
 */
export function createHeroArrivalGuard() {
  let armed = false;
  let arrivedAt: number | null = null;
  let released = false;
  const reset = () => { armed = false; arrivedAt = null; released = false; };
  return {
    reset,
    arm() { armed = true; },
    limit(offset: number, time: number, metrics: ReturnType<typeof getHeroHandoffMetrics>) {
      if (metrics.hold === 0) return offset;
      if (offset < metrics.start) { arrivedAt = null; released = false; }
      if (!armed || released) return offset;
      if (offset < metrics.revealEnd) { arrivedAt = null; return offset; }
      arrivedAt ??= time;
      if (time - arrivedAt >= 1000) { released = true; return offset; }
      return Math.min(offset, metrics.end - metrics.hold);
    },
  };
}

/** The phone carousel keeps moving as the finite page transition completes. */
export function getHeroTravel(progress: number, count: number, mobile = false) {
  const p = clamp(Number.isNaN(progress) ? 0 : progress);
  if (count <= 1) return 0;
  return mobile ? p * 2.4 : smoothstep(p / 0.48) * Math.max(0, count - 1);
}

export function wrapHeroIndex(value: number, count: number) {
  if (!Number.isFinite(value) || !Number.isFinite(count) || count <= 0) return 0;
  return ((value % count) + count) % count;
}

/** Repeat small catalogs so a slot only wraps once it is fully offscreen. */
export function getHeroLoopSlotCount(count: number) {
  if (!Number.isFinite(count) || count <= 0) return 0;
  const size = Math.trunc(count);
  return size === 2 || size === 3 ? size * 2 : size;
}

export type JarPose = {
  x: number;
  y: number;
  height: number;
  roll: number;
  opacity: number;
  brightness: number;
  depthBlur: number;
};

export type HeroLayout = {
  centerHeight: number;
  sideHeight: number;
  spacing: number;
  centerY: number;
  waveAmplitude: number;
};

const viewportInputs = (width: number, height: number) => ({
  width: Number.isFinite(width) ? Math.max(1, width) : 1,
  height: Number.isFinite(height) ? Math.max(1, height) : 1,
});

const referenceBreakpoints = (width: number) => ({
  tablet: clamp((width - 480) / (768 - 480)),
  wide: clamp((width - 1024) / (1280 - 1024)),
});

/** Heights and vertical positions are fractions of the viewport height;
 * spacing is a fraction of its width. Reference-width changes remain continuous.
 */
export function getHeroLayout(width: number, height: number): HeroLayout {
  const { width: measuredWidth, height: measuredHeight } = viewportInputs(width, height);
  const { tablet, wide } = referenceBreakpoints(measuredWidth);
  const referenceHeight = measuredWidth <= 480 ? measuredWidth * 0.56
    : measuredWidth < 768 ? 480 * 0.56 + (768 * 0.62 - 480 * 0.56) * tablet
      : measuredWidth <= 1024 ? measuredWidth * 0.62
        : measuredWidth < 1280 ? 1024 * 0.62 + (1280 * 0.36 - 1024 * 0.62) * wide
          : measuredWidth * 0.36;
  const heightCap = 0.42 + tablet * 0.18 - wide * 0.1;
  const centerHeight = Math.min(referenceHeight, measuredHeight * heightCap, 640) / measuredHeight;
  const headerRoom = Math.min(120, measuredHeight * 0.27) / measuredHeight;
  return {
    centerHeight,
    sideHeight: centerHeight * 0.59,
    spacing: 0.6 - tablet * 0.15 - wide * 0.11,
    centerY: Math.max(0.45 - wide * 0.01, headerRoom + centerHeight * 0.55),
    waveAmplitude: 0.035 + tablet * 0.025 + wide * 0.01,
  };
}

/** Seal and curved-text measurements in pixels, shared by layout and cover math. */
export function getHeroBackdrop(width: number, height: number) {
  const measured = viewportInputs(width, height);
  const { tablet, wide } = referenceBreakpoints(measured.width);
  const diameter = Math.min(measured.width * (1.16 - tablet * 0.18 - wide * 0.04), measured.height * 1.12);
  // Keep both ends of the enlarged title above the footer, including phones.
  const top = Math.min(measured.height * (0.79 - tablet * 0.18 - wide * 0.04), measured.height - 74 - diameter * 0.4);
  return {
    top,
    diameter,
    arcSize: diameter,
    arcTop: top,
  };
}

/** Manual offset is measured in product slots; speed is signed slots per ms.
 * Positive values move the band left. Neither changes the page's finite timeline.
 */
export function getHeroFrame(progress: number, count: number, compact = false, manualOffset = 0, speed = 0, layout?: HeroLayout, looping = false) {
  const p = clamp(progress);
  const drift = smoothstep(p / 0.48);
  // Looping the horizontal band must not change the desktop page timeline.
  const travel = getHeroTravel(p, count, looping && compact);
  const manual = Number.isFinite(manualOffset) ? manualOffset : 0;
  const velocity = Number.isFinite(speed) ? speed : 0;
  // Adding jars must not retime the established cover, header, or section handoff.
  const expansion = smoothstep((p - 0.5) / 0.2);
  const exit = smoothstep((p - 0.66) / 0.2);
  const textOpacity = 1 - smoothstep((p - 0.44) / 0.16);
  // Reveal the next section while the last jar leaves, with no empty hold.
  const reveal = smoothstep((p - 0.72) / 0.18);
  const focus = looping
    ? wrapHeroIndex(Math.round(travel + (count > 1 ? manual : 0)), count)
    : Math.min(count - 1, Math.max(0, Math.round(travel + (count > 1 ? manual : 0))));
  const slotCount = looping ? getHeroLoopSlotCount(count) : count;
  const poses: JarPose[] = Array.from({ length: slotCount }, (_, index) => {
    if (count === 1) {
      const driftWidth = layout ? 0.085 - clamp((layout.spacing - 0.34) / 0.26) * 0.06 : compact ? 0.025 : 0.085;
      return {
        x: 0.5 + Math.sin(drift * Math.PI) * driftWidth,
        y: (layout?.centerY ?? (compact ? 0.395 : 0.405)) - drift * 0.035 - exit * 1.35,
        height: layout ? layout.centerHeight * (1 - drift * 0.09) : (compact ? 0.48 : 0.55) - drift * 0.045,
        roll: (-0.22 + drift * 0.13) * (1 - exit) + exit * 0.34,
        opacity: 1 - smoothstep((p - 0.77) / 0.09),
        brightness: 1,
        depthBlur: 0,
      };
    }
    // Wrap the rendered slot, never the interpolated travel value. This keeps
    // swipes continuous through any number of turns in either direction.
    const rawOffset = index - travel - manual;
    const offset = looping ? wrapHeroIndex(rawOffset + slotCount / 2, slotCount) - slotCount / 2 : rawOffset;
    const x = 0.5 + offset * (layout?.spacing ?? (compact ? 0.68 : 0.37));
    const prominence = 1 - smoothstep(Math.abs(offset) / 1.8);
    const centerHeight = layout ? layout.centerHeight * (1 - drift * 0.09) : (compact ? 0.48 : 0.55) - drift * 0.045;
    const sideHeight = layout?.sideHeight ?? (compact ? 0.22 : 0.29);
    const height = sideHeight + prominence * (centerHeight - sideHeight);
    const y = (layout?.centerY ?? (compact ? 0.395 : 0.405)) - drift * 0.035
      + (layout ? Math.sin(offset * 1.35) * layout.waveAmplitude : clamp(offset, -2, 2) * 0.018 + Math.sin(offset * 1.3) * 0.012) - exit * 1.35;
    const travelTilt = clamp(velocity * 12, -0.1, 0.1);
    const roll = clamp(-0.22 * Math.cos(offset * 2.1) + drift * 0.05 + travelTilt, -0.28, 0.28);
    const movementBlur = clamp(Math.abs(velocity) * 100, 0, 0.3) * (1 - exit);
    return {
      x,
      y,
      height,
      roll: roll * (1 - exit) + exit * 0.34,
      opacity: 1 - smoothstep((p - 0.77) / 0.09),
      brightness: 0.9 + prominence * 0.1,
      depthBlur: (1 - prominence) * 1.2 + movementBlur,
    };
  });
  return { poses, expansion, exit, textOpacity, reveal, focus, progress: p };
}

/** Minimum scale that encloses all four screen corners, even in portrait. */
export function getCoverScale(width: number, height: number, diameter: number, centerY: number) {
  const furthestY = Math.max(centerY, height - centerY);
  return Math.hypot(width / 2, furthestY) / (diameter * 0.44) + 0.12;
}
