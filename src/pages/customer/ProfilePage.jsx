import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function ProfilePage() {
  const { customer, updateCustomer } = useCustomerAuth();
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/internet/me').then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm({
    defaultValues: { email: '', address: { line1: '', line2: '', area: '', city: '', state: '', pincode: '' } },
  });

  useEffect(() => {
    if (me) {
      reset({ email: me.email || '', address: me.address || {} });
    }
  }, [me, reset]);

  const mutation = useMutation({
    mutationFn: (data) => api.patch('/internet/me', data).then((r) => r.data),
    onSuccess: (data) => {
      toast.success('Profile updated');
      updateCustomer(data);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not update'),
  });

  const c = me || customer || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">Profile</h1>

      <div className="card mt-6 space-y-2 text-sm">
        <Row k="Name" v={c.name} />
        <Row k="Customer ID" v={<span className="font-mono">{c.customerId}</span>} />
        <Row k="Mobile" v={c.mobile} />
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="input-field" {...register('email')} />
        </div>

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-700 px-2">Address</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input-field sm:col-span-2" placeholder="Address line 1" {...register('address.line1')} />
            <input className="input-field sm:col-span-2" placeholder="Address line 2" {...register('address.line2')} />
            <input className="input-field" placeholder="Area / Locality" {...register('address.area')} />
            <input className="input-field" placeholder="City" {...register('address.city')} />
            <input className="input-field" placeholder="State" {...register('address.state')} />
            <input className="input-field" placeholder="Pincode" inputMode="numeric" maxLength={6} {...register('address.pincode')} />
          </div>
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={!isDirty || isSubmitting || mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link to="/me/change-password" className="btn-secondary">Change password</Link>
        </div>
      </form>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-900 font-medium">{v || '—'}</span>
    </div>
  );
}
