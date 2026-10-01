export type ReviewOverview = {
  average: number;
  count: number;
  distribution: Record<number, number> | null;
};

/** Read published totals, never infer them from the first page of reviews. */
export function readWidgetReviewOverview(html: string | null | undefined): ReviewOverview | null {
  if (!html) return null;
  const tags = html.match(/<[a-z][^>]*>/gi) || [];
  const attribute = (tag: string, name: string) =>
    tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2];
  const hasClass = (tag: string, name: string) =>
    (attribute(tag, "class") || "").split(/\s+/).includes(name);
  const root = tags.find((tag) => hasClass(tag, "jdgm-rev-widg"));
  if (!root) return null;
  const rawCount = attribute(root, "data-number-of-reviews");
  const rawAverage = attribute(root, "data-average-rating");
  if (!rawCount?.trim() || !rawAverage?.trim()) return null;
  const count = Number(rawCount);
  const average = Number(rawAverage);
  if (!Number.isSafeInteger(count) || count < 0 || !Number.isFinite(average) || average < 0 || average > 5 || (count > 0 && average < 1)) return null;
  const distribution: Record<number, number> = {};
  for (const tag of tags) {
    if (!hasClass(tag, "jdgm-histogram__row")) continue;
    const rating = Number(attribute(tag, "data-rating"));
    const rawFrequency = attribute(tag, "data-frequency");
    const frequency = rawFrequency?.trim() ? Number(rawFrequency) : NaN;
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5 && Number.isSafeInteger(frequency) && frequency >= 0) distribution[rating] = frequency;
  }
  const complete = Object.keys(distribution).length === 5 && Object.values(distribution).reduce((sum, value) => sum + value, 0) === count;
  return { average, count, distribution: complete ? distribution : null };
}
