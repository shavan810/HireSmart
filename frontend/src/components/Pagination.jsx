import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const range = (page, pages) => {
  const items = [];
  const add = (n) => items.push(n);
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) add(i);
    else if (items[items.length - 1] !== '...') add('...');
  }
  return items;
};

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const btn = 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors';
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button className={`${btn} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <FiChevronLeft />
      </button>
      {range(page, pages).map((p, i) =>
        p === '...' ? (
          <span key={`d${i}`} className="px-1 text-slate-400">
            ...
          </span>
        ) : (
          <button key={p} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined} className={`${btn} ${p === page ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {p}
          </button>
        )
      )}
      <button className={`${btn} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <FiChevronRight />
      </button>
    </nav>
  );
}
