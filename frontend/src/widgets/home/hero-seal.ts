// The title and the seal share one contour, so their spacing stays consistent
// at every viewport size and throughout the expanding scroll transition.
const radiusAt = (angle: number) => 468 + 18 * Math.cos((angle + Math.PI / 2) * 8) + 6 * Math.sin(angle * 3);
const pointAt = (angle: number, inset = 0) => {
  const radius = radiusAt(angle) - inset;
  return { x: 500 + Math.cos(angle) * radius, y: 500 + Math.sin(angle) * radius };
};
const pathThrough = (points: { x: number; y: number }[]) => points.map(({ x, y }, index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

export const heroSealPath = pathThrough(Array.from({ length: 361 }, (_, index) => pointAt(index / 360 * Math.PI * 2 - Math.PI / 2))) + " Z";
const titlePoints = Array.from({ length: 181 }, (_, index) => pointAt(-Math.PI + 0.3 + index / 180 * (Math.PI - 0.6), 78));
export const heroSealTitlePath = pathThrough(titlePoints);
export const heroSealTitleLength = Number((titlePoints.reduce((length, point, index) => index ? length + Math.hypot(point.x - titlePoints[index - 1].x, point.y - titlePoints[index - 1].y) : 0, 0) * 0.96).toFixed(2));
