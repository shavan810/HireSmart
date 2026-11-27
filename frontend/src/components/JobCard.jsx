import { Link } from 'react-router-dom';
import { FiBriefcase, FiClock, FiMapPin } from 'react-icons/fi';
import Avatar from './Avatar';
import { formatSalary, timeAgo } from '../utils/format';

export default function JobCard({ job }) {
  const company = job.company || job.recruiter?.companyName || 'Company';
  return (
    <Link to={`/jobs/${job._id}`} className="card group flex h-full flex-col p-5 transition-shadow hover:shadow-pop focus-visible:outline-blue-600">
      <div className="flex items-start gap-3">
        <Avatar name={company} src={job.recruiter?.profileImage} size="md" square />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-navy-800 group-hover:text-blue-600">{job.title}</h3>
          <p className="truncate text-sm text-slate-500">{company}</p>
        </div>
        <span className="chip shrink-0 bg-blue-50 text-blue-700">{job.jobType}</span>
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <FiMapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <dt className="sr-only">Location</dt>
          <dd className="truncate">{job.location}</dd>
        </div>
        <div className="flex items-center gap-2">
          <FiBriefcase className="h-4 w-4 shrink-0 text-slate-400" />
          <dt className="sr-only">Experience and salary</dt>
          <dd className="truncate">
            {job.experienceLevel} · {formatSalary(job)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(job.skills || []).slice(0, 3).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {job.skills?.length > 3 && <span className="chip">+{job.skills.length - 3}</span>}
      </div>
      <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-slate-400">
        <FiClock /> Posted {timeAgo(job.createdAt)}
      </p>
    </Link>
  );
}
