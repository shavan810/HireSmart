export default function LoadingSpinner({ label = 'Loading', fullScreen = false, size = 'h-8 w-8' }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3" role="status">
      <span className={`${size} animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600`} />
      <span className="sr-only">{label}</span>
    </div>
  );
  if (fullScreen) return <div className="flex min-h-screen items-center justify-center bg-slate-50">{spinner}</div>;
  return <div className="flex justify-center py-12">{spinner}</div>;
}
