import assert from "node:assert/strict";
import test from "node:test";
import { readWidgetReviewOverview } from "../src/lib/judgeme/widget-summary.ts";

const rows = [0, 0, 0, 1, 6].map((count, index) =>
  `<div data-frequency='${count}' class='jdgm-histogram__row' data-rating='${index + 1}'></div>`,
).join("");

test("uses published totals even when the page contains fewer review cards", () => {
  const html = `<div data-number-of-reviews="7" class="jdgm-rev-widg" data-average-rating="4.86">${rows}<div class="jdgm-rev">One visible review</div></div>`;
  assert.deepEqual(readWidgetReviewOverview(html), {
    average: 4.86, count: 7, distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 6 },
  });
});

test("preserves a valid score without inventing missing histogram counts", () => {
  const html = `<div class='extra jdgm-rev-widg' data-average-rating='4.2' data-number-of-reviews='120'>${rows}</div>`;
  assert.deepEqual(readWidgetReviewOverview(html), { average: 4.2, count: 120, distribution: null });
});

test("distinguishes an empty product from unavailable or malformed data", () => {
  assert.deepEqual(readWidgetReviewOverview(`<div class='jdgm-rev-widg' data-average-rating='0' data-number-of-reviews='0'></div>`), { average: 0, count: 0, distribution: null });
  for (const html of [null, "", `<div class='jdgm-rev-widg' data-average-rating='5'></div>`, `<div class='jdgm-rev-widg' data-average-rating='NaN' data-number-of-reviews='1'></div>`, `<div class='jdgm-rev-widg' data-average-rating='6' data-number-of-reviews='2'></div>`]) {
    assert.equal(readWidgetReviewOverview(html), null);
  }
});
