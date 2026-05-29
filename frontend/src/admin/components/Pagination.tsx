import type { Paginated } from '../../shared/api/admin';

type Props = {
  pagination: Paginated<unknown> | undefined;
  onPageChange: (page: number) => void;
};

export default function Pagination({ pagination, onPageChange }: Props) {
  if (!pagination) return null;

  const currentPage = pagination.current_page ?? pagination.meta?.current_page ?? 1;
  const lastPage = pagination.last_page ?? pagination.meta?.last_page ?? 1;
  const total = pagination.total ?? pagination.meta?.total ?? 0;

  if (lastPage <= 1) return null;

  const pages: (number | '...')[] = [];
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < lastPage - 2) pages.push('...');
    pages.push(lastPage);
  }

  const btn =
    'rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white';

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-1 py-3">
      <span className="text-xs text-slate-500">
        {total} record{total !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          className={btn}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={
                page === currentPage
                  ? 'rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white'
                  : btn
              }
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}
        <button
          type="button"
          className={btn}
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
