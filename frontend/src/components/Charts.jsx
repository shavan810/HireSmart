// Lightweight SVG charts (no chart library needed). All are responsive via viewBox.

const BLUE = '#2563eb';

export function BarChart({ data, color = BLUE, height = 220, emptyText = 'No data yet' }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (!data.length || max === 0) return <p className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>{emptyText}</p>;

  const W = 480;
  const pad = { t: 24, r: 8, b: 34, l: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const slot = innerW / data.length;
  const bar = Math.min(slot * 0.6, 44);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Bar chart">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH * (1 - f)} y2={pad.t + innerH * (1 - f)} stroke="#e2e8f0" strokeDasharray="3 4" />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.l + slot * i + (slot - bar) / 2;
        const y = pad.t + innerH - h;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={bar} height={Math.max(h, 2)} rx="5" fill={color} />
            <text x={x + bar / 2} y={y - 6} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold">
              {d.value}
            </text>
            <text x={x + bar / 2} y={height - 12} textAnchor="middle" className="fill-slate-500 text-[11px]">
              {d.label.length > 9 ? `${d.label.slice(0, 8)}…` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ data, color = BLUE, height = 220, emptyText = 'No data yet' }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (!data.length || max === 0) return <p className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>{emptyText}</p>;

  const W = 480;
  const pad = { t: 24, r: 20, b: 34, l: 20 };
  const innerW = W - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const pts = data.map((d, i) => [pad.l + step * i, pad.t + innerH - (d.value / max) * innerH]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]},${pad.t + innerH} L${pts[0][0]},${pad.t + innerH} Z`;
  const gid = `g${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH * (1 - f)} y2={pad.t + innerH * (1 - f)} stroke="#e2e8f0" strokeDasharray="3 4" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4" fill="#fff" stroke={color} strokeWidth="2.5" />
          <text x={p[0]} y={p[1] - 10} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold">
            {data[i].value}
          </text>
          <text x={p[0]} y={height - 12} textAnchor="middle" className="fill-slate-500 text-[11px]">
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function HorizontalBars({ data, color = BLUE, emptyText = 'No data yet' }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (!data.length || max === 0) return <p className="py-10 text-center text-sm text-slate-400">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-700">{d.label}</span>
            <span className="font-bold text-navy-800">{d.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({ data, size = 170, centerLabel = 'Total' }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 62;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label="Donut chart" className="shrink-0">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#f1f5f9" strokeWidth="22" />
        {total > 0 &&
          data
            .filter((d) => d.value > 0)
            .map((d) => {
              const len = (d.value / total) * C;
              const el = <circle key={d.label} cx="80" cy="80" r={R} fill="none" stroke={d.color} strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)" />;
              offset += len;
              return el;
            })}
        <text x="80" y="78" textAnchor="middle" className="fill-navy-800 text-[26px] font-extrabold">
          {total}
        </text>
        <text x="80" y="96" textAnchor="middle" className="fill-slate-500 text-[11px]">
          {centerLabel}
        </text>
      </svg>
      <ul className="grid w-full max-w-[14rem] gap-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="font-bold text-navy-800">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScoreRing({ score, size = 140, label = 'Score' }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={`${label}: ${score} out of 100`}>
      <circle cx="70" cy="70" r={R} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * C} ${C}`} transform="rotate(-90 70 70)" />
      <text x="70" y="75" textAnchor="middle" className="fill-navy-800 text-[34px] font-extrabold">
        {score}
      </text>
      <text x="70" y="94" textAnchor="middle" className="fill-slate-500 text-[11px]">
        {label}
      </text>
    </svg>
  );
}
