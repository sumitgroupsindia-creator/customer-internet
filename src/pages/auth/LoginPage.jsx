import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Icon } from '../../components/ui';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPwd, setShowPwd] = useState(false);

  const from = location.state?.from?.pathname || '/me';

  const mutation = useMutation({
    mutationFn: (data) => api.post('/internet/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      // backend returns { token, customer }
      login(data.token || data.accessToken, data.customer);
      toast.success(`Welcome back, ${data.customer?.name || ''}`.trim());
      const target = data.customer?.mustChangePassword ? '/me/change-password' : from;
      navigate(target, { replace: true });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Icon name="wifi" className="w-6 h-6" />
          </span>
          <span className="text-lg font-display font-extrabold">Sumit Net</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-display font-extrabold leading-tight">Manage your connection in one place.</h2>
          <p className="text-brand-100 mt-4 text-lg">Recharge, track expiry, download receipts and reach support — all from your customer dashboard.</p>
          <ul className="mt-8 space-y-3">
            {['Instant online recharge', 'Live plan & expiry tracking', 'Downloadable GST receipts'].map((f) => (
              <li key={f} className="flex items-center gap-3 text-brand-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon name="check" className="w-4 h-4" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} Sumit Net · A Sumit Groups company</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-8">
            <span className="lg:hidden inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center mb-4">
              <Icon name="wifi" className="w-6 h-6 text-white" />
            </span>
            <h1 className="text-2xl font-display font-extrabold text-fg">Customer Login</h1>
            <p className="text-sm text-muted mt-1.5">Sign in with your registered mobile number.</p>
          </div>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-5">
            <div>
              <label className="label">Mobile number</label>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={10}
                className={`input-field ${errors.mobile ? 'border-red-400 focus:ring-red-500/15' : ''}`}
                placeholder="10-digit mobile"
                {...register('mobile', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })}
              />
              {errors.mobile && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`input-field pr-12 ${errors.password ? 'border-red-400 focus:ring-red-500/15' : ''}`}
                  {...register('password', { required: 'Required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted hover:text-fg px-2 py-1 rounded-lg"
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
              {mutation.isPending && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
              {mutation.isPending ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-xs text-center text-muted">
              Forgot your password? Please{' '}
              <Link to="/contact" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">contact support</Link> for a reset.
            </p>
          </form>

          <p className="text-center text-xs text-subtle mt-6">
            Not a customer yet?{' '}
            <Link to="/enquire" className="text-brand-600 dark:text-brand-400 font-medium">Request a new connection →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
