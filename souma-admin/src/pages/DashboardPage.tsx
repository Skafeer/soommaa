import { useAuthStore } from '@/stores/auth.store';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم سومة</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">مرحباً، {user?.fullName}</span>
          <button
            onClick={logout}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
      <p className="text-gray-500">قريباً: الإعلانات قيد المراجعة والبلاغات</p>
    </div>
  );
}