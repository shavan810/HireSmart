import { useState } from 'react';
import { FiClock, FiMail, FiMapPin } from 'react-icons/fi';
import FormField from '../../components/FormField';
import { contactService } from '../../services/contactService';
import { useToast } from '../../hooks/useToast';
import { emailRegex, getErrorMessage, getFieldErrors } from '../../utils/format';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name';
    if (!emailRegex.test(form.email)) e.email = 'Enter a valid email address';
    if (form.subject.trim().length < 3) e.subject = 'Add a subject';
    if (form.message.trim().length < 10) e.message = 'Write at least 10 characters';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const res = await contactService.send(form);
      toast.success(res.message);
      setForm(EMPTY);
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Contact us</h1>
        <p className="mt-2 text-slate-500">Questions about your account, a job post or partnerships? Send us a message.</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={submit} noValidate className="card space-y-4 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} />
              <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
            </div>
            <FormField label="Subject" name="subject" value={form.subject} onChange={onChange} error={errors.subject} />
            <FormField label="Message" name="message" as="textarea" value={form.message} onChange={onChange} error={errors.message} maxLength={2000} />
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
          </form>
          <aside className="space-y-4">
            {[[FiMail, 'Email', 'support@hiresmart.com'], [FiClock, 'Response time', 'Within two working days'], [FiMapPin, 'Office', 'Mumbai, Maharashtra, India']].map(([Icon, t, v]) => (
              <div key={t} className="card flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></span>
                <div><p className="text-sm text-slate-500">{t}</p><p className="font-semibold text-navy-800">{v}</p></div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
