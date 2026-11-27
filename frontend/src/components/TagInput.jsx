import { useState } from 'react';
import { FiX } from 'react-icons/fi';

// Type a skill and press Enter or comma to add it.
export default function TagInput({ label, tags, onChange, placeholder = 'Type and press Enter', max = 30 }) {
  const [value, setValue] = useState('');

  const add = (raw) => {
    const next = raw.trim();
    if (!next || tags.some((t) => t.toLowerCase() === next.toLowerCase()) || tags.length >= max) return;
    onChange([...tags, next]);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(value);
    } else if (e.key === 'Backspace' && !value && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="hover:text-blue-900">
              <FiX />
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(value)}
          placeholder={tags.length ? '' : placeholder}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1.5 py-1 text-sm outline-none focus:ring-0"
          aria-label={label || 'Add tag'}
        />
      </div>
    </div>
  );
}
