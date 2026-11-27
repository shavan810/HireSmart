import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiMapPin, FiX } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowSkeleton } from '../../components/Skeleton';
import { applicationService } from '../../services/applicationService';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/format';

const PIPELINE = ['Applied', 'Under Review', 'Shortlisted', 'Hired'];

function Progress({ application }) {
  const rejected = application.status === 'Rejected';
  const reached = new Set(application.statusHistory.map((h) => h.status));
  const currentIdx = PIPELINE.indexOf(application.status);

  return (
    <ol className="flex items-start justify-between gap-1" aria-label="Application progress">
      {PIPELINE.map((step, i) => {
        const done = reached.has(step) || i < currentIdx;
        const current = application.status === step;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full ${done ? 'bg-blue-600' : 'bg-slate-200'}`} aria-hidden="true" />}
            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${done ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-400'} ${current ? 'ring-4 ring-blue-100' : ''}`}>
              {done ? <FiCheck /> : i + 1}
            </span>
            <span className={`mt-2 text-xs font-semibold ${done ? 'text-navy-800' : 'text-slate-400'}`}>{step}</span>
          </li>
        );
      })}
      {rejected && (
        <li className="flex flex-col items-center text-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white ring-4 ring-red-100"><FiX /></span>
          <span className="mt-2 text-xs font-semibold text-red-600">Rejected</span>
        </li>
      )}
    </ol>
  );
}

export default function ApplicationTracking() {
  const { data, loading, error, reload } = useFetch(() => applicationService.mine(), []);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (data?.applications.length && !selectedId) setSelectedId(data.applications[0]._id);
  }, [data, selectedId]);

  const selected = data?.applications.find((a) => a._id === selectedId);

  return (
    <>
      <PageHeader title="Application tracking" subtitle="See exactly where each application stands and its full history." />
      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton /> : data.applications.length === 0 ? (
        <EmptyState icon={FiMapPin} title="Nothing to track yet" message="Once you apply for a job, you can follow every status change here." action={<Link to="/seeker/jobs" className="btn btn-primary">Find a job</Link>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <ul className="card max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
            {data.applications.map((a) => (
              <li key={a._id}>
                <button onClick={() => setSelectedId(a._id)} aria-current={a._id === selectedId} className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${a._id === selectedId ? 'bg-blue-50/60' : ''}`}>
                  <p className="truncate font-semibold text-slate-800">{a.job?.title || 'Job removed'}</p>
                  <p className="truncate text-sm text-slate-500">{a.job?.company}</p>
                  <div className="mt-2"><StatusBadge status={a.status} /></div>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <section className="card p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">{selected.job?.title || 'Job removed'}</h2>
                  <p className="text-slate-500">{selected.job?.company}{selected.job?.location ? ` · ${selected.job.location}` : ''}</p>
                  <p className="mt-1 text-xs text-slate-400">Applied on {formatDate(selected.appliedAt)}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <Progress application={selected} />

              <h3 className="mb-3 mt-8 text-base font-bold">History</h3>
              <ol className="space-y-4 border-l-2 border-slate-200 pl-5">
                {[...selected.statusHistory].reverse().map((h, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border-2 border-white ${i === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    <div className="flex flex-wrap items-center gap-2"><StatusBadge status={h.status} /><span className="text-xs text-slate-400">{formatDate(h.changedAt, true)}</span></div>
                    {h.note && <p className="mt-1 text-sm text-slate-600">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </>
  );
}
