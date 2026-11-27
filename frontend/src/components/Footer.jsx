import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const col = 'space-y-2 text-sm text-navy-200';
  const a = 'hover:text-white';
  return (
    <footer className="bg-navy-800 text-navy-200">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm">Find the right job, hire the right people and sharpen your resume with AI, all in one place.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-white">Job seekers</h3>
          <ul className={col}>
            <li><Link className={a} to="/jobs">Browse jobs</Link></li>
            <li><Link className={a} to="/register">Create a profile</Link></li>
            <li><Link className={a} to="/login">Analyze your resume</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-white">Recruiters</h3>
          <ul className={col}>
            <li><Link className={a} to="/register?role=recruiter">Post a job</Link></li>
            <li><Link className={a} to="/login">Manage applicants</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-white">Company</h3>
          <ul className={col}>
            <li><Link className={a} to="/about">About us</Link></li>
            <li><Link className={a} to="/contact">Contact</Link></li>
            <li><Link className={a} to="/admin/login">Admin login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-300">© {new Date().getFullYear()} HireSmart. All rights reserved.</div>
    </footer>
  );
}
