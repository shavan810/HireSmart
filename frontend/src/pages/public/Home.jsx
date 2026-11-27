import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBriefcase, FiCheckCircle, FiCpu, FiUploadCloud, FiUsers, FiZap } from 'react-icons/fi';
import SearchBar from '../../components/SearchBar';
import JobCard from '../../components/JobCard';
import { JobCardSkeleton, Skeleton } from '../../components/Skeleton';
import { jobService } from '../../services/jobService';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { dashboardPath } from '../../utils/constants';

const STEPS = [
  { icon: FiUploadCloud, title: 'Build your profile', text: 'Add your skills, experience and upload a PDF resume once.' },
  { icon: FiBriefcase, title: 'Apply in one click', text: 'Pick a role, add a short note and your resume is sent instantly.' },
  { icon: FiZap, title: 'Track every step', text: 'Get a live notification the moment a recruiter updates your status.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useFetch(() => jobService.stats(), []);
  const latest = useFetch(() => jobService.list({ limit: 6 }), []);

  const search = ({ q, location }) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (location) p.set('location', location);
    navigate(`/jobs?${p.toString()}`);
  };

  const topCategories = (stats.data?.categories || []).filter((c) => c.count > 0).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-800">
        <div className="page-container py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">Find work that fits your skills, not just your title.</h1>
            <p className="mt-5 max-w-2xl text-lg text-navy-200">Search real openings, apply with your resume and let AI show you exactly what to improve before a recruiter sees it.</p>
          </div>
          <div className="mt-10 max-w-4xl">
            <SearchBar large onSearch={search} />
          </div>
          {topCategories.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-navy-300">Popular:</span>
              {topCategories.slice(0, 4).map((c) => (
                <Link key={c.name} to={`/jobs?category=${encodeURIComponent(c.name)}`} className="rounded-full border border-white/20 px-3 py-1 text-sm font-medium text-white hover:bg-white/10">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Live stats */}
      <section className="border-b border-slate-200 bg-white">
        <dl className="page-container grid grid-cols-2 divide-x divide-slate-200 py-6 text-center">
          {stats.loading ? (
            <>
              <Skeleton className="mx-auto h-10 w-32" />
              <Skeleton className="mx-auto h-10 w-32" />
            </>
          ) : (
            <>
              <div className="px-4"><dd className="text-3xl font-extrabold text-navy-800">{stats.data?.totalJobs ?? 0}</dd><dt className="text-sm text-slate-500">Open positions</dt></div>
              <div className="px-4"><dd className="text-3xl font-extrabold text-navy-800">{stats.data?.totalCompanies ?? 0}</dd><dt className="text-sm text-slate-500">Hiring companies</dt></div>
            </>
          )}
        </dl>
      </section>

      {/* Latest jobs */}
      <section className="page-container py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">Latest openings</h2>
            <p className="mt-1 text-slate-500">Fresh roles posted by verified recruiters.</p>
          </div>
          <Link to="/jobs" className="hidden items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 sm:inline-flex">View all jobs <FiArrowRight /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.loading ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />) : latest.data?.jobs.map((j) => <JobCard key={j._id} job={j} />)}
        </div>
        {!latest.loading && latest.data?.jobs.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">No jobs have been posted yet. Check back soon.</p>}
        <Link to="/jobs" className="btn btn-outline mt-6 w-full sm:hidden">View all jobs</Link>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="bg-white py-16">
          <div className="page-container">
            <h2 className="text-3xl font-extrabold">Browse by category</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topCategories.map((c) => (
                <Link key={c.name} to={`/jobs?category=${encodeURIComponent(c.name)}`} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40">
                  <span className="font-semibold text-navy-800">{c.name}</span>
                  <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-bold text-navy-700">{c.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works (a real sequence) */}
      <section className="page-container py-16">
        <h2 className="text-3xl font-extrabold">How HireSmart works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><s.icon className="h-5 w-5" /></span>
                <span className="text-sm font-bold text-slate-400">Step {i + 1}</span>
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-slate-500">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* AI feature */}
      <section className="bg-navy-50 py-16">
        <div className="page-container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700 shadow-card"><FiCpu /> Powered by Google Gemini</span>
            <h2 className="mt-4 text-3xl font-extrabold">Know your resume score before you apply</h2>
            <p className="mt-3 text-slate-600">Upload your PDF and get an honest score, the skills you are missing and concrete edits. Pick a job and see how well your resume matches its requirements.</p>
            <ul className="mt-5 space-y-2.5 text-slate-700">
              {['Resume score out of 100', 'Missing skills for your target role', 'Match percentage against any job'].map((t) => (
                <li key={t} className="flex items-center gap-2.5"><FiCheckCircle className="shrink-0 text-emerald-600" />{t}</li>
              ))}
            </ul>
            <Link to={user?.role === 'jobseeker' ? '/seeker/analyzer' : '/register'} className="btn btn-primary mt-7">Try the resume analyzer</Link>
          </div>
          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold">What you get in every analysis</h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[['Strengths', 'What already works in your resume'], ['Weaknesses', 'Gaps recruiters will notice'], ['Skill gaps', 'Missing keywords for your field'], ['Action plan', 'Specific edits ranked by impact']].map(([t, d]) => (
                <div key={t} className="rounded-lg bg-slate-50 p-4"><dt className="font-bold text-navy-800">{t}</dt><dd className="mt-0.5 text-sm text-slate-500">{d}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Recruiter CTA */}
      <section className="page-container py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy-800 p-8 sm:p-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-3 text-3xl font-extrabold text-white"><FiUsers className="hidden sm:block" /> Hiring? Reach qualified candidates faster.</h2>
            <p className="mt-3 text-navy-200">Post a job in minutes, review applicants with their resumes and move candidates through your pipeline in real time.</p>
          </div>
          {user?.role === 'recruiter' ? (
            <Link to="/recruiter/post-job" className="btn bg-white text-navy-800 hover:bg-navy-50">Post a job</Link>
          ) : user ? (
            <Link to={dashboardPath(user.role)} className="btn bg-white text-navy-800 hover:bg-navy-50">Go to dashboard</Link>
          ) : (
            <Link to="/register?role=recruiter" className="btn bg-white text-navy-800 hover:bg-navy-50">Start hiring</Link>
          )}
        </div>
      </section>
    </>
  );
}
