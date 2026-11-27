import { useState } from 'react';
import { FiBriefcase, FiExternalLink, FiFileText, FiMail, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import Avatar from './Avatar';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { formatDate, timeAgo } from '../utils/format';

export function ApplicantProfileModal({ application, onClose }) {
  if (!application) return null;
  const a = application.applicant;
  return (
    <Modal open onClose={onClose} title="Candidate profile" size="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={a.name} src={a.profileImage} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">{a.name}</h3>
            <p className="text-sm text-slate-500">{a.headline || 'Job seeker'}</p>
            <div className="mt-1"><StatusBadge status={application.status} /></div>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2"><FiMail className="text-slate-400" /><a href={`mailto:${a.email}`} className="truncate text-blue-600 hover:underline">{a.email}</a></div>
          {a.phone && <div className="flex items-center gap-2"><FiPhone className="text-slate-400" />{a.phone}</div>}
          {a.location && <div className="flex items-center gap-2"><FiMapPin className="text-slate-400" />{a.location}</div>}
          <div className="flex items-center gap-2"><FiBriefcase className="text-slate-400" />{a.experience ?? 0} yr experience</div>
        </dl>

        {a.skills?.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-bold">Skills</h4>
            <div className="flex flex-wrap gap-1.5">{a.skills.map((s) => <span key={s} className="chip bg-blue-50 text-blue-700">{s}</span>)}</div>
          </section>
        )}

        {a.education?.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-bold">Education</h4>
            <ul className="space-y-1.5 text-sm">
              {a.education.map((e, i) => (
                <li key={i} className="text-slate-600"><span className="font-semibold text-slate-800">{e.degree}</span>{e.institution ? `, ${e.institution}` : ''}{e.year ? ` (${e.year})` : ''}</li>
              ))}
            </ul>
          </section>
        )}

        {application.coverLetter && (
          <section>
            <h4 className="mb-2 text-sm font-bold">Cover letter</h4>
            <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{application.coverLetter}</p>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-sm font-bold">Application history</h4>
          <ol className="space-y-2 border-l-2 border-slate-200 pl-4 text-sm">
            {(application.statusHistory || []).map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full bg-blue-600" />
                <span className="font-semibold text-slate-800">{h.status}</span> <span className="text-slate-400">· {formatDate(h.changedAt, true)}</span>
              </li>
            ))}
          </ol>
        </section>

        <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full sm:w-auto">
          <FiFileText /> View resume (PDF) <FiExternalLink />
        </a>
      </div>
    </Modal>
  );
}

const ACTIONS = [
  { status: 'Under Review', label: 'Review', cls: 'btn-outline' },
  { status: 'Shortlisted', label: 'Shortlist', cls: 'btn-primary' },
  { status: 'Hired', label: 'Hire', cls: 'btn-outline' },
  { status: 'Rejected', label: 'Reject', cls: 'btn-outline text-red-600 hover:bg-red-50' },
];

export default function ApplicantCard({ application, onStatusChange, busy }) {
  const [open, setOpen] = useState(false);
  const a = application.applicant;
  return (
    <article className="card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={a.name} src={a.profileImage} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold">{a.name}</h3>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-sm text-slate-500">
            Applied for <span className="font-semibold text-slate-700">{application.job?.title}</span> · {timeAgo(application.appliedAt)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{a.headline || 'Job seeker'} · {a.experience ?? 0} yr exp{a.location ? ` · ${a.location}` : ''}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(a.skills || []).slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}><FiUser /> Profile</button>
        <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><FiFileText /> Resume</a>
        <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
        {ACTIONS.filter((x) => x.status !== application.status).map((x) => (
          <button key={x.status} disabled={busy} onClick={() => onStatusChange(application, x.status)} className={`btn btn-sm ${x.cls}`}>
            {x.label}
          </button>
        ))}
      </div>
      {open && <ApplicantProfileModal application={application} onClose={() => setOpen(false)} />}
    </article>
  );
}
