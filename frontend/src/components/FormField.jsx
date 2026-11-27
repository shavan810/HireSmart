// Label + control + validation message. `as` can be "input" | "textarea" | "select".
export default function FormField({ label, name, error, as = 'input', hint, className = '', children, ...props }) {
  const Control = as;
  const cls = `input ${error ? 'input-error' : ''} ${as === 'textarea' ? 'min-h-[110px] resize-y' : ''}`;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}
      <Control id={name} name={name} className={cls} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props}>
        {children}
      </Control>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
