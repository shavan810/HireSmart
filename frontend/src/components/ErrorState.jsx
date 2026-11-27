import { FiAlertTriangle } from 'react-icons/fi';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <FiAlertTriangle className="mb-3 h-7 w-7 text-red-500" />
      <p className="text-sm font-semibold text-red-700">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline btn-sm mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
