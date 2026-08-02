import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-teal-700 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div dir="rtl" className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-l border-gray-200 bg-white p-4">
        <h1 className="mb-1 px-2 text-xl font-bold text-teal-700">سومة</h1>
        <p className="mb-6 px-2 text-xs text-gray-400">لوحة تحكم المدراء</p>

        <nav className="space-y-1">
          <NavLink to="/" end className={navItemClass}>
            الإعلانات قيد المراجعة
          </NavLink>
          <NavLink to="/reports" className={navItemClass}>
            البلاغات
          </NavLink>
        </nav>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="mb-2 px-2 text-xs text-gray-500">{user?.fullName}</p>
          <button
            onClick={logout}
            className="w-full rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

     <main className="flex-1 animate-fade-in-up">
        <Outlet />
      </main>
    </div>
  );
}