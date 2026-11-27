import { useState } from 'react';
import { FiMapPin, FiSearch } from 'react-icons/fi';

export default function SearchBar({ initialQuery = '', initialLocation = '', onSearch, large = false }) {
  const [q, setQ] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const submit = (e) => {
    e.preventDefault();
    onSearch({ q: q.trim(), location: location.trim() });
  };

  const field = `flex flex-1 items-center gap-3 px-4 ${large ? 'py-3.5' : 'py-2.5'}`;
  return (
    <form onSubmit={submit} role="search" className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card sm:flex-row sm:items-stretch">
      <label className={`${field} border-b border-slate-100 sm:border-b-0 sm:border-r`}>
        <FiSearch className="h-5 w-5 shrink-0 text-slate-400" />
        <span className="sr-only">Job title, skill or company</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
      </label>
      <label className={field}>
        <FiMapPin className="h-5 w-5 shrink-0 text-slate-400" />
        <span className="sr-only">Location</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or remote" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
      </label>
      <button type="submit" className={`btn btn-primary rounded-none ${large ? 'px-8 py-3.5' : 'px-6'}`}>
        Search jobs
      </button>
    </form>
  );
}
