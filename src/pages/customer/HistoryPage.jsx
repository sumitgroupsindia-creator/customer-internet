import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate, formatINR } from '../../lib/format';
import {
  Icon,
  Badge,
  Skeleton,
  EmptyState,
  StatCard,
  PageHeader,
} from '../../components/ui';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

function statusTone(s) {
  if (s === 'paid') return 'success';
  if (s === 'failed') return 'danger';
  return 'warning';
}

export default function HistoryPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['me-recharges'],
    queryFn: () => api.get('/internet/me/recharges').then((r) => r.data),
  });

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const list = items || [];

  const paid = list.filter((r) => r.paymentStatus === 'paid');
  const totalSpent = paid.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const lastRecharge = paid[0]?.createdAt;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      if (filter !== 'all' && r.paymentStatus !== filter) return false;
      if (!q) return true;
      return (
        (r.planSnapshot?.name || '').toLowerCase().includes(q) ||
        (r.receiptNo || '').toLowerCase().includes(q) ||
        (r.paymentMode || '').toLowerCase().includes(q)
      );
    });
  }, [list, filter, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Billing"
        title="Recharge History"
        subtitle="All your past recharges, receipts and payment status."
        actions={
          <Link to="/me/recharge" className="btn-primary text-sm">
            <Icon name="wallet" className="w-4 h-4" /> New recharge
          </Link>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard icon="receipt" tone="brand" label="Total recharges" value={paid.length} hint="successful payments" />
            <StatCard icon="rupee" tone="violet" label="Total paid" value={`₹${formatINR(totalSpent)}`} hint="lifetime spend" />
            <StatCard icon="clock" tone="success" label="Last recharge" value={lastRecharge ? formatDate(lastRecharge) : '—'} hint={lastRecharge ? 'most recent' : 'no recharges yet'} className="col-span-2 lg:col-span-1" />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-8">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-surface border border-line text-muted hover:text-fg hover:bg-surface-2'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plan, receipt…"
            className="input-field pl-10 py-2"
            aria-label="Search recharges"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="receipt"
              title={list.length === 0 ? 'No recharges yet' : 'No matching recharges'}
              description={list.length === 0 ? 'Your recharge history will appear here once you make a payment.' : 'Try a different filter or search term.'}
              action={
                list.length === 0 ? (
                  <Link to="/me/recharge" className="btn-primary text-sm"><Icon name="wallet" className="w-4 h-4" /> Recharge now</Link>
                ) : (
                  <button onClick={() => { setFilter('all'); setSearch(''); }} className="btn-secondary text-sm">Clear filters</button>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block card !p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-subtle">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold text-right">Amount</th>
                    <th className="px-5 py-3 font-semibold">Mode</th>
                    <th className="px-5 py-3 font-semibold">Receipt</th>
                    <th className="px-5 py-3 font-semibold">New expiry</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((r) => (
                    <tr key={r._id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-5 py-3.5 font-semibold text-fg">{r.planSnapshot?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-fg whitespace-nowrap">₹{formatINR(r.amount)}</td>
                      <td className="px-5 py-3.5 capitalize text-muted">{r.paymentMode}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted">{r.receiptNo || '—'}</td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDate(r.newExpiry)}</td>
                      <td className="px-5 py-3.5"><Badge tone={statusTone(r.paymentStatus)}>{r.paymentStatus}</Badge></td>
                      <td className="px-5 py-3.5 text-right">
                        {r.paymentStatus === 'paid' && (
                          <Link to={`/me/receipt/${r._id}`} className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium hover:underline whitespace-nowrap">
                            Receipt <Icon name="arrowRight" className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((r) => (
                <div key={r._id} className="card !p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg truncate">{r.planSnapshot?.name || 'Recharge'}</p>
                      <p className="text-xs text-subtle mt-0.5">{formatDate(r.createdAt)} · {r.paymentMode}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-fg">₹{formatINR(r.amount)}</p>
                      <Badge tone={statusTone(r.paymentStatus)} className="mt-1">{r.paymentStatus}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-line text-xs">
                    <span className="text-subtle">New expiry: <span className="text-muted font-medium">{formatDate(r.newExpiry)}</span></span>
                    {r.paymentStatus === 'paid' && (
                      <Link to={`/me/receipt/${r._id}`} className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
                        Receipt <Icon name="arrowRight" className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
