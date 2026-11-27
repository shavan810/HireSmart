import { useRef, useState } from 'react';
import { FiCamera, FiPlus, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import TagInput from '../../components/TagInput';
import Avatar from '../../components/Avatar';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage, getFieldErrors } from '../../utils/format';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user.name || '', headline: user.headline || '', phone: user.phone || '', location: user.location || '', bio: user.bio || '', experience: user.experience ?? 0,
  });
  const [skills, setSkills] = useState(user.skills || []);
  const [education, setEducation] = useState(user.education?.length ? user.education : []);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };
  const editEdu = (i, key, value) => setEducation(education.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number';
    if (form.experience < 0 || form.experience > 60) next.experience = 'Enter a value between 0 and 60';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const res = await userService.updateProfile({ ...form, experience: Number(form.experience) || 0, skills, education });
      setUser(res.user);
      toast.success('Profile saved');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Choose a JPG, PNG or WEBP image');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be smaller than 2 MB');
    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      setUser(res.user);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader title="My profile" subtitle="Recruiters see this information when you apply." />
      <form onSubmit={save} noValidate className="grid max-w-4xl gap-6">
        <section className="card flex flex-col items-center gap-5 p-6 sm:flex-row">
          <div className="relative">
            <Avatar name={user.name} src={user.profileImage} size="xl" />
            <button type="button" onClick={() => fileRef.current.click()} disabled={uploading} aria-label="Change profile photo" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 disabled:opacity-60"><FiCamera /></button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatar} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="mt-1 text-xs text-slate-400">{uploading ? 'Uploading photo...' : 'JPG, PNG or WEBP, up to 2 MB'}</p>
          </div>
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-lg font-bold sm:col-span-2">Basic information</h2>
          <FormField label="Full name" name="name" value={form.name} onChange={onChange} error={errors.name} />
          <FormField label="Professional headline" name="headline" value={form.headline} onChange={onChange} placeholder="e.g. Full Stack Developer" maxLength={120} />
          <FormField label="Phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} placeholder="+91 98765 43210" />
          <FormField label="Location" name="location" value={form.location} onChange={onChange} placeholder="City, Country" />
          <FormField label="Years of experience" name="experience" type="number" min="0" max="60" step="0.5" value={form.experience} onChange={onChange} error={errors.experience} />
          <FormField className="sm:col-span-2" label="About you" name="bio" as="textarea" value={form.bio} onChange={onChange} maxLength={1000} placeholder="A short summary of your background and goals" />
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold">Skills</h2>
          <TagInput tags={skills} onChange={setSkills} placeholder="Add a skill and press Enter (e.g. React)" />
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Education</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEducation([...education, { degree: '', institution: '', year: '' }])}><FiPlus /> Add</button>
          </div>
          {education.length === 0 && <p className="text-sm text-slate-500">No education added yet.</p>}
          <div className="space-y-4">
            {education.map((ed, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
                <FormField label="Degree" name={`degree-${i}`} value={ed.degree || ''} onChange={(e) => editEdu(i, 'degree', e.target.value)} />
                <FormField label="Institution" name={`inst-${i}`} value={ed.institution || ''} onChange={(e) => editEdu(i, 'institution', e.target.value)} />
                <FormField label="Year" name={`year-${i}`} type="number" min="1950" max="2100" value={ed.year || ''} onChange={(e) => editEdu(i, 'year', e.target.value)} />
                <button type="button" onClick={() => setEducation(education.filter((_, idx) => idx !== i))} aria-label="Remove education" className="btn btn-ghost text-red-600"><FiTrash2 /></button>
              </div>
            ))}
          </div>
        </section>

        <div><button className="btn btn-primary px-8" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></div>
      </form>
    </>
  );
}
