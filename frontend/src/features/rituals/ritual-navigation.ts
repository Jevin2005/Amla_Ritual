export type QuizNavigation = {
  readonly busy: boolean;
  navigate(commit: () => void, direction: "forward" | "back", result?: boolean): Promise<void>;
  finishMotion(): void;
  dispose(): void;
};

/** Serialize deliberate navigation so fast clicks cannot skip adaptive questions. */
export function createQuizNavigation({ getStage, motionEnabled, onBusyChange, afterCommit }: {
  getStage: () => HTMLElement | null;
  motionEnabled: () => boolean;
  onBusyChange: (busy: boolean) => void;
  afterCommit: () => void;
}): QuizNavigation {
  let busy = false;
  let disposed = false;
  let animation: Animation | null = null;
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

  async function move(phase: "out" | "in", direction: "forward" | "back") {
    const stage = getStage();
    if (disposed || !stage?.animate || !motionEnabled()) return;
    const distance = direction === "forward" ? 12 : -12;
    const keyframes = phase === "out"
      ? [{ opacity: 1, transform: "translateX(0px)" }, { opacity: 0, transform: `translateX(${-distance}px)` }]
      : [{ opacity: 0, transform: `translateX(${distance}px)` }, { opacity: 1, transform: "translateX(0px)" }];
    const current = stage.animate(keyframes, { duration: phase === "out" ? 140 : 220, easing, fill: "both" });
    animation = current;
    try { await current.finished; } catch { /* Cancellation must not strand the navigation lock. */ }
    finally { current.cancel(); if (animation === current) animation = null; }
  }

  return {
    get busy() { return busy; },
    async navigate(commit, direction, result = false) {
      if (busy || disposed) return;
      busy = true;
      onBusyChange(true);
      try {
        await move("out", direction);
        if (disposed) return;
        commit();
        afterCommit();
        // Results animate their own image/copy with a quiet stagger.
        if (!result) await move("in", direction);
      } finally {
        busy = false;
        if (!disposed) onBusyChange(false);
      }
    },
    finishMotion() { animation?.finish(); },
    dispose() { disposed = true; animation?.cancel(); animation = null; },
  };
}
