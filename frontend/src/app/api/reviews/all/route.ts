import { getJudgemeAllReviewsPage } from "@/lib/judgeme/all-reviews";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const pageValue = params.get("page") || "1";
  const reviewType = params.get("type") || "product-reviews";
  const page = Number(pageValue);
  if (
    !/^\d+$/.test(pageValue) || !Number.isSafeInteger(page) || page < 1 ||
    (reviewType !== "product-reviews" && reviewType !== "shop-reviews")
  ) {
    return Response.json({ error: "Invalid review page." }, { status: 400 });
  }

  const reviews = await getJudgemeAllReviewsPage(page, reviewType);
  if (!reviews) {
    return Response.json({ error: "Reviews are temporarily unavailable." }, { status: 502 });
  }
  return Response.json(reviews);
}
