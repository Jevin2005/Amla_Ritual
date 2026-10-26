/** A lightweight placeholder for the existing review-card layout. */
export function ReviewPageLoader() {
  return (
    <div className="product-review-loading" aria-hidden="true">
      <div className="review-loading-status">
        <span className="review-loading-spinner" />
        <span>Loading reviews</span>
      </div>
      <div className="review-skeleton-grid">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="review-skeleton-card" key={index}>
            <div className="review-skeleton-header">
              <span className="review-skeleton-avatar" />
              <span className="review-skeleton-name" />
              <span className="review-skeleton-date" />
            </div>
            <div className="review-skeleton-rating" />
            <div className="review-skeleton-title" />
            <div className="review-skeleton-lines">
              <span /><span /><span />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
