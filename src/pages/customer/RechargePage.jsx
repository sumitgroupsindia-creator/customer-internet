import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { usePublicSettings } from '../../lib/usePublicSettings';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function formatError(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Something went wrong';
  if (Array.isArray(data.message)) return data.message.join(' • ');
  return data.message || data.error || 'Request failed';
}

function inr(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function RechargePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const settings = usePublicSettings();
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const meQ = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/internet/me')).data,
  });

  const plansQ = useQuery({
    queryKey: ['self-recharge-plans'],
    queryFn: async () => (await api.get('/internet/me/recharge/plans')).data,
  });

  const me = meQ.data;
  const plans = plansQ.data || [];

  // Pre-select customer's current plan once data arrives
  useEffect(() => {
    if (!selectedPlanId && me) {
      const current =
        (typeof me.currentPlanId === 'object' && me.currentPlanId?._id) ||
        me.currentPlanId ||
        '';
      if (current) setSelectedPlanId(String(current));
      else if (plans.length) setSelectedPlanId(String(plans[0]._id));
    }
  }, [me, plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((p) => String(p._id) === String(selectedPlanId)),
    [plans, selectedPlanId],
  );

  const totalPaise = useMemo(() => {
    if (!selectedPlan) return 0;
    const base = Number(selectedPlan.price ?? selectedPlan.monthlyPrice ?? 0);
    const gst = Number(selectedPlan.gstPercent ?? 0);
    return Math.round(base * (1 + gst / 100) * 100);
  }, [selectedPlan]);

  const verifyMut = useMutation({
    mutationFn: async (payload) =>
      (await api.post('/internet/me/recharge/verify', payload)).data,
  });

  async function handlePay() {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }
    if (!settings.enableSelfRecharge) {
      toast.error('Self-recharge is disabled. Please contact support.');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Failed to load Razorpay. Check your internet connection.');

      // 1) Create order on backend
      const { data: order } = await api.post('/internet/me/recharge/order', {
        planId: selectedPlanId,
      });

      // 2) Open Razorpay checkout
      const opts = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: settings.brandName || 'Sumit Net',
        description: `${order.planName} • ${order.durationDays} days`,
        order_id: order.orderId,
        prefill: {
          name: me?.name || '',
          contact: me?.mobile || '',
          email: me?.email || '',
        },
        theme: { color: '#0d9488' },
        handler: async (response) => {
          try {
            const result = await verifyMut.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planId: selectedPlanId,
            });
            toast.success('Payment successful! Recharge activated.');
            qc.invalidateQueries({ queryKey: ['me'] });
            qc.invalidateQueries({ queryKey: ['my-recharges'] });
            if (result?.id) {
              navigate(`/me/receipt/${result.id}`);
            } else {
              navigate('/me/history');
            }
          } catch (e) {
            toast.error(formatError(e));
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      };

      const rzp = new window.Razorpay(opts);
      rzp.on('payment.failed', (resp) => {
        toast.error(resp?.error?.description || 'Payment failed');
        setSubmitting(false);
      });
      rzp.open();
    } catch (e) {
      toast.error(formatError(e));
      setSubmitting(false);
    }
  }

  if (meQ.isLoading || plansQ.isLoading) {
    return <div className="p-6 text-gray-600">Loading…</div>;
  }

  if (!settings.enableSelfRecharge) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <h2 className="text-lg font-semibold">Self-recharge unavailable</h2>
          <p className="mt-1 text-sm">
            Online recharge is currently disabled by the admin. Please contact support
            {settings.supportPhone ? (
              <>
                {' '}
                at <a className="underline" href={`tel:${settings.supportPhone}`}>{settings.supportPhone}</a>
              </>
            ) : null}
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Recharge</h1>
        <p className="text-sm text-gray-600">
          Pay securely via Razorpay. Your plan activates instantly on successful payment.
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Account</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-4">
            <div className="text-lg font-semibold text-gray-900">{me?.name}</div>
            <div className="text-sm text-gray-600">{me?.customerId}</div>
            <div className="text-sm text-gray-600">{me?.mobile}</div>
          </div>
        </div>

        <div className="p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Select Plan</label>
          {plans.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
              No paid plans are currently available.
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map((p) => {
                const base = Number(p.price ?? p.monthlyPrice ?? 0);
                const gst = Number(p.gstPercent ?? 0);
                const total = +(base * (1 + gst / 100)).toFixed(2);
                const active = String(p._id) === String(selectedPlanId);
                return (
                  <label
                    key={p._id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                      active
                        ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        className="h-4 w-4 accent-teal-600"
                        checked={active}
                        onChange={() => setSelectedPlanId(String(p._id))}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-600">
                          {p.speedMbps ? `${p.speedMbps} Mbps` : ''}
                          {p.durationDays ? ` • ${p.durationDays} days` : ''}
                          {gst ? ` • incl. ${gst}% GST` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-200 p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Total Payable</div>
            <div className="text-2xl font-bold text-gray-900">{inr(totalPaise)}</div>
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={!selectedPlan || submitting}
            className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? 'Processing…' : 'Pay Now'}
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        Powered by Razorpay • UPI, Cards, NetBanking, Wallets
      </p>
    </div>
  );
}
