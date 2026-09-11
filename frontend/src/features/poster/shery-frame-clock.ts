// Shery does not expose its animation handles. This scheduler belongs only to
// its iframe, so pausing it never changes the storefront's animation loop.
export function createFrameClock(request: typeof requestAnimationFrame, cancel: typeof cancelAnimationFrame) {
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0, frame = 0, active = true, disposed = false;
  const schedule = () => {
    if (!active || disposed || frame || !pending.size) return;
    frame = request((time) => {
      frame = 0;
      const callbacks = [...pending.values()]; pending.clear();
      for (const callback of callbacks) callback(time);
      schedule();
    });
  };
  return {
    request(callback: FrameRequestCallback) { const next = ++id; if (!disposed) { pending.set(next, callback); schedule(); } return next; },
    cancel(id: number) { pending.delete(id); },
    setActive(value: boolean) { active = value; if (!active) { cancel(frame); frame = 0; } else schedule(); },
    dispose() { disposed = true; cancel(frame); frame = 0; pending.clear(); },
  };
}
