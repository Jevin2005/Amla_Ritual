"use client";

type ReviewPaginationProps = {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
  controlsId?: string;
};

export function ReviewPagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  label = "Reviews",
  controlsId,
}: ReviewPaginationProps) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  // Always retain the first/last page, with a small window around the current page.
  const pageNumbers = totalPages <= 5
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
      .filter((number) => number >= 1 && number <= totalPages)
      .sort((a, b) => a - b);
  // Three nearby pages leave room for full-size previous/next controls on phones.
  const mobileStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const mobilePageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, index) => mobileStart + index);
  const buttonClass = "grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full border text-[0.78rem] font-medium tabular-nums transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-not-allowed disabled:opacity-30";
  const activeClass = "border-[var(--forest)] bg-[var(--forest)] text-white shadow-[0_3px_9px_rgba(21,59,45,0.16)]";
  const inactiveClass = "border-transparent text-[#62705b] hover:bg-[#eef1e7] hover:text-[var(--forest)]";

  return (
    <div className="mt-7 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-[#e1e5d8] pt-5 max-[600px]:justify-center">
      <p className="m-0 text-[0.72rem] tracking-[0.01em] text-[#747b6b]" role="status" aria-live="polite" aria-atomic="true">
        Showing <span className="font-medium tabular-nums text-[#43523b]">{start}–{end}</span> of {totalItems} {label.toLowerCase()}
      </p>
      {totalPages > 1 && (
        <nav aria-label={`${label} pages`} className="flex items-center justify-center gap-0.5 rounded-full border border-[#e2e6d8] bg-[#fffef9] p-1 shadow-[0_3px_12px_rgba(38,52,32,0.025)]">
          <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} aria-label={`Previous ${label.toLowerCase()} page`} aria-controls={controlsId} className={`${buttonClass} border-transparent text-[var(--forest)] hover:enabled:bg-[#eef1e7]`}>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg>
          </button>
          <span className="contents min-[440px]:hidden">
            {mobilePageNumbers.map((number) => (
              <button key={number} type="button" onClick={() => onPageChange(number)} aria-label={`Page ${number} of ${totalPages}`} aria-current={currentPage === number ? "page" : undefined} aria-controls={controlsId} className={`${buttonClass} ${currentPage === number ? activeClass : inactiveClass}`}>
                {number}
              </button>
            ))}
          </span>
          <span className="hidden min-[440px]:contents">
            {pageNumbers.map((number, index) => (
              <span key={number} className="flex items-center gap-0.5">
                {index > 0 && number - pageNumbers[index - 1] > 1 && <span className="px-0.5 text-xs text-[var(--muted)]" aria-hidden="true">&hellip;</span>}
                <button type="button" onClick={() => onPageChange(number)} aria-label={`Page ${number} of ${totalPages}`} aria-current={currentPage === number ? "page" : undefined} aria-controls={controlsId} className={`${buttonClass} ${currentPage === number ? activeClass : inactiveClass}`}>
                  {number}
                </button>
              </span>
            ))}
          </span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label={`Next ${label.toLowerCase()} page`} aria-controls={controlsId} className={`${buttonClass} border-transparent text-[var(--forest)] hover:enabled:bg-[#eef1e7]`}>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
          </button>
        </nav>
      )}
    </div>
  );
}
