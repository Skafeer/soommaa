import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-t-4 border-dashed border-stamp/30 px-6 pt-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stamp-light text-stamp">
              <X size={18} />
            </div>
            <h3 className="font-display text-lg font-bold text-charcoal">سبب رفض الإعلان</h3>
          </div>
        </div>

        <div className="px-6 pb-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبباً واضحاً يصل للمستخدم..."
            className="mb-4 h-28 w-full resize-none rounded-xl border border-line bg-paper-dim p-3.5 text-right text-sm focus:border-stamp focus:bg-white focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-charcoal/70 transition hover:bg-paper-dim"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={reason.trim().length < 5 || isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stamp py-2.5 text-sm font-medium text-white transition hover:bg-stamp/90 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              تأكيد الرفض
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}