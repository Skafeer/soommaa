import { useState } from 'react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}

export function RejectModal({ isOpen, onClose, onConfirm, isSubmitting }: RejectModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 5) return;
    onConfirm(reason.trim());
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900">سبب رفض الإعلان</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="اكتب سبباً واضحاً يصل للمستخدم..."
          className="mb-4 h-28 w-full resize-none rounded-lg border border-gray-300 p-3 text-right focus:border-teal-600 focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={reason.trim().length < 5 || isSubmitting}
            className="flex-1 rounded-lg bg-red-700 py-2 text-white hover:bg-red-800 disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الرفض...' : 'تأكيد الرفض'}
          </button>
        </div>
      </div>
    </div>
  );
}