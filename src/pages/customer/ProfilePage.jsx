import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Icon, Input, Badge, PageHeader } from '../../components/ui';

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
  const isActive = c.status === 'active';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-up">
      <PageHeader eyebrow="Account" title="Profile" subtitle="Manage your contact details and service address." />

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Identity card */}
        <div className="space-y-6">
          <div className="card text-center">
            <span className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-3xl font-display font-extrabold shadow-brand-glow">
              {(c.name || 'U').charAt(0).toUpperCase()}
            </span>
            <h2 className="mt-4 text-lg font-display font-bold text-fg">{c.name || '—'}</h2>
            <p className="text-sm text-subtle font-mono">{c.customerId || '—'}</p>
            <div className="mt-3 flex justify-center">
              <Badge tone={isActive ? 'success' : 'danger'} dot>{(c.status || 'unknown').toUpperCase()}</Badge>
            </div>
            <div className="mt-5 pt-5 border-t border-line space-y-2.5 text-sm text-left">
              <Row icon="phone" label="Mobile" value={c.mobile} />
              {c.currentPlan?.name && <Row icon="package" label="Plan" value={c.currentPlan.name} />}
            </div>
          </div>

          <Link to="/me/change-password" className="card-interactive flex items-center gap-3 !py-4 group">
            <span className="w-10 h-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-subtle group-hover:text-brand-600 transition-colors">
              <Icon name="lock" className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-fg">Change password</p>
              <p className="text-xs text-subtle">Update your login credentials</p>
            </div>
            <Icon name="chevronRight" className="w-5 h-5 text-subtle group-hover:text-brand-600 transition-colors" />
          </Link>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="lg:col-span-2 card space-y-5">
          <div>
            <h3 className="font-display font-bold text-fg flex items-center gap-2">
              <Icon name="mail" className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Contact
            </h3>
            <Input label="Email address" type="email" placeholder="you@example.com" className="mt-3" {...register('email')} />
          </div>

          <fieldset className="border border-line rounded-2xl p-5">
            <legend className="text-sm font-display font-bold text-fg px-2 flex items-center gap-2">
              <Icon name="mapPin" className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Service address
            </legend>
            <div className="grid sm:grid-cols-2 gap-3 mt-1">
              <Input className="sm:col-span-2" placeholder="Address line 1" {...register('address.line1')} />
              <Input className="sm:col-span-2" placeholder="Address line 2" {...register('address.line2')} />
              <Input placeholder="Area / Locality" {...register('address.area')} />
              <Input placeholder="City" {...register('address.city')} />
              <Input placeholder="State" {...register('address.state')} />
              <Input placeholder="Pincode" inputMode="numeric" maxLength={6} {...register('address.pincode')} />
            </div>
          </fieldset>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={!isDirty || isSubmitting || mutation.isPending} className="btn-primary">
              {mutation.isPending ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving…</>
              ) : (
                <><Icon name="check" className="w-4 h-4" /> Save changes</>
              )}
            </button>
            {isDirty && <span className="text-xs text-subtle">You have unsaved changes</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} className="w-4 h-4 text-subtle shrink-0" />
      <span className="text-subtle">{label}</span>
      <span className="text-fg font-medium ml-auto truncate">{value || '—'}</span>
    </div>
  );
}
