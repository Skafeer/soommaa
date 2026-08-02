import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.requestOtp(phoneNumber.trim());
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phoneNumber.trim(), code.trim());

      if (data.data.user.role !== 'ADMIN' && data.data.user.role !== 'SUPER_ADMIN') {
        setError('هذا الحساب لا يملك صلاحية الوصول للوحة التحكم');
        setLoading(false);
        return;
      }

      setSession(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-1 text-center text-3xl font-bold text-teal-700">سومة</h1>
        <p className="mb-8 text-center text-sm text-gray-500">لوحة تحكم المدراء</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-700">رقم الهاتف</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right focus:border-teal-600 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-700 py-2.5 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-700">كود التحقق</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right focus:border-teal-600 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-700 py-2.5 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-sm text-teal-700 hover:underline"
            >
              تغيير رقم الهاتف
            </button>
          </form>
        )}
      </div>
    </div>
  );
}