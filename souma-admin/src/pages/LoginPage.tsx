import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { SealLogo } from '@/components/SealLogo';

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
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-paper font-body">
      <div className="animate-fade-in-up w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <SealLogo size="lg" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-800">سومة</h1>
          <p className="text-sm text-charcoal/50">لوحة تحكم المدراء</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-stamp/20 bg-stamp-light px-4 py-2.5 text-sm text-stamp">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal/70">رقم الهاتف</label>
              <div className="relative">
                <Phone
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/30"
                />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XXXXXXXXX"
                  className="w-full rounded-xl border border-line bg-paper-dim py-3 pl-4 pr-11 text-right font-mono text-sm focus:border-ink-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-700 py-3 font-medium text-white transition hover:bg-ink-800 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowLeft size={18} />}
              إرسال كود التحقق
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal/70">كود التحقق</label>
              <div className="relative">
                <KeyRound
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/30"
                />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full rounded-xl border border-line bg-paper-dim py-3 pl-4 pr-11 text-right font-mono text-sm tracking-widest focus:border-ink-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-700 py-3 font-medium text-white transition hover:bg-ink-800 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowLeft size={18} />}
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-sm text-ink-700 hover:underline"
            >
              تغيير رقم الهاتف
            </button>
          </form>
        )}
      </div>
    </div>
  );
}