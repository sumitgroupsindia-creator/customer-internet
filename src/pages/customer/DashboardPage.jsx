import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ExpiryBanner from '../../components/ExpiryBanner';
import DaysLeftRing from '../../components/DaysLeftRing';
import SupportButtons from '../../components/SupportButtons';
import { formatDate, formatINR, daysLeft } from '../../lib/format';
import {
  Icon,
  Skeleton,
  Badge,
  StatCard,
  PageHeader,
  MiniBarChart,
  ProgressBar,
  EmptyState,
} from '../../components/ui';

export default function DashboardPage() {
  const { customer } = useCustomerAuth();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/internet/me').then((r) => r.data),
  });

  const { data: recharges = [], isLoading: rechargesLoading } = useQuery({
    queryKey: ['me-recharges'],
    queryFn: () => api.get('/internet/me/recharges').then((r) => r.data),
  });

  const c = me || customer || {};
  const plan = c.currentPlan || {};
  const days = daysLeft(c.expiryDate);
  const showSkeleton = isLoading && !customer;

  const isActive = c.status === 'active';
  const cycleDays = plan.durationDays || 30;

  // Billing-cycle progress (activation → expiry)
  const elapsed = (() => {
    if (!c.activationDate || !c.expiryDate) return 0;
    const start = new Date(c.activationDate).getTime();
    const end = new Date(c.expiryDate).getTime();
    const now = Date.now();
    if (end <= start) return 0;
    return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  })();

  // Derived KPIs from recharge history
  const paid = recharges.filter((r) => r.paymentStatus === 'paid');
  const totalSpent = paid.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const recentPaid = [...paid].reverse().slice(-6);
  const chartData = recentPaid.map((r) => ({
    label: new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short' }),
    value: Number(r.amount || 0),
  }));

  const ringTone = days <= 0 ? 'danger' : days <= 2 ? 'danger' : days <= 7 ? 'warning' : 'success';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${c.name || '—'}`}
        subtitle={
          <span>
            Customer ID <span className="font-mono text-fg font-medium">{c.customerId || '—'}</span>
            {c.mobile ? <span className="text-subtle"> · {c.mobile}</span> : null}
          </span>
        }
        actions={
          <>
            <Link to="/me/history" className="btn-secondary text-sm">
              <Icon name="clock" className="w-4 h-4" /> History
            </Link>
            <Link to="/me/recharge" className="btn-primary text-sm">
              <Icon name="wallet" className="w-4 h-4" /> Recharge
            </Link>
          </>
        }
      />

      {!showSkeleton && (
        <div className="mt-6">
          <ExpiryBanner expiryDate={c.expiryDate} status={c.status} />
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {showSkeleton ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon="wifi"
              tone={isActive ? 'success' : 'danger'}
              label="Connection"
              value={isActive ? 'Active' : (c.status || 'Inactive').replace(/^\w/, (m) => m.toUpperCase())}
              hint={plan.name || 'No plan'}
            />
            <StatCard
              icon="clock"
              tone={ringTone}
              label="Days remaining"
              value={days === null ? '—' : days < 0 ? `${Math.abs(days)} overdue` : days}
              hint={`of ${cycleDays}-day cycle`}
            />
            <StatCard
              icon="gauge"
              tone="brand"
              label="Plan speed"
              value={plan.speedMbps ? `${plan.speedMbps}` : '—'}
              hint={plan.speedMbps ? 'Mbps' : 'Not set'}
            />
            <StatCard
              icon="rupee"
              tone="violet"
              label="Total paid"
              value={`₹${formatINR(totalSpent)}`}
              hint={`${paid.length} recharge${paid.length === 1 ? '' : 's'}`}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current plan hero */}
          <div className="card">
            {showSkeleton ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-16" /></div>
                <Skeleton className="h-3 w-full mt-4" />
                <div className="grid sm:grid-cols-3 gap-4 pt-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-subtle font-semibold">Current plan</p>
                    <h2 className="text-2xl font-display font-extrabold text-fg mt-1">{plan.name || '—'}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {plan.speedMbps && (
                        <Badge tone="brand"><Icon name="bolt" className="w-3.5 h-3.5" /> {plan.speedMbps} Mbps</Badge>
                      )}
                      {cycleDays && <Badge tone="neutral">{cycleDays} days</Badge>}
                      <Badge tone={isActive ? 'success' : 'danger'} dot>
                        {(c.status || 'unknown').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Link to="/me/recharge" className="btn-primary">
                    <Icon name="wallet" className="w-4 h-4" /> Recharge
                  </Link>
                </div>

                {/* Billing timeline */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-subtle mb-2">
                    <span className="inline-flex items-center gap-1.5"><Icon name="bolt" className="w-3.5 h-3.5" /> {formatDate(c.activationDate)}</span>
                    <span className="font-medium text-muted">
                      {days === null ? '' : days < 0 ? 'Expired' : `${days} day${days === 1 ? '' : 's'} left`}
                    </span>
                    <span className="inline-flex items-center gap-1.5">{formatDate(c.expiryDate)} <Icon name="calendar" className="w-3.5 h-3.5" /></span>
                  </div>
                  <ProgressBar value={elapsed} tone={ringTone} aria-label="Billing cycle progress" />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-line">
                  <Stat icon="bolt" label="Activation" value={formatDate(c.activationDate)} />
                  <Stat icon="calendar" label="Expiry" value={formatDate(c.expiryDate)} />
                  <Stat icon="refresh" label="Last recharge" value={formatDate(c.lastRechargeAt)} />
                </div>
              </>
            )}
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display font-bold text-fg flex items-center gap-2">
                <Icon name="activity" className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Recent activity
              </h3>
              {recharges.length > 0 && (
                <Link to="/me/history" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1">
                  View all <Icon name="arrowRight" className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="mt-4">
              {rechargesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : recharges.length === 0 ? (
                <EmptyState
                  className="!py-10"
                  icon="receipt"
                  title="No activity yet"
                  description="Your recharges and receipts will appear here."
                  action={<Link to="/me/recharge" className="btn-primary text-sm"><Icon name="wallet" className="w-4 h-4" /> Recharge now</Link>}
                />
              ) : (
                <ul className="divide-y divide-line -my-2">
                  {recharges.slice(0, 5).map((r) => {
                    const statusTone = r.paymentStatus === 'paid' ? 'success' : r.paymentStatus === 'failed' ? 'danger' : 'warning';
                    return (
                      <li key={r._id} className="flex items-center gap-3 py-3">
                        <span className="w-10 h-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-subtle shrink-0">
                          <Icon name="receipt" className="w-5 h-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-fg truncate">{r.planSnapshot?.name || 'Recharge'}</p>
                          <p className="text-xs text-subtle">{formatDate(r.createdAt)} · {r.paymentMode}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-fg">₹{formatINR(r.amount)}</p>
                          <Badge tone={statusTone} className="mt-0.5">{r.paymentStatus}</Badge>
                        </div>
                        {r.paymentStatus === 'paid' && (
                          <Link to={`/me/receipt/${r._id}`} className="ml-1 p-2 rounded-lg text-subtle hover:text-brand-600 hover:bg-surface-2 transition-colors shrink-0" aria-label="View receipt">
                            <Icon name="chevronRight" className="w-4 h-4" />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Days-left ring */}
          <div className="card flex flex-col items-center justify-center">
            {showSkeleton ? (
              <Skeleton className="w-36 h-36 rounded-full" />
            ) : (
              <>
                <p className="text-xs uppercase tracking-wider text-subtle font-semibold mb-3 self-start">Plan validity</p>
                <DaysLeftRing daysLeft={days} totalDays={cycleDays} />
                <p className="text-xs text-muted mt-3">of {cycleDays}-day cycle</p>
              </>
            )}
          </div>

          {/* Recent payments chart */}
          {!showSkeleton && chartData.length > 1 && (
            <div className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-fg">Recent payments</h3>
                <Icon name="trendingUp" className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-2xl font-display font-extrabold text-fg mt-2">₹{formatINR(totalSpent)}</p>
              <p className="text-xs text-subtle">lifetime across {paid.length} recharges</p>
              <div className="mt-3 text-brand-600 dark:text-brand-400">
                <MiniBarChart data={chartData} height={110} />
              </div>
            </div>
          )}

          {/* Support */}
          <div className="card">
            <h3 className="font-display font-bold text-fg flex items-center gap-2">
              <Icon name="headset" className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Need help?
            </h3>
            <p className="text-sm text-muted mt-1">Our support team is just a tap away.</p>
            <div className="mt-4">
              <SupportButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-subtle shrink-0">
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-subtle font-semibold">{label}</p>
        <p className="text-base font-semibold text-fg mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
