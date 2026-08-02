import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 text-center px-4">
        <h1 className="text-2xl font-bold text-red-700">لا تملك صلاحية الوصول</h1>
        <p className="text-gray-600">هذه اللوحة مخصصة لمدراء المنصة فقط</p>
      </div>
    );
  }

  return <Outlet />;
}