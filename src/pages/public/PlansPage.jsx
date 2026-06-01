import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatINR } from '../../lib/format';
import { getCyclesForPlan, cycleTotal } from '../../components/BillingCyclePicker';
import { Icon, EmptyState } from '../../components/ui';

export default function PlansPage() {
  const [filter, setFilter] = useState('all');

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/internet/plans').then((r) => r.data),
  });

  const planOptions = useMemo(() => {
    if (!plans) return [];
    return plans.flatMap((plan) => getCyclesForPlan(plan).map((cycle) => ({ plan, cycle })));
  }, [plans]);

  const filtered = useMemo(() => {
    if (filter === 'all') return planOptions;
    return planOptions.filter(({ cycle }) => Number(cycle.durationDays) === Number(filter));
  }, [planOptions, filter]);

  const durations = useMemo(() => {
    const set = new Set(planOptions.map(({ cycle }) => cycle.durationDays).filter(Boolean));
    return [...set].sort((a, b) => a - b);
  }, [planOptions]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
      <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Pricing</p>
      <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-fg mt-1">All Plans</h1>
      <p className="text-muted mt-2 max-w-2xl">Choose a duration that suits you. All plans include unlimited data and free local support.</p>

      {durations.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
          {durations.map((d) => (
            <FilterChip key={d} active={String(filter) === String(d)} onClick={() => setFilter(d)}>
              {d} days
            </FilterChip>
          ))}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <div key={i} className="card space-y-4">
              <div className="skeleton h-5 w-32" />
              <div className="skeleton h-9 w-28" />
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-9 w-full mt-4" />
            </div>
          ))}
        {filtered.map(({ plan: p, cycle }) => {
          const price = cycleTotal(cycle);
          return (
            <div key={`${p._id}-${cycle.key}`} className="card-interactive flex flex-col">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-bold text-fg">{p.name}</h3>
                {p.speedMbps && (
                  <span className="badge-brand">
                    <Icon name="bolt" className="w-3.5 h-3.5" /> {p.speedMbps} Mbps
                  </span>
                )}
              </div>
              <p className="text-3xl font-display font-extrabold text-fg mt-3">₹{formatINR(price)}</p>
              <p className="text-sm text-muted">
                / {cycle.durationDays || 30} days · {cycle.label} {cycle.gstPercent ? `(incl. ${cycle.gstPercent}% GST)` : ''}
              </p>
              {p.description && <p className="text-sm text-muted mt-3">{p.description}</p>}
              {p.features?.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <Icon name="check" className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto pt-6">
                <Link to="/enquire" className="btn-secondary w-full text-sm">Get this plan</Link>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <EmptyState icon="inbox" title="No plans available" description="There are no plans for this duration. Try another filter." />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-brand-600 text-white border-brand-600'
          : 'bg-surface text-muted border-line hover:border-brand-300 hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}
