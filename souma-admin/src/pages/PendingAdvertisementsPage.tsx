import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advertisementApi } from '@/api/advertisement.api';
import { RejectModal } from '@/components/RejectModal';
import type { PendingAdvertisement } from '@/types/advertisement.types';

export function PendingAdvertisementsPage() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<PendingAdvertisement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-ads'],
    queryFn: () => advertisementApi.listPending().then((res) => res.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => advertisementApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending-ads'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => advertisementApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-ads'] });
      setRejectTarget(null);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
  }

  const ads = data ?? [];

  return (
    <div dir="rtl" className="p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        الإعلانات قيد المراجعة ({ads.length})
      </h2>

      {ads.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center text-gray-400 shadow-sm">
          لا توجد إعلانات بانتظار المراجعة حالياً 🎉
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <div key={ad.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            {ad.images[0] ? (
              <img src={ad.images[0].url} alt={ad.title} className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                بدون صورة
              </div>
            )}

            <div className="p-4">
              <h3 className="mb-1 font-semibold text-gray-900">{ad.title}</h3>
              <p className="mb-2 text-lg font-bold text-teal-700">
                {Number(ad.price).toLocaleString()} {ad.currency}
              </p>
              <p className="mb-1 text-sm text-gray-500">{ad.category.nameAr}</p>
              <p className="mb-3 text-xs text-gray-400">
                البائع: {ad.user.fullName} ({ad.user.phoneNumber})
              </p>
              <p className="mb-4 line-clamp-3 text-sm text-gray-600">{ad.description}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate(ad.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 rounded-lg bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  قبول ونشر
                </button>
                <button
                  onClick={() => setRejectTarget(ad)}
                  className="flex-1 rounded-lg border border-red-600 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  رفض
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RejectModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        isSubmitting={rejectMutation.isPending}
        onConfirm={(reason) => {
          if (rejectTarget) {
            rejectMutation.mutate({ id: rejectTarget.id, reason });
          }
        }}
      />
    </div>
  );
}