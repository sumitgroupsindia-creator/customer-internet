import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function EnquiryPage() {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const { data: plans } = useQuery({
    queryKey: ['plans-enquire'],
    queryFn: () => api.get('/internet/plans').then((r) => r.data),
  });

  const submit = useMutation({
    mutationFn: (data) => api.post('/internet/leads', data),
    onSuccess: () => {
      toast.success('Thanks! Our team will call you shortly.');
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not submit. Please try again.'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Request a Connection</h1>
      <p className="text-gray-500 mt-2">Fill in your details — we'll verify coverage and call you back within a day.</p>

      <form onSubmit={handleSubmit((d) => submit.mutate(d))} className="card mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
          <input className="input-field" {...register('name', { required: true })} />
          {errors.name && <p className="text-xs text-red-600 mt-1">Required</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
            <input className="input-field" inputMode="numeric" maxLength={10}
              {...register('mobile', { required: true, pattern: /^[6-9]\d{9}$/ })} />
            {errors.mobile && <p className="text-xs text-red-600 mt-1">Enter a valid 10-digit mobile</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate mobile</label>
            <input className="input-field" inputMode="numeric" maxLength={10} {...register('alternateMobile')} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address / Locality *</label>
          <textarea rows={3} className="input-field" {...register('address', { required: true })} />
          {errors.address && <p className="text-xs text-red-600 mt-1">Required</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred plan</label>
            <select className="input-field" {...register('planId')}>
              <option value="">No preference</option>
              {plans?.map((p) => (
                <option key={p._id} value={p._id}>{p.name} — ₹{p.price || p.monthlyPrice}/{p.durationDays || 30}d</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Best time to call</label>
            <select className="input-field" {...register('preferredCallTime')}>
              <option value="any">Any time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea rows={2} className="input-field" {...register('notes')} />
        </div>
        <button type="submit" disabled={isSubmitting || submit.isPending} className="btn-primary w-full">
          {submit.isPending ? 'Submitting…' : 'Submit enquiry'}
        </button>
      </form>
    </div>
  );
}
