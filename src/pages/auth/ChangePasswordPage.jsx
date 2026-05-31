import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const pwd = watch('newPassword');

  const mutation = useMutation({
    mutationFn: (data) => api.post('/internet/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password updated');
      reset();
      navigate('/me');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not change password'),
  });

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900">Change password</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
          <input type="password" className="input-field" {...register('oldPassword', { required: 'Required' })} />
          {errors.oldPassword && <p className="text-xs text-red-600 mt-1">{errors.oldPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input type="password" className="input-field" {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
          {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <input type="password" className="input-field"
            {...register('confirmPassword', { validate: (v) => v === pwd || 'Does not match' })} />
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
