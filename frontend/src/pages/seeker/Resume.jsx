import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiExternalLink, FiFileText, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate, getErrorMessage } from '../../utils/format';

const MAX = 5 * 1024 * 1024;

export default function Resume() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) return toast.error('Only PDF files are accepted');
    if (file.size > MAX) return toast.error('Your PDF is larger than 5 MB. Compress it and try again.');
    setBusy(true);
    try {
      const res = await userService.uploadResume(file);
      setUser(res.user);
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await userService.deleteResume();
      setUser(res.user);
      toast.success('Resume removed');
      setConfirm(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="My resume" subtitle="This PDF is sent to recruiters whenever you apply." />
      <div className="grid max-w-4xl gap-6">
        {user.resumeUrl && (
          <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><FiFileText className="h-7 w-7" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-navy-800">{user.resumeName || 'resume.pdf'}</p>
              <p className="text-sm text-slate-500">Uploaded {formatDate(user.resumeUpdatedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={user.resumeUrl} target="_blank" rel="noreferrer noopener" className="btn btn-outline btn-sm"><FiExternalLink /> View</a>
              <Link to="/seeker/analyzer" className="btn btn-primary btn-sm"><FiCpu /> Analyze with AI</Link>
              <button className="btn btn-outline btn-sm text-red-600 hover:bg-red-50" onClick={() => setConfirm(true)}><FiTrash2 /> Remove</button>
            </div>
          </section>
        )}

        <section
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
          className={`card flex flex-col items-center border-2 border-dashed px-6 py-14 text-center transition-colors ${drag ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}
        >
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FiUploadCloud className="h-7 w-7" /></span>
          <h2 className="text-lg font-bold">{user.resumeUrl ? 'Replace your resume' : 'Upload your resume'}</h2>
          <p className="mt-1 text-sm text-slate-500">Drag and drop a PDF here, or choose a file. Maximum 5 MB.</p>
          <button className="btn btn-primary mt-5" disabled={busy} onClick={() => input.current.click()}>{busy ? 'Uploading...' : 'Choose PDF'}</button>
          <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        </section>

        <p className="text-sm text-slate-500">Tip: a one or two page resume with clear headings and measurable achievements performs best. Run the AI analyzer after uploading to see what to improve.</p>
      </div>

      <ConfirmationModal open={confirm} title="Remove resume?" confirmLabel="Remove" loading={busy} onCancel={() => setConfirm(false)} onConfirm={remove} message="You will not be able to apply for jobs until you upload a new resume. Existing applications are not affected." />
    </>
  );
}
