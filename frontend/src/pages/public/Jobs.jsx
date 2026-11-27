import JobsExplorer from '../../components/JobsExplorer';

export default function Jobs() {
  return (
    <div className="page-container py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Find your next job</h1>
        <p className="mt-1 text-slate-500">Search by title, skill or company, then narrow it down with filters.</p>
      </div>
      <JobsExplorer />
    </div>
  );
}
