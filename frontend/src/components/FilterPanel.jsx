import { CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from '../utils/constants';

const MIN = [
  ['', 'Any'],
  ['300000', '₹3L+'],
  ['600000', '₹6L+'],
  ['1000000', '₹10L+'],
  ['1500000', '₹15L+'],
  ['2500000', '₹25L+'],
];
const MAX = [
  ['', 'Any'],
  ['600000', 'up to ₹6L'],
  ['1000000', 'up to ₹10L'],
  ['1500000', 'up to ₹15L'],
  ['2500000', 'up to ₹25L'],
  ['5000000', 'up to ₹50L'],
];

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({ filters, onChange, onReset }) {
  const set = (key) => (value) => onChange({ [key]: value });
  const any = (list) => [['', 'All'], ...list.map((x) => [x, x])];
  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        <button onClick={onReset} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Clear all
        </button>
      </div>
      <Select label="Category" value={filters.category} onChange={set('category')} options={any(CATEGORIES)} />
      <Select label="Job type" value={filters.jobType} onChange={set('jobType')} options={any(JOB_TYPES)} />
      <Select label="Experience level" value={filters.experienceLevel} onChange={set('experienceLevel')} options={any(EXPERIENCE_LEVELS)} />
      <Select label="Minimum salary" value={filters.minSalary} onChange={set('minSalary')} options={MIN} />
      <Select label="Maximum salary" value={filters.maxSalary} onChange={set('maxSalary')} options={MAX} />
      <p className="text-xs text-slate-400">Salary filters use yearly pay.</p>
    </div>
  );
}
