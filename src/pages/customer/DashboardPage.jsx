import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ExpiryBanner from '../../components/ExpiryBanner';
import DaysLeftRing from '../../components/DaysLeftRing';
import SupportButtons from '../../components/SupportButtons';
import { formatDate, daysLeft } from '../../lib/format';

export default function DashboardPage() {
  const { customer } = useCustomerAuth();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/internet/me').then((r) => r.data),
  });

  const c = me || customer || {};
  const plan = c.currentPlan || {};
  const days = daysLeft(c.expiryDate);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {c.name}</h1>
          <p className="text-sm text-gray-500">Customer ID: <span className="font-mono">{c.customerId}</span></p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link to="/me/history" className="btn-secondary">Recharge history</Link>
          <Link to="/me/profile" className="btn-secondary">Profile</Link>
        </div>
      </div>

      <div className="mt-6">
        <ExpiryBanner expiryDate={c.expiryDate} status={c.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Current plan</p>
              <h2 className="text-2xl font-extrabold text-gray-900">{plan.name || '—'}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                {plan.speedMbps && <span className="badge bg-brand-50 text-brand-700">⚡ {plan.speedMbps} Mbps</span>}
                {plan.durationDays && <span className="badge bg-gray-100 text-gray-700">{plan.durationDays} days</span>}
                <span className={`badge ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {c.status?.toUpperCase()}
                </span>
              </div>
            </div>
            <Link to="/me/recharge" className="btn-primary">Recharge</Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <Stat label="Activation" value={formatDate(c.activationDate)} />
            <Stat label="Expiry" value={formatDate(c.expiryDate)} />
            <Stat label="Last recharge" value={formatDate(c.lastRechargeAt)} />
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center">
          <DaysLeftRing daysLeft={days} totalDays={plan.durationDays || 30} />
          <p className="text-xs text-gray-500 mt-3">of {plan.durationDays || 30}-day cycle</p>
        </div>
      </div>

      <div className="mt-8 card">
        <h3 className="font-bold text-gray-900">Need help?</h3>
        <p className="text-sm text-gray-500 mt-1">Our support team is just a tap away.</p>
        <div className="mt-4"><SupportButtons /></div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-base font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
