import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, PartyPopper, Loader2, Stamp, EyeOff } from 'lucide-react';
import { reportApi } from '@/api/report.api';
import type { PendingReport } from '@/types/report.types';

const REASON_STYLES: Record<string, string> = {
  'محتوى مخالف أو غير لائق': 'bg-stamp-light text-stamp',
  'إعلان وهمي أو احتيالي': 'bg-stamp-light text-stamp',
  'محاولة نصب أو احتيال': 'bg-stamp-light text-stamp',
  'سعر غير منطقي أو مضلل': 'bg-brass-light text-brass',
  'صور لا تعود للمنتج': 'bg-brass-light text-brass',
  'إعلان مكرر': 'bg-ink-100 text-ink-700',
};

function ReasonBadge({ reason }: { reason: string }) {
  const style = REASON_STYLES[reason] ?? 'bg-paper-dim text-charcoal/60';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style}`}>
      {reason}
    </span>
  );
}

function ReportCard({
  report,
  index,
  onResolve,
}: {
  report: PendingReport;
  index: number;
  onResolve: (id: string, status: 'ACTION_TAKEN' | 'DISMISSED') => void;
}) {
  const [stamp, setStamp] = useState<'ACTION_TAKEN' | 'DISMISSED' | null>(null);

  const handleResolve = (status: 'ACTION_TAKEN' | 'DISMISSED') => {
    setStamp(status);
    onResolve(report.id, status);
  };

  const targetLabel = report.targetType === 'ADVERTISEMENT' ? 'إعلان' : 'مستخدم';
  const targetName =
    report.targetType === 'ADVERTISEMENT'
      ? report.advertisement?.title
      : report.reportedUser?.fullName;

  return (
    <div
      className={`animate-fade-in-up relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-sm transition-all duration-500 ${
        stamp ? 'scale-95 opacity-0' : ''
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {stamp && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div
            className={`animate-stamp flex h-16 w-16 items-center justify-center rounded-full border-4 ${
              stamp === 'ACTION_TAKEN'
                ? 'border-stamp bg-stamp-light text-stamp'
                : 'border-line bg-paper-dim text-charcoal/40'
            }`}
          >
            {stamp === 'ACTION_TAKEN' ? <Stamp size={26} /> : <EyeOff size={26} />}
          </div>
        </div>
      )}

      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 inline-block rounded-md bg-paper-dim px-2 py-0.5 text-xs text-charcoal/50">
            بلاغ عن {targetLabel}
          </span>
          <h3 className="font-display font-semibold text-charcoal">{targetName ?? 'غير متوفر'}</h3>
        </div>
        <ReasonBadge reason={report.reason} />
      </div>

      {report.description && (
        <p className="mb-3 rounded-lg bg-paper-dim p-3 text-sm text-charcoal/70">
          {report.description}
        </p>
      )}

      <p className="mb-4 text-xs text-charcoal/40">
        المُبلِّغ: {report.reporter.fullName} ({report.reporter.phoneNumber})
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => handleResolve('ACTION_TAKEN')}
          disabled={!!stamp}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stamp py-2.5 text-sm font-medium text-white transition hover:bg-stamp/90 disabled:opacity-50"
        >
          <Stamp size={15} />
          اتخاذ إجراء
        </button>
        <button
          onClick={() => handleResolve('DISMISSED')}
          disabled={!!stamp}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-medium text-charcoal/70 transition hover:bg-paper-dim disabled:opacity-50"
        >
          <EyeOff size={15} />
          تجاهل
        </button>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-reports'],
    queryFn: () => reportApi.listPending().then((res) => res.data.data),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTION_TAKEN' | 'DISMISSED' }) =>
      reportApi.resolve(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending-reports'] }),
  });

  const reports = data ?? [];

  return (
    <div dir="rtl" className="p-7">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stamp-light text-stamp">
          <Flag size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-charcoal/40">تحتاج مراجعة</p>
          <h2 className="font-display text-xl font-bold text-charcoal">{reports.length} بلاغ</h2>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-ink-700" />
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <div className="animate-fade-in-up flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-white/50 p-16 text-center">
          <PartyPopper size={40} className="mb-3 text-brass" />
          <h3 className="mb-1 font-display font-semibold text-charcoal">لا توجد بلاغات بانتظار المراجعة</h3>
          <p className="text-sm text-charcoal/50">المنصة نظيفة حالياً</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <ReportCard
            key={report.id}
            report={report}
            index={index}
            onResolve={(id, status) => resolveMutation.mutate({ id, status })}
          />
        ))}
      </div>
    </div>
  );
}