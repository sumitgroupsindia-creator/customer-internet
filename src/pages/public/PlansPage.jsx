import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatINR } from '../../lib/format';

export default function PlansPage() {
  const [filter, setFilter] = useState('all');

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/internet/plans').then((r) => r.data),
  });

  const filtered = useMemo(() => {
    if (!plans) return [];
    if (filter === 'all') return plans;
    return plans.filter((p) => Number(p.durationDays) === Number(filter));
  }, [plans, filter]);

  const durations = useMemo(() => {
    const set = new Set(plans?.map((p) => p.durationDays).filter(Boolean) || []);
    return [...set].sort((a, b) => a - b);
  }, [plans]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">All Plans</h1>
      <p className="text-gray-500 mt-2">Choose a duration that suits you. All plans include unlimited data and free local support.</p>

      {durations.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              filter === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
            }`}
          >
            All
          </button>
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                String(filter) === String(d) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <div className="text-gray-500">Loading…</div>}
        {filtered.map((p) => {
          const price = p.price ?? p.monthlyPrice ?? 0;
          const gst = p.gstPercent ? (price * p.gstPercent) / 100 : 0;
          return (
            <div key={p._id} className="card hover:border-brand-300 transition-colors flex flex-col">
              <div className="flex items-baseline justify-between">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                {p.speedMbps && <span className="badge bg-brand-50 text-brand-700">⚡ {p.speedMbps} Mbps</span>}
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mt-3">₹{formatINR(price + gst)}</p>
              <p className="text-sm text-gray-500">
                / {p.durationDays || 30} days {p.gstPercent ? `(incl. ${p.gstPercent}% GST)` : ''}
              </p>
              {p.description && <p className="text-sm text-gray-500 mt-3">{p.description}</p>}
              {p.features?.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2"><span className="text-brand-600">✓</span>{f}</li>
                  ))}
                </ul>
              )}
              <div className="mt-auto pt-6">
                <Link to="/enquire" className="btn-secondary w-full text-center text-sm">Get this plan</Link>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">No plans available for this duration.</div>
      )}
    </div>
  );
}
