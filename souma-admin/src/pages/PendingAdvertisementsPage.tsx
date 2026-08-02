import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, ImageOff, Tag, User, Stamp, X, PartyPopper, Loader2 } from 'lucide-react';
import { advertisementApi } from '@/api/advertisement.api';
import { RejectModal } from '@/components/RejectModal';
import type { PendingAdvertisement } from '@/types/advertisement.types';

function AdCard({
  ad,
  index,
  onApprove,
  onReject,
}: {
  ad: PendingAdvertisement;
  index: number;
  onApprove: (id: string) => void;
  onReject: (ad: PendingAdvertisement) => void;
}) {
  const [stamp, setStamp] = useState<'approved' | null>(null);

  const handleApprove = () => {
    setStamp('approved');
    onApprove(ad.id);
  };

  return (
    <div
      className={`animate-fade-in-up relative overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-500 ${
        stamp ? 'scale-95 opacity-0' : ''
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {stamp && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="animate-stamp flex h-20 w-20 items-center justify-center rounded-full border-4 border-ink-700 bg-ink-50 text-ink-700">
            <Stamp size={32} strokeWidth={2} />
          </div>
        </div>
      )}

      {ad.images[0] ? (
        <img src={ad.images[0].url} alt={ad.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-paper-dim text-charcoal/30">
          <ImageOff size={28} />
        </div>
      )}

      <div className="border-t-2 border-dashed border-line" />

      <div className="p-4">
        <h3 className="mb-1.5 font-display font-semibold text-charcoal">{ad.title}</h3>

        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-ink-700">
            {Number(ad.price).toLocaleString()}
          </span>
          <span className="rounded-md bg-brass-light px-2 py-0.5 text-xs font-medium text-brass">
            {ad.currency}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-charcoal/50">
          <span className="flex items-center gap-1">
            <Tag size={13} />
            {ad.category.nameAr}
          </span>
          <span className="flex items-center gap-1">
            <User size={13} />
            {ad.user.fullName}
          </span>
        </div>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-charcoal/70">
          {ad.description}
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={!!stamp}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-700 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800 disabled:opacity-50"
          >
            <Stamp size={15} />
            قبول ونشر
          </button>
          <button
            onClick={() => onReject(ad)}
            disabled={!!stamp}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-stamp/70 py-2.5 text-sm font-medium text-stamp transition hover:bg-stamp-light disabled:opacity-50"
          >
            <X size={15} />
            رفض
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const ads = data ?? [];

  return (
    <div dir="rtl" className="p-7">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
          <ClipboardList size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-charcoal/40">قيد المراجعة</p>
          <h2 className="font-display text-xl font-bold text-charcoal">
            {ads.length} إعلان بانتظار قرارك
          </h2>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-ink-700" />
        </div>
      )}

      {!isLoading && ads.length === 0 && (
        <div className="animate-fade-in-up flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-white/50 p-16 text-center">
          <PartyPopper size={40} className="mb-3 text-brass" />
          <h3 className="mb-1 font-display font-semibold text-charcoal">كل شيء تمت مراجعته</h3>
          <p className="text-sm text-charcoal/50">أي إعلان جديد بيوصلك إشعار فوري بتليجرام</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad, index) => (
          <AdCard
            key={ad.id}
            ad={ad}
            index={index}
            onApprove={(id) => approveMutation.mutate(id)}
            onReject={setRejectTarget}
          />
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