import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Icon } from '../../components/ui';

function strengthOf(pwd = '') {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: 'Too short', color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  { label: 'Weak', color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { label: 'Good', color: 'bg-brand-500', text: 'text-brand-600 dark:text-brand-400' },
  { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
];

function PasswordField({ label, error, show, onToggle, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} className={`input-field pr-11 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`} {...props} />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-fg transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <Icon name={show ? 'eyeOff' : 'eye'} className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const pwd = watch('newPassword') || '';
  const [show, setShow] = useState({ old: false, next: false, confirm: false });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/internet/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password updated');
      reset();
      navigate('/me');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not change password'),
  });

  const score = strengthOf(pwd);
  const meter = STRENGTH[score];

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14 animate-fade-up">
      <Link to="/me/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
        <Icon name="arrowLeft" className="w-4 h-4" /> Back to profile
      </Link>

      <div className="flex items-center gap-3 mt-5">
        <span className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <Icon name="lock" className="w-6 h-6" />
        </span>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-fg">Change password</h1>
          <p className="text-sm text-muted">Choose a strong, unique password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card mt-6 space-y-4">
        <PasswordField
          label="Current password"
          show={show.old}
          onToggle={() => setShow((s) => ({ ...s, old: !s.old }))}
          error={errors.oldPassword?.message}
          {...register('oldPassword', { required: 'Required' })}
        />

        <div>
          <PasswordField
            label="New password"
            show={show.next}
            onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
            error={errors.newPassword?.message}
            {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
          />
          {pwd && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-colors ${i < score ? meter.color : 'bg-surface-2'}`} />
                ))}
              </div>
              <span className={`text-xs font-medium ${meter.text}`}>{meter.label}</span>
            </div>
          )}
        </div>

        <PasswordField
          label="Confirm new password"
          show={show.confirm}
          onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { validate: (v) => v === pwd || 'Does not match' })}
        />

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
          {mutation.isPending ? (
            <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Updating…</>
          ) : (
            <><Icon name="shieldCheck" className="w-4 h-4" /> Update password</>
          )}
        </button>
      </form>
    </div>
  );
}
