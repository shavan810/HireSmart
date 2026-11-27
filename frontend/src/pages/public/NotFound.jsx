import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-7xl font-extrabold text-navy-800">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page does not exist</h1>
      <p className="mt-2 text-slate-500">The link may be broken or the page may have been moved.</p>
      <Link to="/" className="btn btn-primary mt-6">Back to home</Link>
    </div>
  );
}
