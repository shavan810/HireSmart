import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiCpu, FiTarget, FiTool } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { ScoreRing } from '../../components/Charts';
import { Skeleton } from '../../components/Skeleton';
import { aiService } from '../../services/aiService';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useFetch } from '../../hooks/useFetch';
import { formatDate, getErrorMessage } from '../../utils/format';

const List = ({ title, items, icon: Icon, tone }) => (
  <section className="card p-5">
    <h3 className={`mb-3 flex items-center gap-2 text-base font-bold ${tone}`}><Icon /> {title}</h3>
    {items?.length ? <ul className="space-y-2 text-sm text-slate-600">{items.map((t, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />{t}</li>)}</ul> : <p className="text-sm text-slate-400">Nothing to show.</p>}
  </section>
);

const Chips = ({ items, cls }) => (items?.length ? <div className="flex flex-wrap gap-1.5">{items.map((s) => <span key={s} className={`chip ${cls}`}>{s}</span>)}</div> : <p className="text-sm text-slate-400">None found.</p>);

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [jobId, setJobId] = useState(params.get('jobId') || '');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const jobs = useFetch(() => jobService.list({ limit: 50 }), []);
  const history = useFetch(() => aiService.history(), []);

  // Show the most recent analysis on first load.
  useEffect(() => {
    if (!result && history.data?.analyses?.length) setResult(history.data.analyses[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.data]);

  const run = async () => {
    setRunning(true);
    try {
      const res = await aiService.analyze(jobId || undefined);
      setResult(res.analysis);
      toast.success('Analysis complete');
      history.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  if (!user.resumeUrl)
    return (
      <>
        <PageHeader title="AI resume analyzer" />
        <EmptyState icon={FiCpu} title="Upload a resume to get started" message="The analyzer reads your PDF resume and returns a score, missing skills and suggestions." action={<Link to="/seeker/resume" className="btn btn-primary">Upload resume</Link>} />
      </>
    );

  return (
    <>
      <PageHeader title="AI resume analyzer" subtitle="Powered by Google Gemini. Your resume is analyzed securely on our server." />

      <section className="card mb-6 flex flex-col gap-4 p-5 md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="job" className="label">Compare against a job <span className="font-normal text-slate-400">(optional)</span></label>
          <select id="job" className="input" value={jobId} onChange={(e) => setJobId(e.target.value)} disabled={running}>
            <option value="">General analysis (no specific job)</option>
            {jobs.data?.jobs.map((j) => <option key={j._id} value={j._id}>{j.title} · {j.company}</option>)}
          </select>
        </div>
        <button className="btn btn-primary md:min-w-[180px]" onClick={run} disabled={running}><FiCpu /> {running ? 'Analyzing...' : 'Analyze my resume'}</button>
      </section>

      {running && (
        <div className="space-y-4" role="status" aria-live="polite">
          <p className="text-sm font-medium text-slate-500">Reading your resume. This usually takes 10 to 20 seconds.</p>
          <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-48" /><Skeleton className="h-48 md:col-span-2" /></div>
          <Skeleton className="h-40" />
        </div>
      )}

      {!running && result && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <section className="card flex flex-col items-center p-6">
              <ScoreRing score={result.score} label="Resume score" />
              <p className="mt-3 text-xs text-slate-400">Analyzed {formatDate(result.createdAt, true)}</p>
              {result.job && <p className="mt-1 text-center text-xs text-slate-500">Against: {result.job.title}</p>}
            </section>
            <section className="card p-6">
              <h2 className="text-lg font-bold">Summary</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{result.summary}</p>
              <h3 className="mb-2 mt-5 text-sm font-bold">Skills detected</h3>
              <Chips items={result.detectedSkills} cls="bg-blue-50 text-blue-700" />
            </section>
          </div>

          {result.jobMatch && (
            <section className="card p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <ScoreRing score={result.jobMatch.score} size={110} label="Job match" />
                <div className="flex-1">
                  <h2 className="flex items-center gap-2 text-lg font-bold"><FiTarget className="text-blue-600" /> Match for {result.job?.title}</h2>
                  <p className="mt-1 text-slate-600">{result.jobMatch.verdict}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div><h3 className="mb-2 text-sm font-bold text-emerald-700">Skills you match</h3><Chips items={result.jobMatch.matchedSkills} cls="bg-emerald-50 text-emerald-700" /></div>
                <div><h3 className="mb-2 text-sm font-bold text-red-700">Skills to add</h3><Chips items={result.jobMatch.missingSkills} cls="bg-red-50 text-red-700" /></div>
              </div>
            </section>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <List title="Strengths" items={result.strengths} icon={FiCheckCircle} tone="text-emerald-700" />
            <List title="Weaknesses" items={result.weaknesses} icon={FiAlertCircle} tone="text-amber-700" />
          </div>

          <section className="card p-5">
            <h3 className="mb-3 text-base font-bold">Missing skills worth adding</h3>
            <Chips items={result.missingSkills} cls="bg-amber-50 text-amber-800" />
          </section>

          <List title="Suggested improvements" items={result.suggestions} icon={FiTool} tone="text-blue-700" />
        </div>
      )}

      {!running && !result && !history.loading && <EmptyState icon={FiCpu} title="No analysis yet" message="Choose an optional job above and run your first analysis." />}

      {history.data?.analyses?.length > 1 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">Previous analyses</h2>
          <ul className="card divide-y divide-slate-100">
            {history.data.analyses.map((a) => (
              <li key={a._id}>
                <button onClick={() => { setResult(a); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 ${result?._id === a._id ? 'bg-blue-50/50' : ''}`}>
                  <span><span className="block text-sm font-semibold text-slate-800">{a.job ? `Match for ${a.job.title}` : 'General analysis'}</span><span className="text-xs text-slate-400">{formatDate(a.createdAt, true)}</span></span>
                  <span className="text-lg font-extrabold text-navy-800">{a.score}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
