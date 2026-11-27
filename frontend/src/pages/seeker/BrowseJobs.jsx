import PageHeader from '../../components/PageHeader';
import JobsExplorer from '../../components/JobsExplorer';

export default function BrowseJobs() {
  return (
    <>
      <PageHeader title="Browse jobs" subtitle="Search and filter every open position." />
      <JobsExplorer />
    </>
  );
}
