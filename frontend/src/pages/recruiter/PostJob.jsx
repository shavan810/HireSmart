import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import TagInput from '../../components/TagInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { CATEGORIES, CURRENCIES, EXPERIENCE_LEVELS, JOB_TYPES } from '../../utils/constants';
import { getErrorMessage, getFieldErrors } from '../../utils/format';

const EMPTY = { title: '', category: CATEGORIES[0], jobType: JOB_TYPES[0], experienceLevel: EXPERIENCE_LEVELS[1], location: '', currency: 'INR', salaryMin: '', salaryMax: '', deadline: '', status: 'open', description: '', requirements: '', responsibilities: '' };

export default function PostJob() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    jobService.get(id).then(({ job }) => {
      setForm({
        title: job.title, category: job.category, jobType: job.jobType, experienceLevel: job.experienceLevel, location: job.location, currency: job.currency || 'INR',
        salaryMin: job.salaryMin || '', salaryMax: job.salaryMax || '', deadline: job.deadline ? job.deadline.slice(0, 10) : '', status: job.status,
        description: job.description, requirements: (job.requirements || []).join('\n'), responsibilities: (job.responsibilities || []).join('\n'),
      });
      setSkills(job.skills || []);
    }).catch((err) => setLoadError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [id, editing]);

  if (!user.companyName) {
    return <div className="card p-8 text-center"><h2 className="text-lg font-bold">Complete your company profile first</h2><p className="mt-1 text-slate-500">Add your company name before posting jobs.</p><Link to="/recruiter/company" className="btn btn-primary mt-4">Go to company profile</Link></div>;
  }
  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} />;

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 3) e.title = 'Enter a job title (at least 3 characters)';
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.description.trim().length < 30) e.description = 'Describe the role in at least 30 characters';
    const min = Number(form.salaryMin), max = Number(form.salaryMax);
    if (form.salaryMin && min < 0) e.salaryMin = 'Must be a positive number';
    if (form.salaryMax && max < 0) e.salaryMax = 'Must be a positive number';
    if (min && max && max < min) e.salaryMax = 'Maximum must be at least the minimum';
    if (form.deadline && !editing && new Date(form.deadline) < new Date(new Date().toDateString())) e.deadline = 'Deadline cannot be in the past';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return toast.error('Please fix the highlighted fields');
    setSaving(true);
    try {
      const payload = { ...form, skills, salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0 };
      if (editing) await jobService.update(id, payload);
      else await jobService.create(payload);
      toast.success(editing ? 'Job updated' : 'Job posted');
      navigate('/recruiter/jobs');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const opts = (list) => list.map((o) => <option key={o}>{o}</option>);
  return (
    <>
      <PageHeader title={editing ? 'Edit job' : 'Post a job'} subtitle={editing ? 'Update the details of this vacancy.' : 'Describe the role to attract the right candidates.'} />
      <form onSubmit={submit} noValidate className="grid max-w-4xl gap-6">
        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-lg font-bold sm:col-span-2">Job basics</h2>
          <FormField className="sm:col-span-2" label="Job title" name="title" value={form.title} onChange={onChange} error={errors.title} placeholder="e.g. Senior React Developer" maxLength={120} />
          <FormField label="Category" name="category" as="select" value={form.category} onChange={onChange} error={errors.category}>{opts(CATEGORIES)}</FormField>
          <FormField label="Job type" name="jobType" as="select" value={form.jobType} onChange={onChange}>{opts(JOB_TYPES)}</FormField>
          <FormField label="Experience level" name="experienceLevel" as="select" value={form.experienceLevel} onChange={onChange}>{opts(EXPERIENCE_LEVELS)}</FormField>
          <FormField label="Location" name="location" value={form.location} onChange={onChange} error={errors.location} placeholder="City or Remote" />
          <FormField label="Application deadline" name="deadline" type="date" value={form.deadline} onChange={onChange} error={errors.deadline} hint="Optional" />
          {editing && <FormField label="Status" name="status" as="select" value={form.status} onChange={onChange}><option value="open">Open</option><option value="closed">Closed</option></FormField>}
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-3">
          <h2 className="text-lg font-bold sm:col-span-3">Yearly salary <span className="text-sm font-normal text-slate-400">(optional)</span></h2>
          <FormField label="Currency" name="currency" as="select" value={form.currency} onChange={onChange}>{opts(CURRENCIES)}</FormField>
          <FormField label="Minimum" name="salaryMin" type="number" min="0" value={form.salaryMin} onChange={onChange} error={errors.salaryMin} placeholder="600000" />
          <FormField label="Maximum" name="salaryMax" type="number" min="0" value={form.salaryMax} onChange={onChange} error={errors.salaryMax} placeholder="1200000" />
        </section>

        <section className="card grid gap-4 p-6">
          <h2 className="text-lg font-bold">Details</h2>
          <FormField label="Description" name="description" as="textarea" value={form.description} onChange={onChange} error={errors.description} maxLength={6000} placeholder="What will this person do and why does it matter?" />
          <FormField label="Responsibilities" name="responsibilities" as="textarea" value={form.responsibilities} onChange={onChange} hint="One per line" />
          <FormField label="Requirements" name="requirements" as="textarea" value={form.requirements} onChange={onChange} hint="One per line" />
          <TagInput label="Required skills" tags={skills} onChange={setSkills} placeholder="Add a skill and press Enter" />
        </section>

        <div className="flex gap-3">
          <button className="btn btn-primary px-8" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Publish job'}</button>
          <Link to="/recruiter/jobs" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </>
  );
}
