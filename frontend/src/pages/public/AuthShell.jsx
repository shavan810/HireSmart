import Logo from '../../components/Logo';

// Two-column layout shared by login and register.
export default function AuthShell({ title, subtitle, children, aside }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-800 p-12 lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight text-white">{aside.title}</h2>
          <ul className="mt-6 space-y-3 text-navy-200">
            {aside.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />{p}</li>)}
          </ul>
        </div>
        <p className="text-sm text-navy-300">© {new Date().getFullYear()} HireSmart</p>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-1.5 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
