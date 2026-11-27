import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5" aria-label="HireSmart home">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${light ? 'bg-white' : 'bg-navy-800'}`}>
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path d="M9 9v14M23 9v14M9 16h14" stroke={light ? '#0b1f4b' : '#fff'} strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="23" cy="9" r="2.6" fill="#3b82f6" />
        </svg>
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-800'}`}>HireSmart</span>
    </Link>
  );
}
