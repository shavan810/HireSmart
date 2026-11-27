import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiBriefcase, FiUser } from 'react-icons/fi';
import AuthShell from './AuthShell';
import FormField from '../../components/FormField';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { dashboardPath } from '../../utils/constants';
import { emailRegex, getErrorMessage, getFieldErrors } from '../../utils/format';

const ROLE_OPTIONS = [
  { value: 'jobseeker', label: 'Job seeker', hint: 'Find and apply for jobs', icon: FiUser },
  { value: 'recruiter', label: 'Recruiter', hint: 'Post jobs and hire', icon: FiBriefcase },
];

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ role: params.get('role') === 'recruiter' ? 'recruiter' : 'jobseeker', name: '', email: '', password: '', confirm: '', companyName: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!emailRegex.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Use at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'Include at least one letter and one number';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (form.role === 'recruiter' && !form.companyName.trim()) e.companyName = 'Company name is required';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setServerError('');
    try {
      const { confirm, ...payload } = form;
      const user = await register({ ...payload, name: payload.name.trim(), email: payload.email.trim() });
      toast.success('Account created. Welcome to HireSmart!');
      navigate(dashboardPath(user.role), { replace: true });
    } catch (err) {
      setErrors((p) => ({ ...p, ...getFieldErrors(err) }));
      setServerError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute."
      aside={{ title: 'Hire smarter. Get hired faster.', points: ['Free for job seekers', 'Recruiters see resumes and profiles in one place', 'AI feedback on every resume'] }}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {serverError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{serverError}</div>}

        <fieldset>
          <legend className="label">I am a</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((o) => (
              <label key={o.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${form.role === o.value ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                <input type="radio" name="role" value={o.value} checked={form.role === o.value} onChange={onChange} className="sr-only" />
                <o.icon className={`h-5 w-5 ${form.role === o.value ? 'text-blue-600' : 'text-slate-400'}`} />
                <span><span className="block text-sm font-bold text-navy-800">{o.label}</span><span className="block text-xs text-slate-500">{o.hint}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <FormField label="Full name" name="name" autoComplete="name" value={form.name} onChange={onChange} error={errors.name} />
        {form.role === 'recruiter' && <FormField label="Company name" name="companyName" value={form.companyName} onChange={onChange} error={errors.companyName} />}
        <FormField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} hint="8+ characters with a letter and number" />
          <FormField label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={onChange} error={errors.confirm} />
        </div>
        <button className="btn btn-primary w-full py-3" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:underline">Log in</Link></p>
    </AuthShell>
  );
}
