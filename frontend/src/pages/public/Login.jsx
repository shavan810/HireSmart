import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthShell from './AuthShell';
import FormField from '../../components/FormField';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { dashboardPath } from '../../utils/constants';
import { emailRegex, getErrorMessage } from '../../utils/format';

export default function Login({ admin = false }) {
  const { login, adminLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!emailRegex.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setServerError('');
    try {
      const user = await (admin ? adminLogin : login)({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : dashboardPath(user.role), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={admin ? 'Administrator sign in' : 'Welcome back'}
      subtitle={admin ? 'Restricted area. Authorized personnel only.' : 'Log in to continue to your dashboard.'}
      aside={{ title: admin ? 'Keep the platform healthy.' : 'Your next opportunity is one login away.', points: admin ? ['Manage users, jobs and applications', 'Monitor platform analytics'] : ['Track every application in real time', 'Get notified the moment a recruiter responds', 'Improve your resume with AI feedback'] }}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {serverError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{serverError}</div>}
        <FormField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} placeholder="you@example.com" />
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={onChange} className={`input pr-11 ${errors.password ? 'input-error' : ''}`} placeholder="Your password" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show ? <FiEyeOff /> : <FiEye />}</button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <button className="btn btn-primary w-full py-3" disabled={busy}>{busy ? 'Signing in...' : 'Log in'}</button>
      </form>
      {!admin && <p className="mt-6 text-center text-sm text-slate-500">New to HireSmart? <Link to="/register" className="font-bold text-blue-600 hover:underline">Create an account</Link></p>}
    </AuthShell>
  );
}
