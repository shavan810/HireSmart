import { useRef, useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import Avatar from '../../components/Avatar';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage, getFieldErrors } from '../../utils/format';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompanyProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user.name || '', phone: user.phone || '', companyName: user.companyName || '', industry: user.industry || '', companySize: user.companySize || '',
    companyWebsite: user.companyWebsite || '', companyLocation: user.companyLocation || '', companyDescription: user.companyDescription || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.companyName.trim()) next.companyName = 'Company name is required';
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (form.companyWebsite && !/^https?:\/\/\S+\.\S+/.test(form.companyWebsite)) next.companyWebsite = 'Enter a full URL starting with http:// or https://';
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      setUser(res.user);
      toast.success('Company profile saved');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Choose a JPG, PNG or WEBP image');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be smaller than 2 MB');
    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      setUser(res.user);
      toast.success('Logo updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader title="Company profile" subtitle="Shown on every job you post." />
      <form onSubmit={save} noValidate className="grid max-w-4xl gap-6">
        <section className="card flex flex-col items-center gap-5 p-6 sm:flex-row">
          <div className="relative">
            <Avatar name={user.companyName || user.name} src={user.profileImage} size="xl" square />
            <button type="button" onClick={() => fileRef.current.click()} disabled={uploading} aria-label="Change company logo" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 disabled:opacity-60"><FiCamera /></button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onLogo} />
          </div>
          <div className="text-center sm:text-left"><h2 className="text-lg font-bold">{user.companyName}</h2><p className="text-xs text-slate-400">{uploading ? 'Uploading logo...' : 'Company logo. JPG, PNG or WEBP, up to 2 MB'}</p></div>
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-lg font-bold sm:col-span-2">Company details</h2>
          <FormField label="Company name" name="companyName" value={form.companyName} onChange={onChange} error={errors.companyName} />
          <FormField label="Industry" name="industry" value={form.industry} onChange={onChange} placeholder="e.g. Fintech" />
          <FormField label="Company size" name="companySize" as="select" value={form.companySize} onChange={onChange}><option value="">Select size</option>{SIZES.map((s) => <option key={s}>{s}</option>)}</FormField>
          <FormField label="Website" name="companyWebsite" value={form.companyWebsite} onChange={onChange} error={errors.companyWebsite} placeholder="https://example.com" />
          <FormField className="sm:col-span-2" label="Headquarters" name="companyLocation" value={form.companyLocation} onChange={onChange} placeholder="City, Country" />
          <FormField className="sm:col-span-2" label="About the company" name="companyDescription" as="textarea" value={form.companyDescription} onChange={onChange} maxLength={2000} />
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-lg font-bold sm:col-span-2">Your details</h2>
          <FormField label="Your name" name="name" value={form.name} onChange={onChange} error={errors.name} />
          <FormField label="Phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
        </section>
        <div><button className="btn btn-primary px-8" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></div>
      </form>
    </>
  );
}
