import { Link } from 'react-router-dom';
import { FiCpu, FiShield, FiUsers, FiZap } from 'react-icons/fi';

const VALUES = [
  { icon: FiUsers, title: 'People first', text: 'Every feature exists to make hiring more human and less of a black box.' },
  { icon: FiCpu, title: 'Honest AI', text: 'Our resume analysis tells you what to fix, not what you want to hear.' },
  { icon: FiZap, title: 'Real-time clarity', text: 'Candidates and recruiters see status changes the moment they happen.' },
  { icon: FiShield, title: 'Privacy by default', text: 'Your resume is visible only to recruiters you apply to.' },
];

export default function About() {
  return (
    <>
      <section className="bg-navy-800 py-16 sm:py-20">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">We help good people and good teams find each other.</h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-200">HireSmart is a job portal built around transparency. Candidates see where they stand, recruiters see who fits, and AI removes the guesswork in between.</p>
        </div>
      </section>
      <section className="page-container grid gap-6 py-16 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><v.icon className="h-6 w-6" /></span>
            <div><h2 className="text-lg font-bold">{v.title}</h2><p className="mt-1 text-slate-500">{v.text}</p></div>
          </div>
        ))}
      </section>
      <section className="page-container pb-20">
        <div className="card flex flex-col items-start justify-between gap-4 p-8 sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-extrabold">Ready to get started?</h2><p className="mt-1 text-slate-500">Create a free account as a job seeker or recruiter.</p></div>
          <Link to="/register" className="btn btn-primary">Create account</Link>
        </div>
      </section>
    </>
  );
}
