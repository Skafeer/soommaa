import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/api/report.api';
import type { PendingReport } from '@/types/report.types';

const REASON_STYLES: Record<string, string> = {
  'محتوى مخالف أو غير لائق': 'bg-red-50 text-red-700',
  'إعلان وهمي أو احتيالي': 'bg-orange-50 text-orange-700',
  'سعر غير منطقي أو مضلل': 'bg-amber-50 text-amber-700',
  'صور لا تعود للمنتج': 'bg-purple-50 text-purple-700',
  'إعلان مكرر': 'bg-blue-50 text-blue-700',
  'محاولة نصب أو احتيال': 'bg-rose-50 text-rose-700',
};

function ReasonBadge({ reason }: { reason: string }) {
  const style = REASON_STYLES[reason] ?? 'bg-gray-100 text-gray-700';
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
  isResolving,
}: {
  report: PendingReport;
  index: number;
  onResolve: (id: string, status: 'ACTION_TAKEN' | 'DISMISSED') => void;
  isResolving: boolean;
}) {
  const targetLabel = report.targetType === 'ADVERTISEMENT' ? 'إعلان' : 'مستخدم';
  const targetName =
    report.targetType === 'ADVERTISEMENT'
      ? report.advertisement?.title
      : report.reportedUser?.fullName;

  return (
    <div
      className="animate-fade-in-up rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            بلاغ عن {targetLabel}
          </span>
          <h3 className="font-semibold text-gray-900">{targetName ?? 'غير متوفر'}</h3>
        </div>
        <ReasonBadge reason={report.reason} />
      </div>

      {report.description && (
        <p className="mb-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          {report.description}
        </p>
      )}

      <p className="mb-4 text-xs text-gray-400">
        المُبلِّغ: {report.reporter.fullName} ({report.reporter.phoneNumber})
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onResolve(report.id, 'ACTION_TAKEN')}
          disabled={isResolving}
          className="flex-1 rounded-lg bg-red-700 py-2 text-sm font-medium text-white transition hover:bg-red-800 active:scale-95 disabled:opacity-50"
        >
          اتخاذ إجراء
        </button>
        <button
          onClick={() => onResolve(report.id, 'DISMISSED')}
          disabled={isResolving}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
        >
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
    <div dir="rtl" className="p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">البلاغات ({reports.length})</h2>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-700" />
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <div className="animate-fade-in-up rounded-xl bg-white p-10 text-center text-gray-400 shadow-sm">
          لا توجد بلاغات بانتظار المراجعة 🎉
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <ReportCard
            key={report.id}
            report={report}
            index={index}
            isResolving={resolveMutation.isPending}
            onResolve={(id, status) => resolveMutation.mutate({ id, status })}
          />
        ))}
      </div>
    </div>
  );
}