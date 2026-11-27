import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiBriefcase, FiCalendar, FiCheckCircle, FiCpu, FiExternalLink, FiMapPin, FiTag } from 'react-icons/fi';
import Avatar from '../../components/Avatar';
import Modal from '../../components/Modal';
import ErrorState from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatSalary, getErrorMessage, timeAgo } from '../../utils/format';

const Section = ({ title, items }) =>
  items?.length ? (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-slate-600"><FiCheckCircle className="mt-1 shrink-0 text-blue-600" />{t}</li>
        ))}
      </ul>
    </section>
  ) : null;

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, reload } = useFetch(() => jobService.get(id), [id]);
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [sending, setSending] = useState(false);

  if (loading)
    return (
      <div className="page-container space-y-4 py-10">
        <Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-64 w-full" />
      </div>
    );
  if (error) return <div className="page-container py-10"><ErrorState message={error} onRetry={reload} /><Link to="/jobs" className="btn btn-outline mt-4">Back to jobs</Link></div>;

  const { job, hasApplied } = data;
  const company = job.company || job.recruiter?.companyName;
  const isSeeker = user?.role === 'jobseeker';
  const closed = job.status !== 'open' || (job.deadline && new Date(job.deadline) < new Date());

  const submit = async () => {
    setSending(true);
    try {
      await applicationService.apply(job._id, { coverLetter: cover });
      toast.success('Application submitted. Good luck!');
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const ApplyBox = () => {
    if (closed) return <button disabled className="btn btn-outline w-full">Applications closed</button>;
    if (!user) return <Link to="/login" state={{ from: location }} className="btn btn-primary w-full">Log in to apply</Link>;
    if (!isSeeker) return <p className="rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500">Only job seeker accounts can apply for jobs.</p>;
    if (hasApplied) return (
      <div className="space-y-2">
        <button disabled className="btn btn-outline w-full"><FiCheckCircle className="text-emerald-600" /> Already applied</button>
        <Link to="/seeker/tracking" className="btn btn-ghost w-full">Track application</Link>
      </div>
    );
    if (!user.resumeUrl) return (
      <div className="space-y-2">
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Upload your resume before you apply.</p>
        <Link to="/seeker/resume" className="btn btn-primary w-full">Upload resume</Link>
      </div>
    );
    return <button onClick={() => setOpen(true)} className="btn btn-primary w-full">Apply now</button>;
  };

  return (
    <div className="page-container py-8 sm:py-10">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"><FiArrowLeft /> Back</button>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article className="card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Avatar name={company} src={job.recruiter?.profileImage} size="lg" square />
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-slate-500">{company} · Posted {timeAgo(job.createdAt)}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2"><FiMapPin className="text-slate-400" /><dt className="sr-only">Location</dt><dd>{job.location}</dd></div>
            <div className="flex items-center gap-2"><FiBriefcase className="text-slate-400" /><dt className="sr-only">Type</dt><dd>{job.jobType} · {job.experienceLevel}</dd></div>
            <div className="flex items-center gap-2"><FiTag className="text-slate-400" /><dt className="sr-only">Category</dt><dd>{job.category}</dd></div>
            <div className="flex items-center gap-2 font-semibold text-navy-800"><span className="text-slate-400">₹</span><dt className="sr-only">Salary</dt><dd>{formatSalary(job)}</dd></div>
            {job.deadline && <div className="flex items-center gap-2"><FiCalendar className="text-slate-400" /><dt className="sr-only">Deadline</dt><dd>Apply by {formatDate(job.deadline)}</dd></div>}
          </dl>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">About the role</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">{job.description}</p>
          </section>
          <Section title="Responsibilities" items={job.responsibilities} />
          <Section title="Requirements" items={job.requirements} />

          {job.skills?.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Skills</h2>
              <div className="flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className="chip bg-blue-50 text-blue-700">{s}</span>)}</div>
            </section>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <ApplyBox />
            {isSeeker && !closed && (
              <Link to={`/seeker/analyzer?jobId=${job._id}`} className="btn btn-outline mt-3 w-full"><FiCpu /> Check my resume match</Link>
            )}
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold">About {company}</h2>
            {job.recruiter?.industry && <p className="text-sm text-slate-500">{job.recruiter.industry}{job.recruiter.companySize ? ` · ${job.recruiter.companySize} employees` : ''}</p>}
            {job.recruiter?.companyLocation && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><FiMapPin />{job.recruiter.companyLocation}</p>}
            {job.recruiter?.companyDescription && <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.recruiter.companyDescription}</p>}
            {job.recruiter?.companyWebsite && <a href={job.recruiter.companyWebsite} target="_blank" rel="noreferrer noopener" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">Company website <FiExternalLink /></a>}
          </div>
        </aside>
      </div>

      <Modal open={open} onClose={() => !sending && setOpen(false)} title={`Apply for ${job.title}`}
        footer={<><button className="btn btn-outline" onClick={() => setOpen(false)} disabled={sending}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={sending}>{sending ? 'Submitting...' : 'Submit application'}</button></>}>
        <p className="mb-4 text-sm text-slate-500">Your uploaded resume <span className="font-semibold text-slate-700">{user?.resumeName || 'resume.pdf'}</span> will be sent with this application.</p>
        <label htmlFor="cover" className="label">Cover letter <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="cover" value={cover} onChange={(e) => setCover(e.target.value)} maxLength={2000} className="input min-h-[150px] resize-y" placeholder="Tell the recruiter why you are a great fit..." />
        <p className="mt-1 text-right text-xs text-slate-400">{cover.length}/2000</p>
      </Modal>
    </div>
  );
}
