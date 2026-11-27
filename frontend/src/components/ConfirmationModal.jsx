import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

export default function ConfirmationModal({ open, title = 'Are you sure?', message, confirmLabel = 'Confirm', tone = 'danger', loading = false, onConfirm, onCancel, children }) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      size="max-w-md"
      footer={
        <>
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <FiAlertTriangle className="h-5 w-5" />
        </span>
        <div className="text-sm text-slate-600">
          <p>{message}</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}
