import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { usePublicSettings } from '../../lib/usePublicSettings';
import BillingCyclePicker, { getCyclesForPlan, cycleTotal } from '../../components/BillingCyclePicker';
import { Icon, Badge, Skeleton, EmptyState, PageHeader } from '../../components/ui';

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
  const [billingCycle, setBillingCycle] = useState('');

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

  const planCycles = useMemo(() => getCyclesForPlan(selectedPlan), [selectedPlan]);
  const selectedCycle = useMemo(
    () => planCycles.find((c) => c.key === billingCycle) || planCycles[0],
    [planCycles, billingCycle],
  );

  const totalPaise = useMemo(() => {
    if (!selectedCycle) return 0;
    return Math.round(cycleTotal(selectedCycle) * 100);
  }, [selectedCycle]);

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
        billingCycle: selectedCycle?.key,
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
              billingCycle: selectedCycle?.key,
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
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72 mt-3" />
        <Skeleton className="h-24 w-full rounded-2xl mt-6" />
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!settings.enableSelfRecharge) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <PageHeader eyebrow="Recharge" title="Recharge" />
        <div className="card mt-6">
          <EmptyState
            icon="lock"
            title="Self-recharge unavailable"
            description={
              settings.supportPhone
                ? `Online recharge is currently disabled by the admin. Please contact support at ${settings.supportPhone}.`
                : 'Online recharge is currently disabled by the admin. Please contact support.'
            }
            action={
              settings.supportPhone ? (
                <a href={`tel:${settings.supportPhone}`} className="btn-primary text-sm">
                  <Icon name="phone" className="w-4 h-4" /> Call support
                </a>
              ) : null
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Recharge"
        title="Recharge your plan"
        subtitle="Pay securely via Razorpay. Your plan activates instantly on success."
      />

      {/* Account banner */}
      <div className="card mt-6 !py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold">
            {(me?.name || 'U').charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-subtle font-semibold">Account</div>
            <div className="font-semibold text-fg leading-tight">{me?.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <span className="font-mono">{me?.customerId}</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="phone" className="w-4 h-4 text-subtle" /> {me?.mobile}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Plan selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-display font-bold text-fg flex items-center gap-2">
              <Icon name="package" className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Select a plan
            </h2>
            {plans.length === 0 ? (
              <EmptyState className="!py-10" icon="package" title="No plans available" description="No paid plans are currently available. Please check back later." />
            ) : (
              <div className="space-y-2.5 mt-4">
                {plans.map((p) => {
                  const cycles = getCyclesForPlan(p);
                  const cheapest = cycles.reduce(
                    (lo, c) => (cycleTotal(c) < cycleTotal(lo) ? c : lo),
                    cycles[0],
                  );
                  const active = String(p._id) === String(selectedPlanId);
                  return (
                    <label
                      key={p._id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                        active
                          ? 'border-brand-500 bg-brand-500/[0.06] ring-1 ring-brand-500 shadow-sm'
                          : 'border-line hover:border-brand-300 hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${active ? 'border-brand-600 bg-brand-600' : 'border-line'}`}>
                          {active && <Icon name="check" className="w-3 h-3 text-white" strokeWidth={3} />}
                        </span>
                        <input
                          type="radio"
                          name="plan"
                          className="sr-only"
                          checked={active}
                          onChange={() => setSelectedPlanId(String(p._id))}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-fg truncate">{p.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {p.speedMbps ? <Badge tone="brand"><Icon name="bolt" className="w-3 h-3" /> {p.speedMbps} Mbps</Badge> : null}
                            {cycles.length > 1 ? <Badge tone="neutral">{cycles.length} billing options</Badge> : null}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {cycles.length > 1 && <div className="text-[11px] text-subtle">starts from</div>}
                        <div className="text-lg font-bold text-fg">
                          ₹{cycleTotal(cheapest).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {selectedPlan ? (
              <div className="mt-6">
                <div className="label">Billing cycle</div>
                <BillingCyclePicker
                  plan={selectedPlan}
                  value={billingCycle || selectedCycle?.key || ''}
                  onChange={setBillingCycle}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Order summary (sticky) */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card">
            <h3 className="font-display font-bold text-fg">Order summary</h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Plan</dt>
                <dd className="font-semibold text-fg text-right">{selectedPlan?.name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Billing</dt>
                <dd className="font-semibold text-fg text-right">{selectedCycle?.label || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Duration</dt>
                <dd className="font-semibold text-fg text-right">{selectedCycle?.durationDays || '—'} days</dd>
              </div>
            </dl>
            <div className="flex items-end justify-between gap-3 mt-4 pt-4 border-t border-line">
              <span className="text-xs uppercase tracking-wide text-subtle font-semibold">Total payable</span>
              <span className="text-2xl font-display font-extrabold text-fg">{inr(totalPaise)}</span>
            </div>
            <button
              type="button"
              onClick={handlePay}
              disabled={!selectedPlan || submitting}
              className="btn-primary w-full mt-5 py-3"
            >
              {submitting ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</>
              ) : (
                <><Icon name="lock" className="w-4 h-4" /> Pay {inr(totalPaise)}</>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-subtle">
              <Icon name="shieldCheck" className="w-4 h-4 text-emerald-500" />
              Secured by Razorpay · UPI, Cards, NetBanking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
