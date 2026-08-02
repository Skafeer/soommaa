import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, Flag, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { SealLogo } from '@/components/SealLogo';

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-ink-700 text-white shadow-sm'
        : 'text-charcoal/70 hover:bg-ink-50 hover:text-ink-800'
    }`;

  return (
    <div dir="rtl" className="flex min-h-screen bg-paper font-body">
      <aside className="flex w-64 flex-col border-l border-line bg-white/60 p-5">
        <div className="mb-8 flex items-center gap-3 px-1">
          <SealLogo size="sm" />
          <div>
            <h1 className="font-display text-lg font-bold text-ink-800">سومة</h1>
            <p className="text-[11px] text-charcoal/50">لوحة تحكم المدراء</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          <NavLink to="/" end className={navItemClass}>
            <ClipboardList size={18} strokeWidth={2} />
            الإعلانات قيد المراجعة
          </NavLink>
          <NavLink to="/reports" className={navItemClass}>
            <Flag size={18} strokeWidth={2} />
            البلاغات
          </NavLink>
        </nav>

        <div className="border-t border-dashed border-line pt-4">
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 font-display text-sm font-semibold text-ink-800">
              {user?.fullName?.charAt(0) ?? '?'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-charcoal">{user?.fullName}</p>
              <p className="text-[11px] text-charcoal/50">{user?.role === 'SUPER_ADMIN' ? 'مدير عام' : 'مدير'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stamp-light py-2.5 text-sm font-medium text-stamp transition hover:bg-stamp hover:text-white"
          >
            <LogOut size={16} />
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