import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate, formatINR } from '../../lib/format';

export default function HistoryPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['me-recharges'],
    queryFn: () => api.get('/internet/me/recharges').then((r) => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">Recharge History</h1>
      <p className="text-gray-500 mt-1">All your past recharges.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-2xl shadow-sm border border-gray-100">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">New expiry</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>}
            {!isLoading && items?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No recharges yet.</td></tr>
            )}
            {items?.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.planSnapshot?.name}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{formatINR(r.amount)}</td>
                <td className="px-4 py-3 capitalize">{r.paymentMode}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.receiptNo || '—'}</td>
                <td className="px-4 py-3">{formatDate(r.newExpiry)}</td>
                <td className="px-4 py-3 text-right">
                  {r.paymentStatus === 'paid' && (
                    <Link to={`/me/receipt/${r._id}`} className="text-brand-700 font-medium hover:underline">Receipt →</Link>
                  )}
                  {r.paymentStatus !== 'paid' && (
                    <span className={`badge ${r.paymentStatus === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {r.paymentStatus}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
