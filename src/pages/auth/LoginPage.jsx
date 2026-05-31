import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/favicon.svg" alt="" className="w-12 h-12 mx-auto" />
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Customer Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your registered mobile number.</p>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={10}
              className="input-field"
              placeholder="10-digit mobile"
              {...register('mobile', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })}
            />
            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-field pr-12"
                {...register('password', { required: 'Required' })}
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 px-2 py-1">
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-xs text-center text-gray-500">
            Forgot your password? Please <Link to="/contact" className="text-brand-700 underline">contact support</Link> for a reset.
          </p>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Not a customer yet? <Link to="/enquire" className="text-brand-700 font-medium">Request a new connection →</Link>
        </p>
      </div>
    </div>
  );
}
