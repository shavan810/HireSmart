import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import ConfirmationModal from '../../components/ConfirmationModal';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage, getFieldErrors } from '../../utils/format';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState({ open: false, password: '', busy: false, error: '' });

  const changePassword = async (e) => {
    e.preventDefault();
    const next = {};
    if (!pw.currentPassword) next.currentPassword = 'Enter your current password';
    if (pw.newPassword.length < 8) next.newPassword = 'Use at least 8 characters';
    else if (!/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword)) next.newPassword = 'Include a letter and a number';
    if (pw.confirm !== pw.newPassword) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password updated');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleEmails = async () => {
    try {
      const res = await userService.updatePreferences({ emailNotifications: !user.emailNotifications });
      setUser(res.user);
      toast.success(res.user.emailNotifications ? 'Email notifications turned on' : 'Email notifications turned off');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteAccount = async () => {
    setDel((d) => ({ ...d, busy: true, error: '' }));
    try {
      await userService.deleteAccount(del.password);
      toast.success('Your account has been deleted');
      logout();
      navigate('/');
    } catch (err) {
      setDel((d) => ({ ...d, busy: false, error: getErrorMessage(err) }));
    }
  };

  const onPw = (e) => { setPw({ ...pw, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your sign-in details and preferences." />
      <div className="grid max-w-4xl gap-6">
        <section className="card p-6">
          <h2 className="text-lg font-bold">Account</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Name</dt><dd className="font-semibold text-slate-800">{user.name}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-slate-800">{user.email}</dd></div>
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Change password</h2>
          <form onSubmit={changePassword} noValidate className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={onPw} error={errors.currentPassword} />
            <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" value={pw.newPassword} onChange={onPw} error={errors.newPassword} />
            <FormField label="Confirm new password" name="confirm" type="password" autoComplete="new-password" value={pw.confirm} onChange={onPw} error={errors.confirm} />
            <div className="sm:col-span-3"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update password'}</button></div>
          </form>
        </section>

        <section className="card flex items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold">Email notifications</h2>
            <p className="mt-1 text-sm text-slate-500">Receive an email when something important happens, in addition to in-app alerts.</p>
          </div>
          <button role="switch" aria-checked={user.emailNotifications} aria-label="Email notifications" onClick={toggleEmails} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${user.emailNotifications ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${user.emailNotifications ? 'left-[1.4rem]' : 'left-0.5'}`} />
          </button>
        </section>

        {user.role !== 'admin' && (
          <section className="card border-red-200 p-6">
            <h2 className="text-lg font-bold text-red-700">Delete account</h2>
            <p className="mt-1 text-sm text-slate-500">Permanently removes your profile{user.role === 'recruiter' ? ', jobs and received applications' : ', applications and resume'}. This cannot be undone.</p>
            <button className="btn btn-danger mt-4" onClick={() => setDel({ open: true, password: '', busy: false, error: '' })}>Delete my account</button>
          </section>
        )}
      </div>

      <ConfirmationModal open={del.open} title="Delete your account?" confirmLabel="Delete permanently" loading={del.busy} onCancel={() => setDel({ ...del, open: false })} onConfirm={deleteAccount} message="Enter your password to confirm. All your data will be removed.">
        <div className="mt-3">
          <input type="password" className="input" placeholder="Your password" value={del.password} onChange={(e) => setDel({ ...del, password: e.target.value })} aria-label="Password" />
          {del.error && <p className="field-error">{del.error}</p>}
        </div>
      </ConfirmationModal>
    </>
  );
}
