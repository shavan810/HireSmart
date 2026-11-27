import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { FiAlertCircle, FiBell, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

export const ToastContext = createContext(null);

const STYLES = {
  success: { icon: FiCheckCircle, color: 'text-emerald-600' },
  error: { icon: FiAlertCircle, color: 'text-red-600' },
  info: { icon: FiInfo, color: 'text-blue-600' },
  notification: { icon: FiBell, color: 'text-blue-600' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
      notification: (m) => push('notification', m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => {
          const { icon: Icon, color } = STYLES[t.type];
          return (
            <div key={t.id} role="status" className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-pop">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
              <p className="flex-1 text-sm font-medium text-slate-700">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600">
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
