/**
 * Customer-portal billing cycle helpers + picker.
 * Mirrors the admin BillingCyclePicker but styled for the public/customer portal.
 */

import { useEffect, useMemo } from 'react';

const CYCLE_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };
const CYCLE_DURATIONS = { monthly: 30, quarterly: 90, yearly: 365 };

export function getCyclesForPlan(plan) {
  if (!plan) return [];
  const raw = Array.isArray(plan.billingCycles) ? plan.billingCycles.filter((c) => c?.isActive !== false) : [];
  if (raw.length) return raw.map((c) => normalize(plan, c));
  return [
    normalize(plan, {
      key: 'monthly',
      price: plan.price ?? plan.monthlyPrice ?? 0,
      durationDays: plan.durationDays || 30,
      gstPercent: plan.gstPercent ?? 0,
    }),
  ];
}

function normalize(plan, c) {
  return {
    key: c.key,
    label: c.label || CYCLE_LABELS[c.key] || c.key,
    price: Number(c.price ?? plan?.price ?? plan?.monthlyPrice ?? 0),
    durationDays: c.durationDays || CYCLE_DURATIONS[c.key] || 30,
    gstPercent: Number(c.gstPercent ?? plan?.gstPercent ?? 0),
    discountPrice: c.discountPrice,
  };
}

export function cycleTotal(c) {
  if (!c) return 0;
  if (c.discountPrice != null) return Number(c.discountPrice);
  const base = Number(c.price || 0);
  const gst = Number(c.gstPercent || 0);
  return +(base * (1 + gst / 100)).toFixed(2);
}

export default function BillingCyclePicker({ plan, value, onChange }) {
  const cycles = useMemo(() => getCyclesForPlan(plan), [plan]);

  useEffect(() => {
    if (!plan) return;
    if (!value || !cycles.find((c) => c.key === value)) {
      onChange?.(cycles[0]?.key || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?._id]);

  if (!plan || cycles.length === 0) return null;
  if (cycles.length === 1) {
    const c = cycles[0];
    return (
      <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        Billing: <span className="font-semibold text-gray-900">{c.label}</span> · {c.durationDays} days · ₹{cycleTotal(c).toLocaleString('en-IN')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {cycles.map((c) => {
        const active = c.key === value;
        const total = cycleTotal(c);
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange?.(c.key)}
            className={`rounded-lg border p-3 text-left transition ${
              active ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-semibold text-gray-900">{c.label}</div>
            <div className="text-[11px] text-gray-500">{c.durationDays} days{c.gstPercent ? ` · incl. ${c.gstPercent}% GST` : ''}</div>
            <div className="mt-1 text-lg font-bold text-gray-900">
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            {c.discountPrice != null && Number(c.price) > 0 ? (
              <div className="text-[11px] text-gray-400 line-through">
                ₹{(Number(c.price) * (1 + Number(c.gstPercent || 0) / 100)).toFixed(2)}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
